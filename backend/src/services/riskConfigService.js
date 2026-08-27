import dotenv from 'dotenv';
import * as riskEventService from './riskEventService.js';
import riskScoringEngine from './riskScoringEngine.js';

dotenv.config();

/**
 * Extensible Risk Rule Class
 */
export class RiskRule {
  constructor({ id, name, description, eventType, baseWeight, match, calculateScore }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.eventType = eventType;
    this.baseWeight = baseWeight;
    this.match = match;
    this.calculateScore = calculateScore;
  }
}

/**
 * Risk Configuration Service
 * Reads environment variables, manages risk weights & threshold values,
 * and provides extensible rule evaluation routines.
 */
export class RiskConfigService {
  constructor() {
    this.loadEnvironmentConfig();
    this.rules = [];
    this.initializeDefaultRules();
  }

  /**
   * Load environment-based configuration parameters with fallbacks
   */
  loadEnvironmentConfig() {
    this.config = {
      cartAbandonmentMinutes: parseInt(process.env.CART_ABANDONMENT_MINUTES, 10) || 30,
      riskWeights: {
        CART_ABANDONED: parseInt(process.env.RISK_WEIGHT_CART_ABANDONED, 10) || 45,
        PAYMENT_FAILED: parseInt(process.env.RISK_WEIGHT_PAYMENT_FAILED, 10) || 85,
        ORDER_CANCELLED: parseInt(process.env.RISK_WEIGHT_ORDER_CANCELLED, 10) || 70,
      },
      thresholds: {
        highRiskScore: parseInt(process.env.HIGH_RISK_THRESHOLD, 10) || 75,
        criticalAmount: parseFloat(process.env.CRITICAL_AMOUNT_THRESHOLD) || 150.0,
      },
    };
  }

  /**
   * Initialize default 3 required risk rules
   */
  initializeDefaultRules() {
    // Rule 1: Cart abandoned for more than 30 minutes
    const cartAbandonmentRule = new RiskRule({
      id: 'RULE_CART_ABANDONED_30M',
      name: 'Cart Abandoned > 30 Minutes',
      description: `Cart inactive for more than ${this.config.cartAbandonmentMinutes} minutes without completed checkout`,
      eventType: 'CART_ABANDONED',
      baseWeight: this.config.riskWeights.CART_ABANDONED,
      match: (eventData) => {
        if (eventData.eventType !== 'CART_ABANDONED') return false;
        const idleMinutes = eventData.idleMinutes || 35;
        return idleMinutes >= this.config.cartAbandonmentMinutes;
      },
      calculateScore: (eventData) => {
        const base = this.config.riskWeights.CART_ABANDONED;
        const amountMultiplier = (eventData.riskAmount || 0) > 100 ? 1.2 : 1.0;
        return Math.min(100, Math.round(base * amountMultiplier));
      },
    });

    // Rule 2: Payment failure detected
    const paymentFailureRule = new RiskRule({
      id: 'RULE_PAYMENT_FAILURE_DETECTED',
      name: 'Payment Failure Detected',
      description: 'Transaction attempt failed during checkout processing',
      eventType: 'PAYMENT_FAILED',
      baseWeight: this.config.riskWeights.PAYMENT_FAILED,
      match: (eventData) => eventData.eventType === 'PAYMENT_FAILED',
      calculateScore: (eventData) => {
        const base = this.config.riskWeights.PAYMENT_FAILED;
        return Math.min(100, base);
      },
    });

    // Rule 3: Order cancelled after checkout
    const orderCancelledRule = new RiskRule({
      id: 'RULE_ORDER_CANCELLED_AFTER_CHECKOUT',
      name: 'Order Cancelled Post-Checkout',
      description: 'Order was placed but subsequently cancelled by user or system',
      eventType: 'ORDER_CANCELLED',
      baseWeight: this.config.riskWeights.ORDER_CANCELLED,
      match: (eventData) => eventData.eventType === 'ORDER_CANCELLED',
      calculateScore: (eventData) => {
        const base = this.config.riskWeights.ORDER_CANCELLED;
        return Math.min(100, base);
      },
    });

    this.registerRule(cartAbandonmentRule);
    this.registerRule(paymentFailureRule);
    this.registerRule(orderCancelledRule);
  }

  /**
   * Register custom rules dynamically (Extensible Architecture)
   */
  registerRule(rule) {
    if (!(rule instanceof RiskRule)) {
      rule = new RiskRule(rule);
    }
    this.rules.push(rule);
  }

  /**
   * Get active risk configuration and thresholds
   */
  getConfig() {
    return {
      ...this.config,
      activeRules: this.rules.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        eventType: r.eventType,
        baseWeight: r.baseWeight,
      })),
    };
  }

  /**
   * Update configuration dynamically at runtime
   */
  updateConfig(updates = {}) {
    if (updates.cartAbandonmentMinutes) {
      this.config.cartAbandonmentMinutes = parseInt(updates.cartAbandonmentMinutes, 10);
    }
    if (updates.riskWeights) {
      this.config.riskWeights = { ...this.config.riskWeights, ...updates.riskWeights };
    }
    if (updates.thresholds) {
      this.config.thresholds = { ...this.config.thresholds, ...updates.thresholds };
    }

    // Re-initialize default rule weights
    this.rules = [];
    this.initializeDefaultRules();

    return this.getConfig();
  }

  /**
   * Evaluate incoming event against configured risk rules and calculate risk score & level
   */
  async evaluateAndCreateRiskEvent(eventData) {
    const matchedRules = [];
    let primaryReason = 'Risk criteria matched';

    for (const rule of this.rules) {
      if (rule.match(eventData)) {
        matchedRules.push(rule);
        primaryReason = `${rule.name}: ${rule.description}`;
      }
    }

    if (matchedRules.length === 0) {
      return { matched: false, message: 'No risk rule matched' };
    }

    // Calculate score & level using Risk Scoring Engine
    const scoringResult = await riskScoringEngine.calculateRiskScore(eventData);

    // Create risk payload
    const riskPayload = {
      userId: eventData.userId || null,
      eventType: eventData.eventType,
      riskScore: scoringResult.riskScore,
      riskLevel: scoringResult.riskLevel,
      riskAmount: eventData.riskAmount || 0,
      riskReason: eventData.riskReason || primaryReason,
      relatedOrderId: eventData.relatedOrderId || null,
      relatedCartId: eventData.relatedCartId || null,
      status: 'OPEN',
      detectedAt: eventData.detectedAt ? new Date(eventData.detectedAt) : new Date(),
    };

    const savedRiskEvent = await riskEventService.createRiskEvent(riskPayload);

    return {
      matched: true,
      matchedRules: matchedRules.map((r) => r.id),
      scoringResult,
      isHighRisk: scoringResult.riskScore >= this.config.thresholds.highRiskScore,
      riskEvent: savedRiskEvent,
    };
  }
}

// Global Singleton Instance
const riskConfigServiceInstance = new RiskConfigService();

export default riskConfigServiceInstance;
