import RiskEvent from '../models/RiskEvent.js';
import riskConfigService from './riskConfigService.js';

let totalPaymentFailuresDetected = 0;

/**
 * Handle and evaluate PAYMENT_FAILED events
 */
export const handlePaymentFailureEvent = async (event) => {
  if (!event || event.eventType !== 'PAYMENT_FAILED') {
    return { success: false, message: 'Not a PAYMENT_FAILED event' };
  }

  const userId = event.userId?._id || event.userId || null;
  const sessionId = event.sessionId || null;
  const metadata = event.metadata || {};

  // Extract transaction value at risk
  const failedTransactionValue = parseFloat(
    metadata.amount || metadata.grandTotal || metadata.totalAmount || 0
  );

  const paymentMethod = metadata.paymentMethod || 'Credit/Debit Card';
  const reasonDetails = metadata.reason || metadata.error || 'Card processing error / Gateway timeout';

  // Format failure reason description
  const failureReason = `Payment failure ($${failedTransactionValue.toFixed(
    2
  )} transaction via ${paymentMethod}). Reason: ${reasonDetails}`;

  // Deduplication Check: Prevent duplicate RiskEvents for same user/session within 15 minutes
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const existingRiskQuery = {
    eventType: 'PAYMENT_FAILED',
    detectedAt: { $gte: fifteenMinsAgo },
  };

  if (userId) {
    existingRiskQuery.userId = userId;
  } else if (sessionId) {
    existingRiskQuery.riskReason = new RegExp(sessionId, 'i');
  }

  const existingDuplicate = await RiskEvent.findOne(existingRiskQuery);

  if (existingDuplicate) {
    return {
      success: true,
      duplicate: true,
      message: 'Duplicate payment failure risk event suppressed',
      riskEvent: existingDuplicate,
    };
  }

  // Calculate risk score and evaluate using RiskConfigService
  const evalResult = await riskConfigService.evaluateAndCreateRiskEvent({
    userId,
    eventType: 'PAYMENT_FAILED',
    riskAmount: failedTransactionValue,
    riskReason: failureReason,
    relatedOrderId: metadata.orderId || null,
    detectedAt: event.timestamp || new Date(),
  });

  if (evalResult.matched && evalResult.riskEvent) {
    totalPaymentFailuresDetected++;
    return {
      success: true,
      duplicate: false,
      isHighRisk: evalResult.isHighRisk,
      riskEvent: evalResult.riskEvent,
    };
  }

  return { success: false, message: 'Failed to create payment failure risk event' };
};

export const getPaymentFailureStats = () => {
  return {
    totalPaymentFailuresDetected,
  };
};
