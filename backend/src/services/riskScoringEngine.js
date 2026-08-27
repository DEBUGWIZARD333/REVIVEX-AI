import RiskEvent from '../models/RiskEvent.js';

/**
 * Extensible Risk Scorer Base Class
 */
export class RiskScorer {
  constructor({ eventType, name, calculate }) {
    this.eventType = eventType;
    this.name = name;
    this.calculate = calculate;
  }
}

/**
 * Strategy 1: Cart Abandoned Scoring
 * Low value cart (< $50) = 20
 * Medium value cart ($50 - $150) = 50
 * High value cart (> $150) = 80
 */
const cartAbandonedScorer = new RiskScorer({
  eventType: 'CART_ABANDONED',
  name: 'Cart Abandoned Scorer',
  calculate: (eventData) => {
    const amount = eventData.riskAmount || 0;
    if (amount < 50) {
      return { score: 20, ruleApplied: 'Low value cart (< $50)' };
    } else if (amount <= 150) {
      return { score: 50, ruleApplied: 'Medium value cart ($50 - $150)' };
    } else {
      return { score: 80, ruleApplied: 'High value cart (> $150)' };
    }
  },
});

/**
 * Strategy 2: Payment Failed Scoring
 * Single failure = 60
 * Multiple failures = 90
 */
const paymentFailedScorer = new RiskScorer({
  eventType: 'PAYMENT_FAILED',
  name: 'Payment Failed Scorer',
  calculate: async (eventData, failureCount = 1) => {
    if (failureCount >= 2) {
      return { score: 90, ruleApplied: `Multiple payment failures detected (Count: ${failureCount})` };
    }
    return { score: 60, ruleApplied: 'Single payment failure detected' };
  },
});

/**
 * Strategy 3: Order Cancelled Scoring
 * Normal cancellation (< $150) = 50
 * High value order cancellation (>= $150) = 95
 */
const orderCancelledScorer = new RiskScorer({
  eventType: 'ORDER_CANCELLED',
  name: 'Order Cancelled Scorer',
  calculate: (eventData) => {
    const amount = eventData.riskAmount || 0;
    if (amount >= 150) {
      return { score: 95, ruleApplied: 'High value order cancellation (>= $150)' };
    }
    return { score: 50, ruleApplied: 'Normal cancellation (< $150)' };
  },
});

/**
 * Risk Scoring Engine
 * Reusable and extensible scoring service.
 */
export class RiskScoringEngine {
  constructor() {
    this.scorers = new Map();
    // Register default scoring strategies
    this.registerScorer(cartAbandonedScorer);
    this.registerScorer(paymentFailedScorer);
    this.registerScorer(orderCancelledScorer);
  }

  /**
   * Register custom scorer strategies dynamically (Extensible Architecture)
   */
  registerScorer(scorer) {
    if (!(scorer instanceof RiskScorer)) {
      scorer = new RiskScorer(scorer);
    }
    this.scorers.set(scorer.eventType, scorer);
  }

  /**
   * Map numeric risk score to categorical Risk Level
   * LOW: 0 - 35
   * MEDIUM: 36 - 65
   * HIGH: 66 - 85
   * CRITICAL: 86 - 100
   */
  getRiskLevel(score) {
    if (score >= 86) return 'CRITICAL';
    if (score >= 66) return 'HIGH';
    if (score >= 36) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Count preceding payment failures for user/session to detect multiple failures
   */
  async countRecentPaymentFailures(userId) {
    if (!userId) return 1;
    const count = await RiskEvent.countDocuments({
      userId,
      eventType: 'PAYMENT_FAILED',
      detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    return count + 1; // Includes current attempt
  }

  /**
   * Primary Evaluation Method
   * Returns { riskScore, riskLevel, ruleApplied, eventType }
   */
  async calculateRiskScore(eventData) {
    const eventType = eventData.eventType;
    const scorer = this.scorers.get(eventType);

    if (!scorer) {
      // Default fallback if no custom scorer registered for eventType
      const fallbackScore = Math.min(100, Math.max(0, eventData.riskScore || 30));
      return {
        riskScore: fallbackScore,
        riskLevel: this.getRiskLevel(fallbackScore),
        ruleApplied: 'Default fallback risk scoring',
      };
    }

    let calculation;
    if (eventType === 'PAYMENT_FAILED') {
      const failureCount = await this.countRecentPaymentFailures(eventData.userId);
      calculation = await scorer.calculate(eventData, failureCount);
    } else {
      calculation = await scorer.calculate(eventData);
    }

    const finalScore = Math.min(100, Math.max(0, calculation.score));
    const riskLevel = this.getRiskLevel(finalScore);

    return {
      riskScore: finalScore,
      riskLevel,
      ruleApplied: calculation.ruleApplied,
    };
  }
}

// Global Singleton Instance
const riskScoringEngineInstance = new RiskScoringEngine();

export default riskScoringEngineInstance;
