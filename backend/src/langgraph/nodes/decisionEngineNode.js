import { LangGraphLogger } from '../utils/logger.js';

/**
 * Modular Decision Rule Class
 * Easy to extend by instantiating new rules and registering with DecisionRuleRegistry.
 */
export class DecisionRule {
  constructor({ id, name, priority = 50, condition, execute }) {
    this.id = id;
    this.name = name;
    this.priority = priority; // Higher priority rules take precedence
    this.condition = condition;
    this.execute = execute;
  }
}

/**
 * Extensible Decision Rule Registry
 */
export class DecisionRuleRegistry {
  constructor() {
    this.rules = [];
    this.initializeDefaultRules();
  }

  registerRule(rule) {
    if (!(rule instanceof DecisionRule)) {
      rule = new DecisionRule(rule);
    }
    this.rules.push(rule);
    // Keep rules sorted by priority descending
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  initializeDefaultRules() {
    // Rule 1: High Value Customer -> ESCALATION (Priority: 100)
    this.registerRule({
      id: 'RULE_HIGH_VALUE_ESCALATION',
      name: 'High Value Customer Escalation',
      priority: 100,
      condition: (state) => {
        const history = state.customerHistory || {};
        const analysis = state.customerAnalysis || {};
        const cartVal = state.cartValue || 0;
        return (
          analysis.valueScore >= 70 ||
          history.isVIP ||
          history.totalSpentAmount >= 300 ||
          cartVal >= 200
        );
      },
      execute: (state) => ({
        decisionType: 'ESCALATION',
        confidenceScore: 0.95,
        reasoning: 'High value customer detected (LTV / Cart value threshold met). Flagged for priority escalation and VIP recovery.',
      }),
    });

    // Rule 2: Payment Failed -> RETRY_PAYMENT (Priority: 90)
    this.registerRule({
      id: 'RULE_PAYMENT_FAILED_RETRY',
      name: 'Payment Failed Retry Sequence',
      priority: 90,
      condition: (state) => {
        const riskEvt = state.riskEvent || {};
        return riskEvt.eventType === 'PAYMENT_FAILED';
      },
      execute: (state) => ({
        decisionType: 'RETRY_PAYMENT',
        confidenceScore: 0.92,
        reasoning: 'Payment failure detected during transaction. Initiated automated 1-click payment retry flow.',
      }),
    });

    // Rule 3: Cart Abandoned AND Loyal Customer -> COUPON (Priority: 80)
    this.registerRule({
      id: 'RULE_CART_ABANDONED_LOYAL_COUPON',
      name: 'Cart Abandoned Loyal Customer Incentive',
      priority: 80,
      condition: (state) => {
        const riskEvt = state.riskEvent || {};
        const history = state.customerHistory || {};
        const analysis = state.customerAnalysis || {};
        const isCartAbandoned = riskEvt.eventType === 'CART_ABANDONED';
        const isLoyal =
          analysis.loyaltyScore >= 50 ||
          history.totalOrders >= 2 ||
          history.successfulOrdersCount >= 2 ||
          history.isVIP;
        return isCartAbandoned && isLoyal;
      },
      execute: (state) => {
        const loyalty = state.customerAnalysis?.loyaltyScore || 50;
        return {
          decisionType: 'COUPON',
          confidenceScore: 0.88,
          reasoning: `Cart abandoned by loyal customer (Loyalty Score: ${loyalty}). Generated incentive discount coupon to complete purchase.`,
        };
      },
    });

    // Rule 4: Low Risk -> REMINDER (Priority: 10 - Fallback)
    this.registerRule({
      id: 'RULE_LOW_RISK_REMINDER',
      name: 'Low Risk Cart Reminder',
      priority: 10,
      condition: (state) => {
        const riskEvt = state.riskEvent || {};
        return (
          riskEvt.riskLevel === 'LOW' ||
          (riskEvt.riskScore && riskEvt.riskScore < 36) ||
          true // Default fallback rule
        );
      },
      execute: (state) => ({
        decisionType: 'REMINDER',
        confidenceScore: 0.82,
        reasoning: 'Low risk customer activity detected. Scheduled friendly cart recovery email reminder.',
      }),
    });
  }

  evaluate(state) {
    for (const rule of this.rules) {
      if (rule.condition(state)) {
        const result = rule.execute(state);
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          ...result,
        };
      }
    }

    return {
      ruleId: 'RULE_DEFAULT_FALLBACK',
      ruleName: 'Default Fallback Rule',
      decisionType: 'REMINDER',
      confidenceScore: 0.75,
      reasoning: 'Default fallback reminder rule evaluated.',
    };
  }
}

// Global Singleton Instance of Decision Engine
export const decisionEngineInstance = new DecisionRuleRegistry();

/**
 * Decision Engine Node for LangGraph Workflow
 * 
 * Evaluates state against prioritized rules:
 * - Cart abandoned AND loyal customer -> COUPON
 * - Payment failed -> RETRY_PAYMENT
 * - High value customer -> ESCALATION
 * - Low risk -> REMINDER
 * 
 * Output:
 * - decisionType, confidenceScore, reasoning
 */
export const decisionEngineNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('decisionEngineNode', state);

  try {
    const decisionResult = decisionEngineInstance.evaluate(state);

    const durationMs = Date.now() - startTime;
    const logMsg = `[DecisionEngineNode] Rule '${decisionResult.ruleId}' matched -> Decision: ${decisionResult.decisionType} (Confidence: ${decisionResult.confidenceScore}). Reasoning: ${decisionResult.reasoning}`;

    const stateUpdate = {
      decisionType: decisionResult.decisionType,
      confidenceScore: decisionResult.confidenceScore,
      reasoning: decisionResult.reasoning,
      logs: [logMsg],
      status: 'PROCESSING',
    };

    LangGraphLogger.logNodeExit('decisionEngineNode', stateUpdate, durationMs);
    return stateUpdate;

  } catch (error) {
    LangGraphLogger.logWorkflowError('decisionEngineNode', error);
    return {
      error: error.message,
      logs: [`[DecisionEngineNode] Error: ${error.message}`],
    };
  }
};
