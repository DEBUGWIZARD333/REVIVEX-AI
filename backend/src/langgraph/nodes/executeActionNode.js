import { LangGraphLogger } from '../utils/logger.js';

export const executeActionNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('executeActionNode', state);

  try {
    const decisionType = state.decisionType || 'REMINDER';
    const cartValue = state.cartValue || 0;
    let actionResult = {};

    switch (decisionType) {
      case 'COUPON':
        actionResult = {
          action: 'GENERATE_COUPON',
          couponCode: 'REVENUE15',
          discountPercent: 15,
          expiresInHours: 48,
          description: `Generated 15% discount coupon (REVENUE15) for cart value $${cartValue}`,
        };
        break;

      case 'RETRY_PAYMENT':
        actionResult = {
          action: 'PAYMENT_RETRY_LINK',
          retryUrl: 'http://localhost:5173/checkout?retry=true',
          description: 'Generated seamless payment retry link with 1-click authorization',
        };
        break;

      case 'ESCALATION':
        actionResult = {
          action: 'FLAG_FOR_HUMAN_INTERVENTION',
          priority: 'URGENT',
          assignedTeam: 'Customer Success Recovery',
          description: `High value order cancellation ($${cartValue}) flagged for urgent VIP phone outreach`,
        };
        break;

      case 'REMINDER':
      default:
        actionResult = {
          action: 'SEND_REMINDER_EMAIL',
          template: 'cart_abandonment_friendly_reminder',
          description: 'Queued friendly cart recovery email reminder',
        };
        break;
    }

    const duration = Date.now() - startTime;
    const logMsg = `Executed action for ${decisionType}: ${actionResult.description}`;
    LangGraphLogger.logNodeExit('executeActionNode', { actionResult }, duration);

    return {
      actionResult,
      status: 'COMPLETED',
      logs: [logMsg],
    };
  } catch (err) {
    LangGraphLogger.logWorkflowError('executeActionNode', err);
    return {
      status: 'FAILED',
      error: err.message,
      logs: [`Error in executeActionNode: ${err.message}`],
    };
  }
};
