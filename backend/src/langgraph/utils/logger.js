/**
 * Structured Logger for LangGraph Workflow Execution
 */
export class LangGraphLogger {
  static logNodeEntry(nodeName, state) {
    const timestamp = new Date().toISOString();
    console.log(`[LangGraph Workflow] 🟢 ENTER NODE: '${nodeName}' at ${timestamp}`);
    return {
      timestamp,
      node: nodeName,
      event: 'ENTRY',
      stateSnapshot: {
        userId: state.userId,
        riskEventId: state.riskEventId,
        decisionType: state.decisionType,
      },
    };
  }

  static logNodeExit(nodeName, stateUpdate, durationMs) {
    const timestamp = new Date().toISOString();
    console.log(
      `[LangGraph Workflow] ✅ EXIT NODE: '${nodeName}' (${durationMs}ms) - Updated Keys: [${Object.keys(
        stateUpdate
      ).join(', ')}]`
    );
    return {
      timestamp,
      node: nodeName,
      event: 'EXIT',
      durationMs,
      updatedKeys: Object.keys(stateUpdate),
    };
  }

  static logWorkflowError(nodeName, error) {
    const timestamp = new Date().toISOString();
    console.error(`[LangGraph Workflow] ❌ ERROR in NODE: '${nodeName}' at ${timestamp} - ${error.message}`);
    return {
      timestamp,
      node: nodeName,
      event: 'ERROR',
      error: error.message,
    };
  }
}
