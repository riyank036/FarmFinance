import axios from 'axios';
import { 
  API_URL, 
  AUTH_ENDPOINTS, 
  EXPENSE_ENDPOINTS, 
  INCOME_ENDPOINTS, 
  DASHBOARD_ENDPOINTS,
  USER_ENDPOINTS,
  ADMIN_ENDPOINTS 
} from '../config/apiConfig';

// Add request interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to standardize error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data || {
      success: false,
      message: error.message || 'Something went wrong'
    };
    
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        // If token expired, show a message
        if (errorCode === 'TOKEN_EXPIRED') {
          // You can use your preferred notification system here
          alert('Your session has expired. Please login again.');
        }
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(errorData);
  }
);

// Expense API calls
export const expenseAPI = {
  // Get all expenses
  getExpenses: async (page = 1, limit = 100) => {
    const response = await axios.get(`${EXPENSE_ENDPOINTS.BASE}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get a single expense
  getExpense: async (id) => {
    const response = await axios.get(`${EXPENSE_ENDPOINTS.BASE}/${id}`);
    return response.data;
  },

  // Create a new expense
  createExpense: async (expenseData) => {
    const response = await axios.post(EXPENSE_ENDPOINTS.BASE, expenseData);
    return response.data;
  },

  // Update an expense
  updateExpense: async (id, expenseData) => {
    const response = await axios.put(`${EXPENSE_ENDPOINTS.BASE}/${id}`, expenseData);
    return response.data;
  },

  // Delete an expense
  deleteExpense: async (id) => {
    const response = await axios.delete(`${EXPENSE_ENDPOINTS.BASE}/${id}`);
    return response.data;
  }
};

// Income API calls
export const incomeAPI = {
  // Get all income entries
  getIncomes: async (page = 1, limit = 100) => {
    const response = await axios.get(`${INCOME_ENDPOINTS.BASE}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get a single income entry
  getIncome: async (id) => {
    const response = await axios.get(`${INCOME_ENDPOINTS.BASE}/${id}`);
    return response.data;
  },

  // Create a new income entry
  createIncome: async (incomeData) => {
    const response = await axios.post(INCOME_ENDPOINTS.BASE, incomeData);
    return response.data;
  },

  // Update an income entry
  updateIncome: async (id, incomeData) => {
    const response = await axios.put(`${INCOME_ENDPOINTS.BASE}/${id}`, incomeData);
    return response.data;
  },

  // Delete an income entry
  deleteIncome: async (id) => {
    const response = await axios.delete(`${INCOME_ENDPOINTS.BASE}/${id}`);
    return response.data;
  }
};

// Dashboard API calls
export const dashboardAPI = {
  // Get summary data (total income, expenses, profit)
  getSummary: async () => {
    const response = await axios.get(DASHBOARD_ENDPOINTS.SUMMARY);
    return response.data;
  },

  // Get monthly data for charts
  getMonthlyStats: async () => {
    const response = await axios.get(DASHBOARD_ENDPOINTS.MONTHLY);
    return response.data;
  }
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await axios.get(USER_ENDPOINTS.PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axios.put(USER_ENDPOINTS.PROFILE, profileData);
    return response.data;
  },

  // Get monthly financial data
  getMonthlyFinancialData: async (userId) => {
    const response = await axios.get(`${USER_ENDPOINTS.MONTHLY_FINANCIAL}/${userId}`);
    return response.data;
  }
};

// Admin API calls
export const adminAPI = {
  // Get all users
  getUsers: async () => {
    const response = await axios.get(ADMIN_ENDPOINTS.USERS);
    return response.data;
  },

  // Get a single user
  getUser: async (id) => {
    const response = await axios.get(`${ADMIN_ENDPOINTS.USERS}/${id}`);
    return response.data;
  },

  // Update a user
  updateUser: async (id, userData) => {
    const response = await axios.put(`${ADMIN_ENDPOINTS.USERS}/${id}`, userData);
    return response.data;
  },

  // Delete a user
  deleteUser: async (id) => {
    const response = await axios.delete(`${ADMIN_ENDPOINTS.USERS}/${id}`);
    return response.data;
  },

  // Get system stats
  getSystemStats: async () => {
    const response = await axios.get(ADMIN_ENDPOINTS.STATS);
    return response.data;
  },
  
  // Get all expenses for all users
  getAllExpenses: async () => {
    const response = await axios.get(ADMIN_ENDPOINTS.EXPENSES);
    return response.data;
  },

  // Get all income for all users
  getAllIncome: async () => {
    const response = await axios.get(ADMIN_ENDPOINTS.INCOME);
    return response.data;
  },
  
  // Delete an expense 
  deleteExpense: async (id) => {
    const response = await axios.delete(`${ADMIN_ENDPOINTS.EXPENSES}/${id}`);
    return response.data;
  },
  
  // Delete an income record
  deleteIncome: async (id) => {
    const response = await axios.delete(`${ADMIN_ENDPOINTS.INCOME}/${id}`);
    return response.data;
  },
  
  // Get system settings
  getSettings: async () => {
    const response = await axios.get(ADMIN_ENDPOINTS.SETTINGS);
    return response.data;
  },
  
  // Update system settings
  updateSettings: async (settingsData) => {
    const response = await axios.put(ADMIN_ENDPOINTS.SETTINGS, settingsData);
    return response.data;
  }
}; 