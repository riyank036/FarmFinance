import axios from 'axios';

// Get the API URL based on environment
const getApiUrl = () => {
  // For production (when deployed)
  if (import.meta.env.PROD) {
    // You'll need to set this in Netlify environment variables
    return import.meta.env.VITE_API_URL || 'https://farmfinance-api.onrender.com';
  }
  
  // For development
  return 'http://localhost:5000';
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api; 