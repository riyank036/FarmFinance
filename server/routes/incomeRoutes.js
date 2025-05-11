const express = require('express');
const { 
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');
const auth = require('../middleware/auth');

const router = express.Router();

// Require authentication for all income routes
router.use(auth);

// Get all income entries and create new income
router.route('/')
  .get(getIncomes)
  .post(createIncome);

// Get, update and delete income by ID
router.route('/:id')
  .get(getIncome)
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router; 