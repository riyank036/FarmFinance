const express = require('express');
const { 
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Require authentication for all income routes
router.use(authMiddleware);

// Get all income entries for user
router.get('/', getIncomes);

// Get single income entry
router.get('/:id', getIncome);

// Create new income entry
router.post('/', createIncome);

// Update income entry
router.put('/:id', updateIncome);

// Delete income entry
router.delete('/:id', deleteIncome);

module.exports = router; 