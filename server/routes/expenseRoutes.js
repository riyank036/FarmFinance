const express = require('express');
const { 
  getExpenses,
  getExpenseStats,
  getExpense,
  createExpense,
  updateExpense,
  updateExpenseStatus,
  deleteExpense,
  getExpensesByDateRange
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

const router = express.Router();

// Require authentication for all expense routes
router.use(auth);

// Get expenses by date range
router.get('/date-range', getExpensesByDateRange);

// Get expense statistics
router.get('/stats', getExpenseStats);

// Get all expenses and create new expense
router.route('/')
  .get(getExpenses)
  .post(createExpense);

// Get, update and delete expense by ID
router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

// Update expense status
router.patch('/:id/status', updateExpenseStatus);

module.exports = router; 