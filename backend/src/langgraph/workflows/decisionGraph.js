import { StateGraph, START, END } from '@langchain/langgraph';
import { DecisionAgentStateAnnotation } from '../state/sharedState.js';
import { detectRiskNode } from '../nodes/detectRiskNode.js';
import { customerAnalysisNode } from '../nodes/customerAnalysisNode.js';
import { decisionEngineNode } from '../nodes/decisionEngineNode.js';
import { executeActionNode } from '../nodes/executeActionNode.js';
import { LangGraphLogger } from '../utils/logger.js';

/**
 * Conditional Routing Helper for Input Validation Error Handling
 */
const shouldContinueWorkflow = (state) => {
  if (state.isInputValid === false || state.status === 'FAILED') {
    console.warn(`[LangGraph Workflow] Halting workflow execution due to invalid input or node error: ${state.error}`);
    return 'end';
  }
  return 'continue';
};

/**
 * Assemble LangGraph Decision Workflow Structure
 *
 * Graph Topology:
 *   START
 *     ↓
 *   Detect Risk (detect_risk)
 *     ↓
 *   Analyze Customer (customer_analysis)
 *     ↓
 *   Decision Engine (decision_engine)
 *     ↓
 *   Action Execution (action_execution)
 *     ↓
 *   END
 */
export const createDecisionGraph = () => {
  const workflow = new StateGraph(DecisionAgentStateAnnotation)
    // 1. Add Core Pipeline Nodes
    .addNode('detect_risk', detectRiskNode)
    .addNode('customer_analysis', customerAnalysisNode)
    .addNode('decision_engine', decisionEngineNode)
    .addNode('action_execution', executeActionNode)

    // 2. Add Sequential Edges with Conditional Safeguards
    .addEdge(START, 'detect_risk')
    .addConditionalEdges('detect_risk', shouldContinueWorkflow, {
      continue: 'customer_analysis',
      end: END,
    })
    .addEdge('customer_analysis', 'decision_engine')
    .addEdge('decision_engine', 'action_execution')
    .addEdge('action_execution', END);

  // 3. Compile Graph
  return workflow.compile();
};

// Singleton compiled graph instance
export const compiledDecisionGraph = createDecisionGraph();

/**
 * Execute Decision LangGraph Workflow for a Risk Event
 */
export const runDecisionWorkflow = async (initialInput) => {
  const startTime = Date.now();
  const initialState = {
    userId: initialInput.userId || null,
    riskEventId: initialInput.riskEventId || initialInput._id || null,
    riskEvent: initialInput.riskEvent || initialInput,
    cartValue: initialInput.riskAmount || initialInput.cartValue || 0,
    riskReason: initialInput.riskReason || '',
    customerInfo: {},
    cartInfo: {},
    customerHistory: {},
    customerAnalysis: {},
    previousPurchases: [],
    decisionType: 'REMINDER',
    confidenceScore: 0.85,
    reasoning: '',
    actionResult: {},
    logs: [`[LangGraph Workflow] Execution started at ${new Date().toISOString()}`],
    status: 'PROCESSING',
    error: null,
    isInputValid: true,
  };

  console.log(`[LangGraph Decision Workflow] 🚀 Executing workflow for RiskEvent ID: ${initialState.riskEventId || 'N/A'}`);
  
  try {
    const finalState = await compiledDecisionGraph.invoke(initialState);
    const durationMs = Date.now() - startTime;

    console.log(
      `[LangGraph Decision Workflow] ✅ Workflow Completed (${durationMs}ms) - Decision: ${finalState.decisionType} (Confidence: ${finalState.confidenceScore})`
    );

    return finalState;
  } catch (error) {
    LangGraphLogger.logWorkflowError('decisionGraph', error);
    return {
      ...initialState,
      status: 'FAILED',
      error: error.message,
      logs: [...initialState.logs, `Workflow execution error: ${error.message}`],
    };
  }
};
