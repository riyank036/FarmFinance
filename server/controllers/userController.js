const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {};
    
    // Allow updating personal info
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;
    
    // Allow updating preferences
    if (req.body.preferences) {
      fieldsToUpdate.preferences = {
        ...req.user.preferences,
        ...req.body.preferences
      };
    }
    
    // Allow updating farm details
    if (req.body.farmDetails) {
      fieldsToUpdate.farmDetails = {
        ...req.user.farmDetails,
        ...req.body.farmDetails
      };
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly financial data
// @route   GET /api/user/monthly-financial/:userId
// @access  Private
exports.getMonthlyFinancialData = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if the request user is the same as the userId in params or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
      });
    }

    // Get all income transactions
    const incomeTransactions = await Income.find({ user: userId })
      .select('totalAmount date product note')
      .sort({ date: -1 })
      .lean();
    
    // Get all expense transactions
    const expenseTransactions = await Expense.find({ user: userId })
      .select('amount date category note')
      .sort({ date: -1 })
      .lean();

    // Combine transactions and group by month
    const monthlyData = {};

    // Process income transactions
    incomeTransactions.forEach(income => {
      const date = new Date(income.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          monthName: getMonthName(date.getMonth()),
          year: date.getFullYear(),
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
          transactions: []
        };
      }
      
      // Add to total income
      monthlyData[monthYear].totalIncome += income.totalAmount;
      
      // Add to transactions list (limited to top 5 per month later)
      monthlyData[monthYear].transactions.push({
        date: income.date,
        amount: income.totalAmount,
        type: 'Income',
        category: income.product,
        note: income.note || null
      });
    });

    // Process expense transactions
    expenseTransactions.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          monthName: getMonthName(date.getMonth()),
          year: date.getFullYear(),
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
          transactions: []
        };
      }
      
      // Add to total expenses
      monthlyData[monthYear].totalExpenses += expense.amount;
      
      // Add to transactions list (limited to top 5 per month later)
      monthlyData[monthYear].transactions.push({
        date: expense.date,
        amount: expense.amount,
        type: 'Expense',
        category: expense.category,
        note: expense.note || null
      });
    });

    // Calculate net profit and limit transactions to 5 per month
    Object.keys(monthlyData).forEach(key => {
      const monthData = monthlyData[key];
      
      // Calculate net profit
      monthData.netProfit = monthData.totalIncome - monthData.totalExpenses;
      
      // Sort transactions by date (newest first) and limit to 5
      monthData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      monthData.transactions = monthData.transactions.slice(0, 5);
    });

    // Convert the object to an array and sort by month-year (newest first)
    const result = Object.values(monthlyData).sort((a, b) => {
      return new Date(b.year, parseInt(b.month.split('-')[1]) - 1) - 
             new Date(a.year, parseInt(a.month.split('-')[1]) - 1);
    });

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get month name
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
} 