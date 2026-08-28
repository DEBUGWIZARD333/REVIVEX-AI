import { LangGraphLogger } from '../utils/logger.js';

export const evaluateRiskContextNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('evaluateRiskContextNode', state);

  try {
    const riskEvent = state.riskEvent || {};
    const cartValue = state.cartValue || riskEvent.riskAmount || 0;
    const riskReason = state.riskReason || riskEvent.riskReason || 'High risk trigger';

    const duration = Date.now() - startTime;
    const logMsg = `Evaluated risk context: ${riskEvent.eventType || 'UNKNOWN'}, cartValue: $${cartValue}`;
    LangGraphLogger.logNodeExit('evaluateRiskContextNode', { cartValue, riskReason }, duration);

    return {
      cartValue: parseFloat(cartValue),
      riskReason,
      logs: [logMsg],
    };
  } catch (err) {
    LangGraphLogger.logWorkflowError('evaluateRiskContextNode', err);
    return {
      error: err.message,
      logs: [`Error in evaluateRiskContextNode: ${err.message}`],
    };
  }
};
