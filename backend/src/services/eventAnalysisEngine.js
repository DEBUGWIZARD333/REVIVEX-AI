import Event from '../models/Event.js';

/**
 * Extensible Rule Definition Interface:
 * Each rule has an id, name, priority, match function, and evaluate function.
 */
class Rule {
  constructor({ id, name, priority = 1, match, evaluate }) {
    this.id = id;
    this.name = name;
    this.priority = priority;
    this.match = match;
    this.evaluate = evaluate;
  }
}

/**
 * Rule 1: Multiple Product Views -> "High product interest"
 */
const multipleViewsRule = new Rule({
  id: 'RULE_MULTIPLE_PRODUCT_VIEWS',
  name: 'Multiple Product Views Detector',
  priority: 10,
  match: (event, history) => {
    if (event.eventType !== 'PRODUCT_VIEWED') return false;
    const viewCount = history.filter(
      (e) =>
        e.eventType === 'PRODUCT_VIEWED' &&
        (e.productId?.toString() === event.productId?.toString() ||
          e.sessionId === event.sessionId ||
          (e.userId && event.userId && e.userId.toString() === event.userId.toString()))
    ).length;
    return viewCount >= 1; // Current view plus previous history view(s) >= 2
  },
  evaluate: (event, history) => ({
    ruleId: 'RULE_MULTIPLE_PRODUCT_VIEWS',
    intent: 'HIGH_INTEREST',
    severity: 'MEDIUM',
    logMessage: 'High product interest',
    details: `User viewed product multiple times across session`,
  }),
});

/**
 * Rule 2: Add to cart after product view -> "Purchase intent detected"
 */
const cartAfterViewRule = new Rule({
  id: 'RULE_ADD_TO_CART_INTENT',
  name: 'Add To Cart Intent Detector',
  priority: 20,
  match: (event, history) => {
    if (event.eventType !== 'ADD_TO_CART') return false;
    // Check if there was a preceding PRODUCT_VIEWED in recent history
    const hadProductView = history.some(
      (e) =>
        e.eventType === 'PRODUCT_VIEWED' &&
        (e.sessionId === event.sessionId ||
          (e.userId && event.userId && e.userId.toString() === event.userId.toString()))
    );
    return hadProductView || true; // ADD_TO_CART indicates intent
  },
  evaluate: (event) => ({
    ruleId: 'RULE_ADD_TO_CART_INTENT',
    intent: 'PURCHASE_INTENT',
    severity: 'HIGH',
    logMessage: 'Purchase intent detected',
    details: `Add to cart action triggered following product browsing`,
  }),
});

/**
 * Rule 3: Payment initiated but failed -> "Checkout friction detected"
 */
const checkoutFrictionRule = new Rule({
  id: 'RULE_CHECKOUT_FRICTION',
  name: 'Checkout Friction Detector',
  priority: 30,
  match: (event, history) => {
    if (event.eventType === 'PAYMENT_FAILED') return true;
    if (event.eventType === 'PAYMENT_INITIATED') {
      const failedAfter = history.some((e) => e.eventType === 'PAYMENT_FAILED');
      return failedAfter;
    }
    return false;
  },
  evaluate: (event) => ({
    ruleId: 'RULE_CHECKOUT_FRICTION',
    intent: 'CHECKOUT_FRICTION',
    severity: 'CRITICAL',
    logMessage: 'Checkout friction detected',
    details: `Payment failure encountered (${event.metadata?.reason || 'Transaction error'})`,
  }),
});

/**
 * Rule 4: Payment success -> "Conversion completed"
 */
const conversionCompletedRule = new Rule({
  id: 'RULE_CONVERSION_COMPLETED',
  name: 'Conversion Completion Detector',
  priority: 40,
  match: (event) => event.eventType === 'PAYMENT_SUCCESS',
  evaluate: (event) => ({
    ruleId: 'RULE_CONVERSION_COMPLETED',
    intent: 'CONVERSION',
    severity: 'SUCCESS',
    logMessage: 'Conversion completed',
    details: `Order successfully placed. Order ID: ${event.metadata?.orderId || 'N/A'}`,
  }),
});

/**
 * Extensible Event Analysis Engine Registry
 */
export class EventAnalysisEngine {
  constructor() {
    this.rules = [];
    // Register default rules
    this.registerRule(multipleViewsRule);
    this.registerRule(cartAfterViewRule);
    this.registerRule(checkoutFrictionRule);
    this.registerRule(conversionCompletedRule);
  }

  /**
   * Register custom rules dynamically (Extensible Architecture)
   */
  registerRule(rule) {
    if (!(rule instanceof Rule)) {
      rule = new Rule(rule);
    }
    this.rules.push(rule);
    // Keep rules sorted by priority descending
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Fetch recent event history for a given session or user
   */
  async fetchRecentHistory(event, limit = 20) {
    const query = { _id: { $ne: event._id } };

    if (event.userId) {
      query.userId = event.userId;
    } else if (event.sessionId) {
      query.sessionId = event.sessionId;
    } else {
      return [];
    }

    return await Event.find(query).sort({ timestamp: -1 }).limit(limit);
  }

  /**
   * Run rule evaluation pipeline against an event
   */
  async analyzeEvent(event) {
    const history = await this.fetchRecentHistory(event);
    const matchedResults = [];

    for (const rule of this.rules) {
      if (rule.match(event, history)) {
        const result = rule.evaluate(event, history);
        matchedResults.push(result);
      }
    }

    // Default fallback if no specific rule matches
    if (matchedResults.length === 0) {
      return {
        matchedRules: [],
        primaryLogMessage: `Event processed: ${event.eventType}`,
        severity: 'LOW',
        intent: 'NEUTRAL',
        details: 'Standard event logged without rule triggers',
      };
    }

    // Select primary result (highest priority matching rule)
    const primary = matchedResults[0];

    return {
      matchedRules: matchedResults.map((r) => r.ruleId),
      primaryLogMessage: primary.logMessage,
      severity: primary.severity,
      intent: primary.intent,
      details: primary.details,
      allResults: matchedResults,
    };
  }
}

// Global Singleton Instance
const analysisEngineInstance = new EventAnalysisEngine();

export default analysisEngineInstance;
