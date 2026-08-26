import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cart';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchCart = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const addToCartAPI = async (productId, quantity = 1) => {
  const response = await axios.post(
    API_URL,
    { productId, quantity },
    getAuthHeaders()
  );
  return response.data;
};

export const updateCartItemAPI = async (cartItemId, quantity) => {
  const response = await axios.put(
    `${API_URL}/${cartItemId}`,
    { quantity },
    getAuthHeaders()
  );
  return response.data;
};

export const removeFromCartAPI = async (cartItemId) => {
  const response = await axios.delete(
    `${API_URL}/${cartItemId}`,
    getAuthHeaders()
  );
  return response.data;
};

export const clearCartAPI = async () => {
  const response = await axios.delete(API_URL, getAuthHeaders());
  return response.data;
};
