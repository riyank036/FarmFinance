const express = require('express');
const {
  getSummary,
  getMonthlyStats,
  getDashboardStats,
  getFinancialSummary
} = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary
router.get('/summary', auth, getSummary);

// Get monthly statistics
router.get('/monthly', auth, getMonthlyStats);

// Get combined dashboard statistics
router.get('/stats', getDashboardStats);

// Get financial summary for profile page
router.get('/financial-summary', auth, getFinancialSummary);

module.exports = router; 