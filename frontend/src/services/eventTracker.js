import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

// Generate or retrieve persistent browser session ID
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('ecomm_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ecomm_session_id', sessionId);
  }
  return sessionId;
};

export const trackEvent = async ({ eventType, productId = null, metadata = {} }) => {
  try {
    const token = localStorage.getItem('token');
    const sessionId = getSessionId();

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const payload = {
      eventType,
      sessionId,
      productId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    await axios.post(API_URL, payload, { headers });
  } catch (error) {
    // Fail silently in frontend tracking so user experience is uninterrupted
    console.warn('Event tracking failed silently:', error.response?.data?.message || error.message);
  }
};
