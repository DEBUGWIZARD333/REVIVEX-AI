import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchEventStats = async (filters = {}) => {
  const response = await axios.get(`${BASE_URL}/events/stats`, {
    ...getAuthHeaders(),
    params: filters,
  });
  return response.data;
};

export const fetchEventsFeed = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/events`, {
    ...getAuthHeaders(),
    params: {
      limit: 10,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      ...params,
    },
  });
  return response.data;
};

export const fetchAgentLogsFeed = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/agent-logs`, {
    ...getAuthHeaders(),
    params: {
      limit: 10,
      sortBy: 'processedAt',
      sortOrder: 'desc',
      ...params,
    },
  });
  return response.data;
};

export const fetchMonitoringStatus = async () => {
  const response = await axios.get(`${BASE_URL}/monitoring/status`, getAuthHeaders());
  return response.data;
};

// Risk Dashboard APIs
export const fetchRiskStats = async () => {
  const response = await axios.get(`${BASE_URL}/risk-events/stats`, getAuthHeaders());
  return response.data;
};

export const fetchRiskEvents = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/risk-events`, {
    ...getAuthHeaders(),
    params: {
      limit: 10,
      sortBy: 'detectedAt',
      sortOrder: 'desc',
      ...params,
    },
  });
  return response.data;
};

export const fetchHighRiskEvents = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/risk-events`, {
    ...getAuthHeaders(),
    params: {
      limit: 10,
      minRiskScore: 66,
      sortBy: 'detectedAt',
      sortOrder: 'desc',
      ...params,
    },
  });
  return response.data;
};

export const updateRiskEventStatus = async (id, status) => {
  const response = await axios.put(
    `${BASE_URL}/risk-events/${id}/status`,
    { status },
    getAuthHeaders()
  );
  return response.data;
};

// Decision Agent Dashboard APIs
export const fetchDecisionStats = async () => {
  const response = await axios.get(`${BASE_URL}/decision-stats`, getAuthHeaders());
  return response.data;
};

export const fetchDecisionsFeed = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/decisions`, {
    ...getAuthHeaders(),
    params: {
      limit: 15,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...params,
    },
  });
  return response.data;
};

// Revenue Recovery Dashboard APIs
export const fetchRecoveryMetrics = async () => {
  const response = await axios.get(`${BASE_URL}/recovery-metrics`, getAuthHeaders());
  return response.data;
};

export const fetchRecoveryEventsFeed = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/recovery-events`, {
    ...getAuthHeaders(),
    params: {
      limit: 10,
      sortBy: 'executedAt',
      sortOrder: 'desc',
      ...params,
    },
  });
  return response.data;
};

export const fetchCouponsFeed = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/coupons`, {
    ...getAuthHeaders(),
    params: {
      limit: 10,
      ...params,
    },
  });
  return response.data;
};

export const fetchEmailLogsFeed = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/agent-logs`, {
    ...getAuthHeaders(),
    params: {
      limit: 10,
      eventType: 'EMAIL_CART_REMINDER',
      sortBy: 'processedAt',
      sortOrder: 'desc',
      ...params,
    },
  });
  return response.data;
};
