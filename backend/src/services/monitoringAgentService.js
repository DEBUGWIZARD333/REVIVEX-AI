import Event from '../models/Event.js';
import * as agentLogService from './agentLogService.js';

const AGENT_NAME = 'EventMonitoringAgent';
let isRunning = false;
let pollingIntervalId = null;
let lastRunTimestamp = null;
let processedCountInSession = 0;

/**
 * 1. Fetch unprocessed events from MongoDB
 */
export const fetchUnprocessedEvents = async (batchSize = 10) => {
  return await Event.find({ isProcessed: false })
    .populate('userId', 'name email')
    .populate('productId', 'name price category')
    .sort({ timestamp: 1 })
    .limit(batchSize);
};

/**
 * 2. Analyze individual event for revenue recovery insights
 */
export const analyzeEvent = (event) => {
  const { eventType, metadata, productId, userId } = event;
  let analysis = {
    category: 'GENERAL_EVENT',
    recoveryTrigger: false,
    severity: 'LOW',
    actionRecommendation: 'No action required',
  };

  switch (eventType) {
    case 'PRODUCT_VIEWED':
      analysis = {
        category: 'BROWSER_INTENT',
        recoveryTrigger: false,
        severity: 'LOW',
        actionRecommendation: `User viewed ${productId?.name || 'product'}. Track browsing history.`,
      };
      break;

    case 'ADD_TO_CART':
      analysis = {
        category: 'CART_ACTIVITY',
        recoveryTrigger: true,
        severity: 'MEDIUM',
        actionRecommendation: `Item added to cart. Monitor for checkout within 15 mins.`,
      };
      break;

    case 'REMOVE_CART_ITEM':
      analysis = {
        category: 'CART_FRICTION',
        recoveryTrigger: true,
        severity: 'MEDIUM',
        actionRecommendation: `Item removed from cart. Evaluate potential price resistance.`,
      };
      break;

    case 'CHECKOUT_STARTED':
      analysis = {
        category: 'HIGH_INTENT',
        recoveryTrigger: true,
        severity: 'HIGH',
        actionRecommendation: `Checkout initiated for total $${metadata?.grandTotal || 'N/A'}. Ready for recovery nudge if abandoned.`,
      };
      break;

    case 'PAYMENT_INITIATED':
      analysis = {
        category: 'TRANSACTION_ATTEMPT',
        recoveryTrigger: true,
        severity: 'HIGH',
        actionRecommendation: `Payment processing with method ${metadata?.paymentMethod || 'card'}.`,
      };
      break;

    case 'PAYMENT_FAILED':
      analysis = {
        category: 'REVENUE_LOSS_RISK',
        recoveryTrigger: true,
        severity: 'CRITICAL',
        actionRecommendation: `Payment failed (${metadata?.reason || 'Transaction error'}). Immediate recovery notification required.`,
      };
      break;

    case 'PAYMENT_SUCCESS':
      analysis = {
        category: 'CONVERTED',
        recoveryTrigger: false,
        severity: 'SUCCESS',
        actionRecommendation: `Transaction completed. Order ID: ${metadata?.orderId}. Clear active recovery campaigns.`,
      };
      break;

    default:
      analysis = {
        category: 'UNKNOWN',
        recoveryTrigger: false,
        severity: 'LOW',
        actionRecommendation: 'Log and monitor.',
      };
  }

  return analysis;
};

/**
 * 3. Process a single event: Log execution -> Analyze -> Complete Log -> Mark Processed
 */
export const processSingleEvent = async (event) => {
  // Step 3a: Write initial RECEIVED Log
  const initialLog = await agentLogService.createAgentLog({
    agentName: AGENT_NAME,
    eventId: event._id,
    eventType: event.eventType,
    status: 'RECEIVED',
    message: `Received event ${event.eventType} for user ${event.userId?._id || 'guest'}`,
    processedAt: new Date(),
  });

  try {
    // Step 3b: Update Log status to PROCESSING
    await agentLogService.createAgentLog({
      agentName: AGENT_NAME,
      eventId: event._id,
      eventType: event.eventType,
      status: 'PROCESSING',
      message: `Analyzing event payload and recovery parameters`,
      processedAt: new Date(),
    });

    // Step 3c: Execute event analysis
    const analysis = analyzeEvent(event);

    // Step 3d: Write COMPLETED Log with analysis summary
    await agentLogService.createAgentLog({
      agentName: AGENT_NAME,
      eventId: event._id,
      eventType: event.eventType,
      status: 'COMPLETED',
      message: `Analysis Complete: Category [${analysis.category}] | Severity [${analysis.severity}] | Action: ${analysis.actionRecommendation}`,
      processedAt: new Date(),
    });

    // Step 4: Mark Event as Processed in MongoDB
    event.isProcessed = true;
    await event.save();

    processedCountInSession++;
    return { success: true, eventId: event._id, analysis };
  } catch (error) {
    // Write FAILED Log if error occurs
    await agentLogService.createAgentLog({
      agentName: AGENT_NAME,
      eventId: event._id,
      eventType: event.eventType,
      status: 'FAILED',
      message: `Error processing event: ${error.message}`,
      processedAt: new Date(),
    });

    throw error;
  }
};

/**
 * Async Batch Monitoring Cycle Execution
 */
export const runMonitoringCycle = async (batchSize = 10) => {
  lastRunTimestamp = new Date();
  const events = await fetchUnprocessedEvents(batchSize);

  if (events.length === 0) {
    return { processedCount: 0, message: 'No unprocessed events found' };
  }

  const results = [];
  for (const event of events) {
    const result = await processSingleEvent(event);
    results.push(result);
  }

  return {
    processedCount: results.length,
    results,
    timestamp: lastRunTimestamp,
  };
};

/**
 * Start background async polling loop
 */
export const startMonitoringAgent = (intervalMs = 5000) => {
  if (isRunning) {
    return { success: false, message: 'Monitoring Agent is already running' };
  }

  isRunning = true;
  pollingIntervalId = setInterval(async () => {
    try {
      await runMonitoringCycle();
    } catch (err) {
      console.error('[EventMonitoringAgent] Error in background cycle:', err.message);
    }
  }, intervalMs);

  console.log(`[EventMonitoringAgent] Started polling loop (every ${intervalMs}ms)`);
  return { success: true, message: `Monitoring Agent started (interval: ${intervalMs}ms)` };
};

/**
 * Stop background async polling loop
 */
export const stopMonitoringAgent = () => {
  if (!isRunning) {
    return { success: false, message: 'Monitoring Agent is not running' };
  }

  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
  isRunning = false;

  console.log('[EventMonitoringAgent] Stopped polling loop');
  return { success: true, message: 'Monitoring Agent stopped' };
};

/**
 * Get Agent Status & Metrics
 */
export const getMonitoringStatus = async () => {
  const pendingCount = await Event.countDocuments({ isProcessed: false });
  const totalEventsCount = await Event.countDocuments({});

  return {
    agentName: AGENT_NAME,
    isRunning,
    pendingUnprocessedEvents: pendingCount,
    totalEventsTracked: totalEventsCount,
    processedCountInSession,
    lastRunTimestamp,
  };
};
