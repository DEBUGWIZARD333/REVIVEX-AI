import Event from '../models/Event.js';
import * as agentLogService from './agentLogService.js';
import analysisEngine from './eventAnalysisEngine.js';
import { handlePaymentFailureEvent } from './paymentFailureDetectorService.js';
import { globalEventIntegrityValidator } from './eventIntegrityValidator.js';

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
 * 2. Analyze individual event using Rule-Based Analysis Engine
 */
export const analyzeEvent = async (event) => {
  return await analysisEngine.analyzeEvent(event);
};

/**
 * 3. Process a single event: Log execution -> Analyze Rules -> Validate Integrity -> Complete Log -> Mark Processed
 */
export const processSingleEvent = async (event) => {
  // Step 3a: Write initial RECEIVED Log
  await agentLogService.createAgentLog({
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
      message: `Running rule-based analysis engine & event flow integrity check`,
      processedAt: new Date(),
    });

    // Step 3c: Execute rule-based analysis engine & integrity validator
    const analysis = await analyzeEvent(event);
    const integrityResult = await globalEventIntegrityValidator.validateEventIntegrity(event);

    // Step 3d: Trigger Payment Failure Detector if event is PAYMENT_FAILED
    if (event.eventType === 'PAYMENT_FAILED') {
      await handlePaymentFailureEvent(event);
    }

    const integrityFlag = integrityResult.isValid
      ? '[Integrity: VALID]'
      : `[Integrity: ${integrityResult.status} (${integrityResult.anomalies.map((a) => a.type).join(', ')})]`;

    // Step 3e: Write COMPLETED Log with required rule logMessage & integrity status
    await agentLogService.createAgentLog({
      agentName: AGENT_NAME,
      eventId: event._id,
      eventType: event.eventType,
      status: 'COMPLETED',
      message: `${analysis.primaryLogMessage} | Intent: ${analysis.intent} | ${integrityFlag}`,
      processedAt: new Date(),
    });

    // Step 4: Mark Event as Processed in MongoDB
    event.isProcessed = true;
    await event.save();

    processedCountInSession++;
    return { success: true, eventId: event._id, analysis, integrityResult };
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
