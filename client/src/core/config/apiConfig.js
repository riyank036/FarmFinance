/**
 * API configuration for the Farm Finance application
 */

// Base API URL - Change this when deploying to production
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_URL}/auth/register`,
  LOGIN: `${API_URL}/auth/login`,
  ME: `${API_URL}/auth/me`,
  FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  UPDATE_PROFILE: `${API_URL}/auth/profile`
};

// Expense endpoints
export const EXPENSE_ENDPOINTS = {
  BASE: `${API_URL}/expenses`,
  BY_CATEGORY: `${API_URL}/expenses/by-category`,
  BY_MONTH: `${API_URL}/expenses/by-month`
};

// Income endpoints
export const INCOME_ENDPOINTS = {
  BASE: `${API_URL}/income`
};

// Dashboard endpoints
export const DASHBOARD_ENDPOINTS = {
  SUMMARY: `${API_URL}/dashboard/summary`,
  MONTHLY: `${API_URL}/dashboard/monthly`,
  FINANCIAL_SUMMARY: `${API_URL}/dashboard/financial-summary`
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${API_URL}/user/profile`,
  MONTHLY_FINANCIAL: `${API_URL}/user/monthly-financial`
};

// Feedback endpoints
export const FEEDBACK_ENDPOINTS = {
  BASE: `${API_URL}/feedback`
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  USERS: `${API_URL}/admin/users`,
  STATS: `${API_URL}/admin/stats`,
  MONTHLY_STATS: `${API_URL}/admin/stats/monthly`,
  EXPENSES: `${API_URL}/admin/expenses`,
  INCOME: `${API_URL}/admin/income`,
  FEEDBACK: `${API_URL}/admin/feedback`,
  FEEDBACK_STATS: `${API_URL}/admin/feedback/stats`
};

export default {
  API_URL,
  AUTH_ENDPOINTS,
  EXPENSE_ENDPOINTS,
  INCOME_ENDPOINTS,
  DASHBOARD_ENDPOINTS,
  USER_ENDPOINTS,
  FEEDBACK_ENDPOINTS,
  ADMIN_ENDPOINTS
}; 