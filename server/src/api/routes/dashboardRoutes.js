const express = require('express');
const { 
  getSummary,
  getMonthlyData
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Require authentication for all dashboard routes
router.use(authMiddleware);

// Get summary statistics
router.get('/summary', getSummary);

// Get monthly data for charts
router.get('/monthly', getMonthlyData);

module.exports = router; 