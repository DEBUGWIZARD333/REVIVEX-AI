import Cart from '../models/Cart.js';
import Event from '../models/Event.js';
import RiskEvent from '../models/RiskEvent.js';
import riskConfigService from './riskConfigService.js';

let isJobRunning = false;
let jobIntervalId = null;
let lastRunTime = null;
let totalAbandonedCartsDetected = 0;

/**
 * Core Cart Abandonment Detection Logic
 */
export const detectAbandonedCarts = async (abandonmentMinutesOverride = null) => {
  const config = riskConfigService.getConfig();
  const minutes = abandonmentMinutesOverride || config.cartAbandonmentMinutes || 30;
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - minutes * 60 * 1000);

  // 1. Efficient aggregation pipeline to group cart items by userId for idle carts
  const idleCartGroups = await Cart.aggregate([
    {
      $match: {
        updatedAt: { $lte: cutoffDate },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $group: {
        _id: '$userId',
        cartItems: {
          $push: {
            cartId: '$_id',
            quantity: '$quantity',
            price: '$productDetails.price',
            productName: '$productDetails.name',
            updatedAt: '$updatedAt',
          },
        },
        totalQuantity: { $sum: '$quantity' },
        cartTotalAmount: {
          $sum: { $multiply: ['$quantity', '$productDetails.price'] },
        },
        lastActivityDate: { $max: '$updatedAt' },
      },
    },
  ]);

  if (idleCartGroups.length === 0) {
    lastRunTime = new Date();
    return {
      success: true,
      detectedCount: 0,
      message: 'No abandoned carts detected',
      timestamp: lastRunTime,
    };
  }

  const detectedRiskEvents = [];

  for (const group of idleCartGroups) {
    const userId = group._id;
    const cartTotalAmount = parseFloat(group.cartTotalAmount.toFixed(2));
    const totalQuantity = group.totalQuantity;

    // 2. Check if a checkout or payment success occurred after the cart's last activity
    const recentCheckoutOrPayment = await Event.findOne({
      userId,
      eventType: { $in: ['CHECKOUT_STARTED', 'PAYMENT_SUCCESS'] },
      timestamp: { $gte: group.lastActivityDate },
    });

    if (recentCheckoutOrPayment) {
      // User proceeded to checkout/payment; skip marking as abandoned
      continue;
    }

    // 3. Prevent duplicate RiskEvents for the same user cart within 24 hours
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const existingOpenRiskEvent = await RiskEvent.findOne({
      userId,
      eventType: 'CART_ABANDONED',
      status: { $in: ['OPEN', 'REVIEWED'] },
      detectedAt: { $gte: yesterday },
    });

    if (existingOpenRiskEvent) {
      // Risk event already created and pending; skip creating duplicate
      continue;
    }

    // Calculate idle duration in minutes
    const idleMs = now.getTime() - new Date(group.lastActivityDate).getTime();
    const idleMinutes = Math.round(idleMs / (1000 * 60));

    // Generate informative riskReason and calculate riskScore
    const riskReason = `Cart containing ${totalQuantity} item(s) ($${cartTotalAmount.toFixed(
      2
    )} total) inactive for ${idleMinutes} minutes without checkout`;

    const sampleCartId = group.cartItems[0]?.cartId || null;

    // Evaluate risk event payload using riskConfigService
    const evalResult = await riskConfigService.evaluateAndCreateRiskEvent({
      userId,
      eventType: 'CART_ABANDONED',
      riskAmount: cartTotalAmount,
      riskReason,
      relatedCartId: sampleCartId,
      idleMinutes,
      detectedAt: now,
    });

    if (evalResult.matched && evalResult.riskEvent) {
      detectedRiskEvents.push(evalResult.riskEvent);
      totalAbandonedCartsDetected++;
    }
  }

  lastRunTime = new Date();

  return {
    success: true,
    detectedCount: detectedRiskEvents.length,
    detectedRiskEvents,
    timestamp: lastRunTime,
  };
};

/**
 * Scheduled Job Runner Support
 */
export const startAbandonmentDetectorJob = (intervalMinutes = 10) => {
  if (isJobRunning) {
    return { success: false, message: 'Cart Abandonment Detector Job is already running' };
  }

  isJobRunning = true;
  const intervalMs = intervalMinutes * 60 * 1000;

  jobIntervalId = setInterval(async () => {
    try {
      console.log('[CartAbandonmentDetectorJob] Running periodic check...');
      await detectAbandonedCarts();
    } catch (err) {
      console.error('[CartAbandonmentDetectorJob] Error during execution:', err.message);
    }
  }, intervalMs);

  console.log(`[CartAbandonmentDetectorJob] Started scheduled job (every ${intervalMinutes} mins)`);
  return {
    success: true,
    message: `Cart Abandonment Detector Job started (Interval: ${intervalMinutes} mins)`,
  };
};

export const stopAbandonmentDetectorJob = () => {
  if (!isJobRunning) {
    return { success: false, message: 'Cart Abandonment Detector Job is not running' };
  }

  if (jobIntervalId) {
    clearInterval(jobIntervalId);
    jobIntervalId = null;
  }
  isJobRunning = false;

  console.log('[CartAbandonmentDetectorJob] Stopped scheduled job');
  return { success: true, message: 'Cart Abandonment Detector Job stopped' };
};

export const getAbandonmentDetectorStatus = () => {
  return {
    isJobRunning,
    lastRunTime,
    totalAbandonedCartsDetected,
  };
};
