const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

/**
 * Get system statistics
 * @route   GET /api/admin/stats
 * @access  Admin
 */
exports.getSystemStats = async (req, res) => {
  try {
    // Get counts
    const usersCount = await User.countDocuments();
    const expensesCount = await Expense.countDocuments();
    const incomeCount = await Income.countDocuments();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt');

    // Get total expenses and income
    const expensesAggregate = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const incomeAggregate = await Income.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = expensesAggregate.length > 0 ? expensesAggregate[0].total : 0;
    const totalIncome = incomeAggregate.length > 0 ? incomeAggregate[0].total : 0;

    // Get weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gt: oneWeekAgo } });
    const expensesThisWeek = await Expense.countDocuments({ date: { $gt: oneWeekAgo } });
    const incomeThisWeek = await Income.countDocuments({ date: { $gt: oneWeekAgo } });

    res.json({
      success: true,
      stats: {
        users: {
          total: usersCount,
          newThisWeek: newUsersThisWeek,
          recentUsers
        },
        finances: {
          totalExpenses,
          totalIncome,
          netBalance: totalIncome - totalExpenses,
          expensesCount,
          incomeCount,
          expensesThisWeek,
          incomeThisWeek
        }
      }
    });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system statistics'
    });
  }
};

/**
 * Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users'
    });
  }
};

/**
 * Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's expenses and income
    const expenses = await Expense.find({ user: req.params.id }).sort({ date: -1 });
    const income = await Income.find({ user: req.params.id }).sort({ date: -1 });

    res.json({
      success: true,
      user,
      finances: {
        expenses,
        income
      }
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user'
    });
  }
};

/**
 * Update user
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
exports.updateUser = async (req, res) => {
  try {
    // Don't allow updating password through this route
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

/**
 * Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    // Don't allow admin to delete themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's expenses and income
    await Expense.deleteMany({ user: req.params.id });
    await Income.deleteMany({ user: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

/**
 * Get all expenses for all users
 * @route   GET /api/admin/expenses
 * @access  Admin
 */
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('user', 'username email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Error getting all expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving expenses'
    });
  }
};

/**
 * Get all income for all users
 * @route   GET /api/admin/income
 * @access  Admin
 */
exports.getAllIncome = async (req, res) => {
  try {
    const income = await Income.find()
      .populate('user', 'username email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: income.length,
      income
    });
  } catch (error) {
    console.error('Error getting all income:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving income'
    });
  }
};

/**
 * Delete expense
 * @route   DELETE /api/admin/expenses/:id
 * @access  Admin
 */
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense'
    });
  }
};

/**
 * Delete income
 * @route   DELETE /api/admin/income/:id
 * @access  Admin
 */
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    res.json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting income'
    });
  }
};

/**
 * Get monthly financial data for all users
 * @route   GET /api/admin/stats/monthly
 * @access  Admin
 */
exports.getMonthlyFinancialData = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year, 11, 31); // December 31st of the year
    
    // Get monthly income data
    const monthlyIncome = await Income.aggregate([
      { 
        $match: { 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: { $month: "$date" },
          income: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);
    
    // Get monthly expense data
    const monthlyExpenses = await Expense.aggregate([
      { 
        $match: { 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: { $month: "$date" },
          expenses: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);
    
    // Combine the data
    const monthlyData = Array(12).fill(0).map((_, index) => {
      const month = index + 1;
      const monthName = new Date(year, index, 1).toLocaleString('default', { month: 'long' });
      
      const incomeData = monthlyIncome.find(item => item._id === month);
      const expenseData = monthlyExpenses.find(item => item._id === month);
      
      return {
        month,
        monthName,
        income: incomeData ? incomeData.income : 0,
        incomeCount: incomeData ? incomeData.count : 0,
        expenses: expenseData ? expenseData.expenses : 0,
        expensesCount: expenseData ? expenseData.count : 0
      };
    });
    
    res.json({
      success: true,
      monthlyData
    });
  } catch (error) {
    console.error('Error getting monthly financial data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving monthly financial data'
    });
  }
}; 