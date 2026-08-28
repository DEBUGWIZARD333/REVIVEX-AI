import { LangGraphLogger } from '../utils/logger.js';

/**
 * Mock Integration 1: Email / SMS Reminder Gateway Service
 */
const mockSendReminder = async (state) => {
  const email = state.customerInfo?.email || 'customer@example.com';
  return {
    service: 'EMAIL_SMS_GATEWAY',
    actionType: 'REMINDER',
    payload: {
      recipient: email,
      template: 'cart_recovery_friendly_reminder',
      subject: 'Items waiting in your cart!',
      scheduledTime: new Date().toISOString(),
    },
    details: `Friendly recovery reminder queued for ${email}`,
  };
};

/**
 * Mock Integration 2: Coupon & Discount Code Generator Service
 */
const mockGenerateCoupon = async (state) => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const couponCode = `REVENUE15-${randomSuffix}`;
  const cartVal = state.cartValue || 0;

  return {
    service: 'PROMO_COUPON_GENERATOR',
    actionType: 'COUPON',
    payload: {
      couponCode,
      discountPercentage: 15,
      validForHours: 48,
      cartValueAtIssue: cartVal,
      appliedRule: 'CART_ABANDONED_LOYAL_CUSTOMER',
    },
    details: `Generated 15% discount coupon [${couponCode}] valid for 48 hours for cart value $${cartVal}`,
  };
};

/**
 * Mock Integration 3: Payment Gateway Retry Service
 */
const mockRetryPayment = async (state) => {
  const sessionId = state.riskEvent?.sessionId || 'SESS-84920';
  const retryUrl = `http://localhost:5173/checkout?retry=true&session=${sessionId}`;

  return {
    service: 'PAYMENT_GATEWAY_RETRY_LINK',
    actionType: 'RETRY_PAYMENT',
    payload: {
      retryUrl,
      gatewaySessionId: sessionId,
      oneClickAuthorization: true,
      expiresInMinutes: 30,
    },
    details: `Generated 1-click payment authorization retry link: ${retryUrl}`,
  };
};

/**
 * Mock Integration 4: CRM VIP Recovery Escalation Service
 */
const mockEscalateToVIPTeam = async (state) => {
  const ticketId = `TICKET-REC-${Math.floor(100000 + Math.random() * 900000)}`;
  const cartVal = state.cartValue || 0;

  return {
    service: 'CRM_VIP_ESCALATION',
    actionType: 'ESCALATION',
    payload: {
      ticketId,
      priority: 'URGENT_VIP_OUTREACH',
      assignedDepartment: 'Executive Account Recovery',
      customerLTV: state.customerHistory?.totalSpentAmount || 0,
      riskAmount: cartVal,
    },
    details: `Created urgent VIP recovery ticket [${ticketId}] for cart amount $${cartVal}`,
  };
};

/**
 * Robust Retry Mechanism Wrapper
 * Retries transient action failures up to maxRetries times with logging
 */
const executeWithRetry = async (actionFn, state, maxRetries = 3) => {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      if (attempt > 1) {
        console.log(`[ActionExecutionNode] Retry attempt ${attempt}/${maxRetries}...`);
      }
      const result = await actionFn(state);
      return {
        success: true,
        attempts: attempt,
        ...result,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[ActionExecutionNode] Attempt ${attempt} failed: ${err.message}`);
    }
  }

  return {
    success: false,
    attempts: attempt,
    error: lastError ? lastError.message : 'Action execution failed after retries',
  };
};

/**
 * Action Execution Node for LangGraph Workflow
 * 
 * Responsibilities:
 * 1. Trigger target action based on decisionType (REMINDER, COUPON, RETRY_PAYMENT, ESCALATION)
 * 2. Execute via mock integrations with automated retry mechanism (up to 3 retries)
 * 3. Generate execution result payload and update graph state
 */
export const executeActionNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('executeActionNode', state);

  try {
    const decisionType = state.decisionType || 'REMINDER';
    let targetHandler;

    switch (decisionType) {
      case 'COUPON':
        targetHandler = mockGenerateCoupon;
        break;
      case 'RETRY_PAYMENT':
        targetHandler = mockRetryPayment;
        break;
      case 'ESCALATION':
        targetHandler = mockEscalateToVIPTeam;
        break;
      case 'REMINDER':
      default:
        targetHandler = mockSendReminder;
        break;
    }

    // Execute mock integration with retry support (up to 3 retries)
    const executionOutcome = await executeWithRetry(targetHandler, state, 3);
    const durationMs = Date.now() - startTime;

    const actionResult = {
      actionType: decisionType,
      executionStatus: executionOutcome.success ? 'EXECUTED' : 'FAILED',
      attempts: executionOutcome.attempts,
      service: executionOutcome.service || 'MOCK_INTEGRATION',
      payload: executionOutcome.payload || {},
      details: executionOutcome.details || executionOutcome.error || '',
      executedAt: new Date().toISOString(),
    };

    const logMsg = `[ActionExecutionNode] Action ${decisionType} executed (${executionOutcome.attempts} attempt(s)) -> Status: ${actionResult.executionStatus}. Details: ${actionResult.details}`;

    const stateUpdate = {
      actionResult,
      status: executionOutcome.success ? 'COMPLETED' : 'FAILED',
      logs: [logMsg],
    };

    LangGraphLogger.logNodeExit('executeActionNode', stateUpdate, durationMs);
    return stateUpdate;

  } catch (error) {
    LangGraphLogger.logWorkflowError('executeActionNode', error);
    return {
      status: 'FAILED',
      error: error.message,
      logs: [`[ActionExecutionNode] Error: ${error.message}`],
    };
  }
};
