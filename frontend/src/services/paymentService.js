import axios from 'axios';

const API_URL = 'http://localhost:5000/api/payment';

// Set up axios instance with token if needed (assuming user is logged in)
const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    return {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
  }
  return {};
};

export const createRazorpayOrder = async (amount, currency = 'USD') => {
  const { data } = await axios.post(
    `${API_URL}/create-order`,
    { amount, currency },
    getAuthHeaders()
  );
  return data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const { data } = await axios.post(
    `${API_URL}/verify`,
    paymentData,
    getAuthHeaders()
  );
  return data;
};
