import axios from 'axios';
import { API_URL } from '../config/apiConfig';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  // Set a timeout to prevent hanging requests
  timeout: 15000
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    // Log every request for debugging
    console.log('REQUEST:', config.method?.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses if needed
    console.log('RESPONSE:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle connection errors (server not available)
    if (!error.response) {
      console.error('Network Error - Server may be down or unreachable');
      return Promise.reject({
        message: 'Cannot connect to server. Please check your connection or try again later.',
        originalError: error.message
      });
    }
    
    // Handle token expiration
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      console.log('Token expired, logging out...');
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Log all API errors for debugging
    console.error('API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 