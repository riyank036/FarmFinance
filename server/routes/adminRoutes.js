const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingController = require('../controllers/settingController');
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Protect all admin routes with auth and adminAuth middlewares
router.use(auth, adminAuth);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get('/stats', adminController.getSystemStats);

// @route   GET /api/admin/stats/monthly
// @desc    Get monthly financial data
// @access  Admin
router.get('/stats/monthly', adminController.getMonthlyFinancialData);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', adminController.getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Admin
router.get('/users/:id', adminController.getUserById);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Admin
router.put('/users/:id', adminController.updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', adminController.deleteUser);

// @route   GET /api/admin/expenses
// @desc    Get all expenses
// @access  Admin
router.get('/expenses', adminController.getAllExpenses);

// @route   DELETE /api/admin/expenses/:id
// @desc    Delete expense
// @access  Admin
router.delete('/expenses/:id', adminController.deleteExpense);

// @route   GET /api/admin/income
// @desc    Get all income
// @access  Admin
router.get('/income', adminController.getAllIncome);

// @route   DELETE /api/admin/income/:id
// @desc    Delete income
// @access  Admin
router.delete('/income/:id', adminController.deleteIncome);

// @route   GET /api/admin/settings
// @desc    Get all settings
// @access  Admin
router.get('/settings', settingController.getAllSettings);

// @route   PUT /api/admin/settings
// @desc    Update settings
// @access  Admin
router.put('/settings', settingController.updateSettings);

// ----- FEEDBACK MANAGEMENT ROUTES -----

// @route   GET /api/admin/feedback
// @desc    Get all feedback entries
// @access  Admin
router.get('/feedback', feedbackController.getAllFeedback);

// @route   GET /api/admin/feedback/stats
// @desc    Get feedback statistics
// @access  Admin
router.get('/feedback/stats', feedbackController.getFeedbackStats);

// @route   GET /api/admin/feedback/:id
// @desc    Get feedback by ID
// @access  Admin
router.get('/feedback/:id', feedbackController.getFeedbackById);

// @route   PUT /api/admin/feedback/:id
// @desc    Update feedback status
// @access  Admin
router.put('/feedback/:id', feedbackController.updateFeedbackStatus);

// @route   DELETE /api/admin/feedback/:id
// @desc    Delete feedback
// @access  Admin
router.delete('/feedback/:id', feedbackController.deleteFeedback);

module.exports = router; 