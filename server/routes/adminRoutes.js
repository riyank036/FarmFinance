const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingController = require('../controllers/settingController');
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

module.exports = router; 