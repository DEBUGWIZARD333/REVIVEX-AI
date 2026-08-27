import Order from '../models/Order.js';
import Event from '../models/Event.js';
import RiskEvent from '../models/RiskEvent.js';
import riskConfigService from './riskConfigService.js';

/**
 * Create a new Order in MongoDB
 */
export const createOrder = async (orderData) => {
  const order = new Order(orderData);
  return await order.save();
};

/**
 * Get orders for user
 */
export const getOrdersByUserId = async (userId) => {
  return await Order.find({ userId })
    .populate('items.product', 'name price category')
    .sort({ createdAt: -1 });
};

/**
 * Core Order Cancellation Detector logic:
 * Triggered when Order status changes to CANCELLED.
 * Links with order collection, calculates cancelled value, stores cancellation timestamp, and generates RiskEvent.
 */
export const cancelOrderAndCreateRisk = async (orderIdentifier, reason = 'Customer requested cancellation') => {
  // Find order by orderId or _id
  let query = { orderId: orderIdentifier };
  if (orderIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
    query = { $or: [{ orderId: orderIdentifier }, { _id: orderIdentifier }] };
  }

  const order = await Order.findOne(query);

  if (!order) {
    throw new Error(`Order '${orderIdentifier}' not found`);
  }

  if (order.status === 'CANCELLED') {
    return {
      success: true,
      alreadyCancelled: true,
      order,
      message: 'Order was already cancelled',
    };
  }

  // 1. Update order status to CANCELLED and record cancellation timestamp
  const cancellationTimestamp = new Date();
  order.status = 'CANCELLED';
  order.cancellationReason = reason;
  order.cancelledAt = cancellationTimestamp;
  await order.save();

  // 2. Calculate cancelled order value
  const cancelledOrderValue = parseFloat(order.totalAmount.toFixed(2));

  // 3. Generate risk reason
  const riskReason = `Order ${order.orderId} ($${cancelledOrderValue.toFixed(
    2
  )} total) was CANCELLED post-checkout. Reason: ${reason}`;

  // 4. Prevent duplicate RiskEvents for the same orderId
  let existingRiskEvent = await RiskEvent.findOne({
    eventType: 'ORDER_CANCELLED',
    relatedOrderId: order.orderId,
  });

  if (existingRiskEvent) {
    return {
      success: true,
      duplicate: true,
      order,
      riskEvent: existingRiskEvent,
      message: 'Order cancelled; risk event already existed',
    };
  }

  // 5. Evaluate and create RiskEvent using RiskConfigService
  const evalResult = await riskConfigService.evaluateAndCreateRiskEvent({
    userId: order.userId,
    eventType: 'ORDER_CANCELLED',
    riskAmount: cancelledOrderValue,
    riskReason,
    relatedOrderId: order.orderId,
    detectedAt: cancellationTimestamp,
  });

  // 6. Log telemetry event in Event collection
  await Event.create({
    eventType: 'PAYMENT_FAILED', // or custom event telemetry
    userId: order.userId,
    metadata: {
      orderId: order.orderId,
      cancelledAmount: cancelledOrderValue,
      cancellationReason: reason,
      cancelledAt: cancellationTimestamp,
    },
    timestamp: cancellationTimestamp,
  });

  return {
    success: true,
    cancelledAt: cancellationTimestamp,
    order,
    riskEvent: evalResult.riskEvent || null,
    isHighRisk: evalResult.isHighRisk || false,
  };
};
