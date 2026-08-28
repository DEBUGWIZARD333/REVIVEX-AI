import { StateGraph, START, END } from '@langchain/langgraph';
import { DecisionAgentStateAnnotation } from '../state/sharedState.js';
import { detectRiskNode } from '../nodes/detectRiskNode.js';
import { fetchCustomerHistoryNode } from '../nodes/fetchCustomerHistoryNode.js';
import { evaluateRiskContextNode } from '../nodes/evaluateRiskContextNode.js';
import { determineDecisionNode } from '../nodes/determineDecisionNode.js';
import { executeActionNode } from '../nodes/executeActionNode.js';

/**
 * Assemble LangGraph Decision Workflow Structure
 *
 * Graph Topology:
 *   [START] -> detect_risk -> fetch_history -> evaluate_context -> determine_decision -> execute_action -> [END]
 */
export const createDecisionGraph = () => {
  const workflow = new StateGraph(DecisionAgentStateAnnotation)
    // 1. Add Nodes
    .addNode('detect_risk', detectRiskNode)
    .addNode('fetch_history', fetchCustomerHistoryNode)
    .addNode('evaluate_context', evaluateRiskContextNode)
    .addNode('determine_decision', determineDecisionNode)
    .addNode('execute_action', executeActionNode)

    // 2. Add Sequential Edges
    .addEdge(START, 'detect_risk')
    .addEdge('detect_risk', 'fetch_history')
    .addEdge('fetch_history', 'evaluate_context')
    .addEdge('evaluate_context', 'determine_decision')
    .addEdge('determine_decision', 'execute_action')
    .addEdge('execute_action', END);

  // 3. Compile Graph
  return workflow.compile();
};

// Singleton compiled graph instance
export const compiledDecisionGraph = createDecisionGraph();

/**
 * Execute Decision LangGraph Workflow for a Risk Event
 */
export const runDecisionWorkflow = async (initialInput) => {
  const initialState = {
    userId: initialInput.userId || null,
    riskEventId: initialInput.riskEventId || initialInput._id || null,
    riskEvent: initialInput.riskEvent || initialInput,
    cartValue: initialInput.riskAmount || initialInput.cartValue || 0,
    riskReason: initialInput.riskReason || '',
    customerHistory: {},
    previousPurchases: [],
    decisionType: 'REMINDER',
    confidenceScore: 0.85,
    actionResult: {},
    logs: [`Started LangGraph Workflow at ${new Date().toISOString()}`],
    status: 'PROCESSING',
    error: null,
  };

  console.log(`[LangGraph Decision Workflow] Starting execution for RiskEvent ID: ${initialState.riskEventId}`);
  
  const finalState = await compiledDecisionGraph.invoke(initialState);
  
  console.log(
    `[LangGraph Decision Workflow] Completed execution. Output Decision: ${finalState.decisionType} (Confidence: ${finalState.confidenceScore})`
  );

  return finalState;
};
