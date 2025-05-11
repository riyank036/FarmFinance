const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getMonthlyFinancialData
} = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// Require authentication for all user routes
router.use(auth);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', updateUserProfile);

// Get monthly financial data
router.get('/monthly-financial/:userId', getMonthlyFinancialData);

module.exports = router; 