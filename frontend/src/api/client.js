import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Dynamic resolution for browser environments
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Kubernetes NodePort mapping: frontend is on 31730, gateway is on 30000
    if (port === '31730') {
      return `http://${hostname}:30000/api`;
    }
    
    // Dev server / Docker-compose mapping: frontend on 5173, gateway on 3000
    if (port === '5173') {
      return `http://${hostname}:3000/api`;
    }
    
    // Fallback to same host on gateway port 3000
    return `http://${hostname}:3000/api`;
  }
  
  return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();

// Auth Service
export const authAPI = {
  register: (userData) => axios.post(`${API_URL}/auth/register`, userData),
  login: (email, password) => axios.post(`${API_URL}/auth/login`, { email, password }),
  getProfile: (userId, token) => axios.get(`${API_URL}/auth/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

// Product Service
export const productAPI = {
  getAllProducts: (params = {}) => axios.get(`${API_URL}/products`, { params }),
  getProductById: (id) => axios.get(`${API_URL}/products/${id}`),
  getByCategory: (category) => axios.get(`${API_URL}/products/category/${category}`),
  addReview: (productId, review) => axios.post(`${API_URL}/products/${productId}/review`, review)
};

// Order Service
export const orderAPI = {
  createOrder: (orderData, token) => axios.post(`${API_URL}/orders`, orderData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getUserOrders: (userId, token) => axios.get(`${API_URL}/orders/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getOrderById: (orderId, token) => axios.get(`${API_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateOrderStatus: (orderId, status, token) => axios.put(`${API_URL}/orders/${orderId}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  cancelOrder: (orderId, token) => axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

// Payment Service
export const paymentAPI = {
  createPayment: (paymentData, token) => axios.post(`${API_URL}/payments/create`, paymentData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  confirmPayment: (confirmData, token) => axios.post(`${API_URL}/payments/confirm`, confirmData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getPaymentDetails: (paymentId, token) => axios.get(`${API_URL}/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  refundPayment: (paymentId, token) => axios.post(`${API_URL}/payments/${paymentId}/refund`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

export default API_URL;
