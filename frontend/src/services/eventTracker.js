import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

// Deduplication cache: stores event keys and timestamps
const recentEventsCache = new Map();
const DEDUPLICATION_WINDOW_MS = 2000; // 2 seconds

// Generate or retrieve persistent browser session ID
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ecomm_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('ecomm_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Core trackEvent utility with Axios and deduplication
 */
export const trackEvent = async ({ eventType, productId = null, metadata = {} }) => {
  try {
    // Generate a unique event signature for deduplication
    const eventKey = `${eventType}_${productId || 'null'}_${JSON.stringify(metadata)}`;
    const now = Date.now();
    const lastTrackedTime = recentEventsCache.get(eventKey);

    // Prevent duplicate event sending within the deduplication window
    if (lastTrackedTime && now - lastTrackedTime < DEDUPLICATION_WINDOW_MS) {
      console.log(`[EventTracker] Skipped duplicate event: ${eventType}`);
      return;
    }

    // Update cache
    recentEventsCache.set(eventKey, now);

    // Clean up old entries from cache to avoid memory leaks
    if (recentEventsCache.size > 100) {
      for (const [key, timestamp] of recentEventsCache.entries()) {
        if (now - timestamp > DEDUPLICATION_WINDOW_MS * 2) {
          recentEventsCache.delete(key);
        }
      }
    }

    const token = localStorage.getItem('token');
    const sessionId = getSessionId();

    const headers = token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };

    const payload = {
      eventType,
      sessionId,
      productId: productId && productId.length === 24 ? productId : null,
      metadata,
      timestamp: new Date().toISOString(),
    };

    const response = await axios.post(API_URL, payload, { headers });
    return response.data;
  } catch (error) {
    // Fail silently in frontend tracking so user experience remains uninterrupted
    console.warn('[EventTracker] Event tracking request failed:', error.response?.data?.message || error.message);
  }
};

// Convenience Event Tracker Utilities for all 7 required event types
export const trackProductViewed = (productId, metadata = {}) =>
  trackEvent({ eventType: 'PRODUCT_VIEWED', productId, metadata });

export const trackAddToCart = (productId, metadata = {}) =>
  trackEvent({ eventType: 'ADD_TO_CART', productId, metadata });

export const trackRemoveCartItem = (productId, metadata = {}) =>
  trackEvent({ eventType: 'REMOVE_CART_ITEM', productId, metadata });

export const trackCheckoutStarted = (metadata = {}) =>
  trackEvent({ eventType: 'CHECKOUT_STARTED', metadata });

export const trackPaymentInitiated = (metadata = {}) =>
  trackEvent({ eventType: 'PAYMENT_INITIATED', metadata });

export const trackPaymentFailed = (metadata = {}) =>
  trackEvent({ eventType: 'PAYMENT_FAILED', metadata });

export const trackPaymentSuccess = (metadata = {}) =>
  trackEvent({ eventType: 'PAYMENT_SUCCESS', metadata });
