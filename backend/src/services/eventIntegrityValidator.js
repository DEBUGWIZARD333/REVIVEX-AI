import Event from '../models/Event.js';

/**
 * Expected Customer Journey Flow Stages & Prerequisites
 */
const STAGE_PREREQUISITES = {
  PRODUCT_VIEWED: [],
  ADD_TO_CART: ['PRODUCT_VIEWED'],
  REMOVE_CART_ITEM: ['ADD_TO_CART'],
  CHECKOUT_STARTED: ['ADD_TO_CART'],
  PAYMENT_INITIATED: ['CHECKOUT_STARTED'],
  PAYMENT_FAILED: ['CHECKOUT_STARTED', 'PAYMENT_INITIATED'],
  PAYMENT_SUCCESS: ['CHECKOUT_STARTED', 'PAYMENT_INITIATED'],
};

/**
 * Event Flow Integrity Validator Service
 */
export class EventIntegrityValidator {
  /**
   * Validate integrity for a single incoming event against session/user history
   */
  async validateEventIntegrity(event) {
    const anomalies = [];
    const eventType = event.eventType;

    // 1. Fetch preceding session/user event history
    const query = {
      _id: { $ne: event._id },
    };
    if (event.userId) {
      query.userId = event.userId;
    } else if (event.sessionId) {
      query.sessionId = event.sessionId;
    }

    const history = await Event.find(query)
      .sort({ timestamp: -1 })
      .limit(30);

    const historyEventTypes = history.map((e) => e.eventType);

    // 2. Check Prerequisite Flow Constraints
    const requiredPrereqs = STAGE_PREREQUISITES[eventType] || [];
    if (requiredPrereqs.length > 0) {
      const hasPrereq = requiredPrereqs.some((prereq) => historyEventTypes.includes(prereq));
      if (!hasPrereq && history.length > 0) {
        anomalies.push({
          type: 'MISSING_PREREQUISITE',
          severity: 'HIGH',
          message: `Event '${eventType}' occurred without prerequisite stage (${requiredPrereqs.join(' OR ')})`,
          expectedPrerequisites: requiredPrereqs,
        });
      }
    }

    // 3. Check Timestamp Chronology & Out-of-Order Anomalies
    if (history.length > 0) {
      const latestHistoryEvt = history[0];
      const eventTime = new Date(event.timestamp).getTime();
      const historyTime = new Date(latestHistoryEvt.timestamp).getTime();

      if (eventTime < historyTime - 1000) {
        anomalies.push({
          type: 'OUT_OF_ORDER_TIMESTAMP',
          severity: 'MEDIUM',
          message: `Event timestamp (${new Date(event.timestamp).toISOString()}) is earlier than prior event timestamp (${new Date(latestHistoryEvt.timestamp).toISOString()})`,
        });
      }

      // Rapid Duplicate Burst Detection (< 500ms apart same eventType)
      if (latestHistoryEvt.eventType === eventType && historyTime - eventTime < 500 && eventTime - historyTime < 500) {
        anomalies.push({
          type: 'RAPID_DUPLICATE_EVENTS',
          severity: 'LOW',
          message: `Rapid duplicate '${eventType}' detected within 500ms`,
        });
      }
    }

    const isIntegrityValid = anomalies.length === 0;
    const status = isIntegrityValid ? 'VALID' : anomalies.some(a => a.severity === 'HIGH') ? 'INVALID_SEQUENCE' : 'ANOMALY_WARNING';

    return {
      isValid: isIntegrityValid,
      status,
      eventType,
      timestamp: event.timestamp,
      anomalies,
      validatedAt: new Date(),
    };
  }

  /**
   * Generate System-Wide Event Flow Integrity Report & Metrics
   */
  async generateIntegrityReport() {
    const totalEvents = await Event.countDocuments({});
    const recentEvents = await Event.find({}).sort({ timestamp: -1 }).limit(200);

    let validCount = 0;
    let anomalyCount = 0;
    const anomalyBreakdown = {
      MISSING_PREREQUISITE: 0,
      OUT_OF_ORDER_TIMESTAMP: 0,
      RAPID_DUPLICATE_EVENTS: 0,
    };
    const anomaliesList = [];

    // Group events by session / user to validate flows
    const sessionMap = new Map();
    for (const evt of recentEvents) {
      const key = evt.userId?.toString() || evt.sessionId || 'guest';
      if (!sessionMap.has(key)) {
        sessionMap.set(key, []);
      }
      sessionMap.get(key).push(evt);
    }

    for (const [key, evts] of sessionMap.entries()) {
      // Sort chronologically ascending
      evts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const seenTypes = new Set();
      for (let i = 0; i < evts.length; i++) {
        const evt = evts[i];
        const reqPrereqs = STAGE_PREREQUISITES[evt.eventType] || [];
        let hasAnomaly = false;

        if (reqPrereqs.length > 0 && i > 0) {
          const matchedPrereq = reqPrereqs.some((p) => seenTypes.has(p));
          if (!matchedPrereq) {
            anomalyCount++;
            anomalyBreakdown.MISSING_PREREQUISITE++;
            hasAnomaly = true;
            anomaliesList.push({
              eventId: evt._id,
              eventType: evt.eventType,
              sessionId: key,
              type: 'MISSING_PREREQUISITE',
              message: `Event '${evt.eventType}' missing required stage (${reqPrereqs.join(' or ')})`,
              timestamp: evt.timestamp,
            });
          }
        }

        seenTypes.add(evt.eventType);
        if (!hasAnomaly) validCount++;
      }
    }

    const validatedCount = recentEvents.length;
    const integrityScore = validatedCount > 0
      ? parseFloat((((validatedCount - anomalyCount) / validatedCount) * 100).toFixed(1))
      : 100.0;

    return {
      integrityScore,
      totalEventsTracked: totalEvents,
      recentEventsAnalyzed: validatedCount,
      validEventsCount: Math.max(0, validatedCount - anomalyCount),
      anomalyEventsCount: anomalyCount,
      anomalyBreakdown,
      recentAnomalies: anomaliesList.slice(0, 10),
      generatedAt: new Date(),
    };
  }
}

// Singleton Instance
export const globalEventIntegrityValidator = new EventIntegrityValidator();
