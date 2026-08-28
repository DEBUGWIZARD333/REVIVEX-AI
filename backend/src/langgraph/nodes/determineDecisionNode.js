import { LangGraphLogger } from '../utils/logger.js';

/**
 * Rules for Decision Determination:
 * - PAYMENT_FAILED -> RETRY_PAYMENT (confidence 0.90)
 * - CART_ABANDONED & cartValue >= 100 or VIP -> COUPON (confidence 0.88)
 * - CART_ABANDONED & cartValue < 100 -> REMINDER (confidence 0.82)
 * - ORDER_CANCELLED & High Value (>= 150) -> ESCALATION (confidence 0.95)
 * - ORDER_CANCELLED & Normal Value -> REMINDER (confidence 0.80)
 */
export const determineDecisionNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('determineDecisionNode', state);

  try {
    const riskEvent = state.riskEvent || {};
    const eventType = riskEvent.eventType || 'CART_ABANDONED';
    const cartValue = state.cartValue || 0;
    const history = state.customerHistory || {};

    let decisionType = 'REMINDER';
    let confidenceScore = 0.80;

    if (eventType === 'PAYMENT_FAILED') {
      decisionType = 'RETRY_PAYMENT';
      confidenceScore = 0.90;
    } else if (eventType === 'CART_ABANDONED') {
      if (cartValue >= 100 || history.isVIP) {
        decisionType = 'COUPON';
        confidenceScore = 0.88;
      } else {
        decisionType = 'REMINDER';
        confidenceScore = 0.82;
      }
    } else if (eventType === 'ORDER_CANCELLED') {
      if (cartValue >= 150 || history.isVIP) {
        decisionType = 'ESCALATION';
        confidenceScore = 0.95;
      } else {
        decisionType = 'REMINDER';
        confidenceScore = 0.80;
      }
    }

    const duration = Date.now() - startTime;
    const logMsg = `Determined Decision: ${decisionType} with confidence score ${confidenceScore}`;
    LangGraphLogger.logNodeExit('determineDecisionNode', { decisionType, confidenceScore }, duration);

    return {
      decisionType,
      confidenceScore,
      logs: [logMsg],
    };
  } catch (err) {
    LangGraphLogger.logWorkflowError('determineDecisionNode', err);
    return {
      error: err.message,
      logs: [`Error in determineDecisionNode: ${err.message}`],
    };
  }
};
