const express = require('express');
const { 
  getExpenses,
  getExpenseStats,
  getExpense,
  createExpense,
  updateExpense,
  updateExpenseStatus,
  deleteExpense,
  getExpensesByDateRange,
  getExpensesByCategory,
  getExpensesByMonth
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Require authentication for all expense routes
router.use(authMiddleware);

// Get expenses by date range
router.get('/date-range', getExpensesByDateRange);

// Get expense statistics
router.get('/stats', getExpenseStats);

// Get all expenses for user
router.get('/', getExpenses);

// Get expenses by category
router.get('/by-category', getExpensesByCategory);

// Get expenses by month
router.get('/by-month', getExpensesByMonth);

// Get single expense
router.get('/:id', getExpense);

// Create new expense
router.post('/', createExpense);

// Update expense
router.put('/:id', updateExpense);

// Delete expense
router.delete('/:id', deleteExpense);

// Update expense status
router.patch('/:id/status', updateExpenseStatus);

module.exports = router; 