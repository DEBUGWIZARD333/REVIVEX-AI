import { Annotation } from '@langchain/langgraph';

/**
 * Shared LangGraph State Annotation Channel Definitions for Decision Agent
 * Supports strict typing and channels for state transitions across nodes
 */
export const DecisionAgentStateAnnotation = Annotation.Root({
  userId: Annotation({
    reducer: (x, y) => y ?? x ?? null,
  }),
  riskEventId: Annotation({
    reducer: (x, y) => y ?? x ?? null,
  }),
  riskEvent: Annotation({
    reducer: (x, y) => (y ? { ...x, ...y } : x ?? null),
  }),
  customerInfo: Annotation({
    reducer: (x, y) => (y ? { ...x, ...y } : x ?? {}),
  }),
  cartInfo: Annotation({
    reducer: (x, y) => (y ? { ...x, ...y } : x ?? {}),
  }),
  isInputValid: Annotation({
    reducer: (x, y) => y ?? x ?? true,
  }),
  customerHistory: Annotation({
    reducer: (x, y) => (y ? { ...x, ...y } : x ?? {}),
  }),
  cartValue: Annotation({
    reducer: (x, y) => y ?? x ?? 0,
  }),
  riskReason: Annotation({
    reducer: (x, y) => y ?? x ?? '',
  }),
  previousPurchases: Annotation({
    reducer: (x, y) => y ?? x ?? [],
  }),
  decisionType: Annotation({
    reducer: (x, y) => y ?? x ?? 'REMINDER',
  }),
  confidenceScore: Annotation({
    reducer: (x, y) => y ?? x ?? 0.85,
  }),
  actionResult: Annotation({
    reducer: (x, y) => (y ? { ...x, ...y } : x ?? {}),
  }),
  logs: Annotation({
    reducer: (x, y) => (Array.isArray(y) ? [...(x || []), ...y] : x || []),
  }),
  status: Annotation({
    reducer: (x, y) => y ?? x ?? 'PENDING',
  }),
  error: Annotation({
    reducer: (x, y) => y ?? x ?? null,
  }),
});
