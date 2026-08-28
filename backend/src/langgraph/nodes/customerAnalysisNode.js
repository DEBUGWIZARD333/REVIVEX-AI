import { LangGraphLogger } from '../utils/logger.js';

/**
 * Extensible Customer Analysis Strategy Interface
 * Allows seamless integration of rule-based analysis now and future AI/ML models later.
 */
export class CustomerAnalysisStrategy {
  analyze(context) {
    throw new Error('CustomerAnalysisStrategy.analyze must be implemented');
  }
}

/**
 * Default Rule-Based Customer Analysis Strategy
 */
export class RuleBasedCustomerAnalysisStrategy extends CustomerAnalysisStrategy {
  analyze(context) {
    const { customerHistory = {}, cartValue = 0, cartInfo = {}, riskEvent = {} } = context;
    
    const totalSpent = customerHistory.totalSpentAmount || customerHistory.totalSpent || 0;
    const totalOrders = customerHistory.totalOrders || 0;
    const successfulOrders = customerHistory.successfulOrdersCount || (totalOrders - (customerHistory.cancelledCount || 0));
    const cancelledCount = customerHistory.cancelledCount || customerHistory.cancelledOrdersCount || 0;
    const isRegistered = customerHistory.isRegistered ?? true;

    // 1. Calculate Customer Value Score (0 - 100)
    let valueScore = 20; // Base score
    if (totalSpent >= 500) valueScore += 45;
    else if (totalSpent >= 200) valueScore += 30;
    else if (totalSpent >= 50) valueScore += 15;

    if (cartValue >= 150) valueScore += 35;
    else if (cartValue >= 50) valueScore += 20;

    const avgOrderValue = successfulOrders > 0 ? totalSpent / successfulOrders : 0;
    if (avgOrderValue >= 75) valueScore += 20;
    valueScore = Math.min(100, Math.max(0, Math.round(valueScore)));

    // 2. Calculate Loyalty Score (0 - 100)
    let loyaltyScore = 15; // Base score
    if (successfulOrders >= 5) loyaltyScore += 45;
    else if (successfulOrders >= 2) loyaltyScore += 30;
    else if (successfulOrders === 1) loyaltyScore += 15;

    if (isRegistered) loyaltyScore += 20;

    const cancellationRatio = totalOrders > 0 ? cancelledCount / totalOrders : 0;
    if (cancellationRatio === 0 && totalOrders > 0) loyaltyScore += 20;
    else if (cancellationRatio <= 0.25) loyaltyScore += 10;
    else if (cancellationRatio > 0.5) loyaltyScore -= 20;

    loyaltyScore = Math.min(100, Math.max(0, Math.round(loyaltyScore)));

    // 3. Calculate Purchase Intent Score (0 - 100)
    let intentScore = 30; // Base score
    if (cartInfo.itemCount > 0 || cartValue > 0) intentScore += 35;
    if (cartValue >= 100) intentScore += 25;

    const eventType = riskEvent.eventType || '';
    if (eventType === 'CART_ABANDONED') intentScore += 10; // Active intent prior to dropoff
    if (eventType === 'PAYMENT_FAILED') intentScore += 20; // High intent, technical friction

    intentScore = Math.min(100, Math.max(0, Math.round(intentScore)));

    // Determine Customer Segment Category
    let customerSegment = 'STANDARD';
    if (valueScore >= 75 || loyaltyScore >= 75) customerSegment = 'VIP';
    else if (valueScore >= 50) customerSegment = 'GROWTH';
    else if (intentScore >= 75) customerSegment = 'HIGH_INTENT_PROSPECT';

    const summary = `Customer Segment: ${customerSegment} | Value Score: ${valueScore}, Loyalty: ${loyaltyScore}, Intent: ${intentScore}`;

    return {
      valueScore,
      loyaltyScore,
      intentScore,
      customerSegment,
      analysisSummary: summary,
      metrics: {
        totalSpent,
        totalOrders,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        cancellationRatio: parseFloat(cancellationRatio.toFixed(2)),
      },
    };
  }
}

/**
 * Extensible Customer Analysis Engine Wrapper
 */
export class CustomerAnalysisEngine {
  constructor(strategy = new RuleBasedCustomerAnalysisStrategy()) {
    this.strategy = strategy;
  }

  setStrategy(newStrategy) {
    this.strategy = newStrategy;
  }

  runAnalysis(context) {
    return this.strategy.analyze(context);
  }
}

const globalAnalysisEngine = new CustomerAnalysisEngine();

/**
 * Customer Analysis Node for LangGraph
 */
export const customerAnalysisNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('customerAnalysisNode', state);

  try {
    const context = {
      customerHistory: state.customerHistory || {},
      previousPurchases: state.previousPurchases || [],
      cartValue: state.cartValue || 0,
      cartInfo: state.cartInfo || {},
      riskEvent: state.riskEvent || {},
    };

    const customerAnalysis = globalAnalysisEngine.runAnalysis(context);

    const durationMs = Date.now() - startTime;
    const logMsg = `[CustomerAnalysisNode] ${customerAnalysis.analysisSummary}`;

    const stateUpdate = {
      customerAnalysis,
      logs: [logMsg],
      status: 'PROCESSING',
    };

    LangGraphLogger.logNodeExit('customerAnalysisNode', stateUpdate, durationMs);
    return stateUpdate;

  } catch (error) {
    LangGraphLogger.logWorkflowError('customerAnalysisNode', error);
    return {
      error: error.message,
      logs: [`[CustomerAnalysisNode] Error: ${error.message}`],
    };
  }
};
