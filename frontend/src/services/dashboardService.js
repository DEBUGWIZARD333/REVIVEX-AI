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
