import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Cart from '../../models/Cart.js';
import Order from '../../models/Order.js';
import RiskEvent from '../../models/RiskEvent.js';
import mongoose from 'mongoose';
import { LangGraphLogger } from '../utils/logger.js';

/**
 * DetectRisk Node
 * 
 * Input:
 * - Risk Event (state.riskEvent or state.riskEventId)
 * 
 * Responsibilities:
 * 1. Validate input (check Risk Event existence and required fields)
 * 2. Load customer information (User profile: name, email, created date)
 * 3. Load cart information (Active Cart items & computed cart total)
 * 4. Load purchase history (Previous orders, total spend, cancellation count)
 * 5. Update graph state with enriched context
 * 
 * Output:
 * - Enriched State Object
 */
export const detectRiskNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('detectRiskNode', state);

  try {
    let riskEvent = state.riskEvent || null;
    const riskEventId = state.riskEventId || (riskEvent ? riskEvent._id : null);

    // 1. Input Validation
    if (!riskEvent && riskEventId && mongoose.Types.ObjectId.isValid(riskEventId)) {
      riskEvent = await RiskEvent.findById(riskEventId).populate('userId');
    }

    if (!riskEvent) {
      throw new Error('Input validation failed: Valid riskEvent or riskEventId is required');
    }

    const userId = riskEvent.userId?._id || riskEvent.userId || state.userId || null;
    const eventType = riskEvent.eventType || 'CART_ABANDONED';
    const riskAmount = riskEvent.riskAmount || state.cartValue || 0;
    const riskReason = riskEvent.riskReason || 'Risk detected';

    // 2. Load Customer Information
    let customerInfo = {
      name: 'Guest User',
      email: 'guest@example.com',
      registeredAt: null,
      isRegistered: false,
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const userDoc = await User.findById(userId).select('name email role createdAt');
      if (userDoc) {
        customerInfo = {
          userId: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          registeredAt: userDoc.createdAt,
          isRegistered: true,
        };
      }
    }

    // 3. Load Cart Information
    let cartItems = [];
    let cartTotal = 0;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const cartDocs = await Cart.find({ userId }).populate('productId', 'name price category');
      cartItems = cartDocs.map((c) => ({
        cartId: c._id,
        productId: c.productId?._id,
        productName: c.productId?.name || 'Item',
        price: c.productId?.price || 0,
        quantity: c.quantity,
        subtotal: (c.productId?.price || 0) * c.quantity,
        updatedAt: c.updatedAt,
      }));

      cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    }

    const computedCartValue = cartTotal > 0 ? cartTotal : riskAmount;

    // 4. Load Purchase History
    let purchaseHistory = {
      totalOrders: 0,
      successfulOrdersCount: 0,
      cancelledOrdersCount: 0,
      totalSpentAmount: 0,
      recentOrders: [],
      isHighValueCustomer: false,
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });

      const successfulOrders = orders.filter((o) => o.status !== 'CANCELLED');
      const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');
      const totalSpent = successfulOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      purchaseHistory = {
        totalOrders: orders.length,
        successfulOrdersCount: successfulOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalSpentAmount: parseFloat(totalSpent.toFixed(2)),
        isHighValueCustomer: totalSpent >= 250 || successfulOrders.length >= 3,
        recentOrders: orders.slice(0, 5).map((o) => ({
          orderId: o.orderId,
          totalAmount: o.totalAmount,
          status: o.status,
          date: o.createdAt,
        })),
      };
    }

    // 5. Build Enriched Output State
    const durationMs = Date.now() - startTime;
    const logMessage = `[DetectRiskNode] Enriched state for ${customerInfo.email} (${eventType}): Cart $${computedCartValue}, LTV: $${purchaseHistory.totalSpentAmount}`;
    
    const stateUpdate = {
      userId,
      riskEventId: riskEvent._id || riskEventId,
      riskEvent,
      customerInfo,
      cartInfo: {
        itemCount: cartItems.length,
        cartItems,
        cartTotal: computedCartValue,
      },
      customerHistory: {
        ...purchaseHistory,
        isVIP: purchaseHistory.isHighValueCustomer,
      },
      previousPurchases: purchaseHistory.recentOrders,
      cartValue: computedCartValue,
      riskReason,
      isInputValid: true,
      logs: [logMessage],
      status: 'PROCESSING',
    };

    LangGraphLogger.logNodeExit('detectRiskNode', stateUpdate, durationMs);
    return stateUpdate;

  } catch (error) {
    LangGraphLogger.logWorkflowError('detectRiskNode', error);

    return {
      isInputValid: false,
      error: error.message,
      status: 'FAILED',
      logs: [`[DetectRiskNode] Error: ${error.message}`],
    };
  }
};
