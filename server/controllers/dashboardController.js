const Expense = require('../models/Expense');
const Income = require('../models/Income');
const User = require('../models/User');

// @desc    Get summary statistics (total income, total expenses, profit/loss)
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    // Aggregate total expenses
    const expenseResult = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { 
          _id: null, 
          totalExpense: { $sum: "$amount" } 
        } 
      }
    ]);
    
    // Aggregate total income
    const incomeResult = await Income.aggregate([
      { $match: { user: req.user._id } },
      { $group: { 
          _id: null, 
          totalIncome: { $sum: "$totalAmount" } 
        } 
      }
    ]);
    
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].totalExpense : 0;
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;
    const profit = totalIncome - totalExpense;
    
    res.json({
      success: true,
      data: {
        totalExpense,
        totalIncome,
        profit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly statistics for the current year
// @route   GET /api/dashboard/monthly
// @access  Private
exports.getMonthlyStats = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearInt = parseInt(year, 10);
    
    // Use the static method from Income model
    const monthlyIncome = await Income.getMonthlyStats(req.user._id, yearInt);
    
    // Get monthly expenses for the year
    const startDate = new Date(`${yearInt}-01-01`);
    const endDate = new Date(`${yearInt}-12-31`);
    
    // Get expenses by date range
    const expenses = await Expense.findByDateRange(req.user._id, startDate, endDate);
    
    // Aggregate expenses by month
    const expensesByMonth = {};
    expenses.forEach(expense => {
      const month = expense.date.getMonth() + 1; // 1-12
      if (!expensesByMonth[month]) {
        expensesByMonth[month] = 0;
      }
      expensesByMonth[month] += expense.amount;
    });
    
    // Combine data for all months
    const formattedData = monthlyIncome.map(incomeData => {
      const expenses = expensesByMonth[incomeData.month] || 0;
      return {
        month: incomeData.month,
        monthName: incomeData.monthName,
        income: incomeData.total,
        expenses: expenses,
        profit: incomeData.total - expenses
      };
    });
    
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Calculate date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    // Get expense categories
    const expenseCategories = await Expense.getTotalByCategory(req.user._id);
    
    // Get product revenue 
    const productRevenue = await Income.getTotalByProduct(req.user._id);
    
    // Get today's transactions
    const todayExpenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfToday, $lte: endOfToday }
    }).sort('-date').limit(5).lean();
    
    const todayIncome = await Income.find({
      user: req.user._id,
      date: { $gte: startOfToday, $lte: endOfToday }
    }).sort('-date').limit(5).lean();
    
    // Get recent transactions
    const recentExpenses = await Expense.find({
      user: req.user._id
    }).sort('-date').limit(10).lean();
    
    const recentIncome = await Income.find({
      user: req.user._id
    }).sort('-date').limit(10).lean();
    
    // Get counts and totals
    const totalExpenses = await Expense.countDocuments({ user: req.user._id });
    const totalIncome = await Income.countDocuments({ user: req.user._id });
    
    // Get pending transactions
    const pendingExpenses = await Expense.countDocuments({ 
      user: req.user._id,
      status: 'pending'
    });
    
    const pendingIncome = await Income.countDocuments({ 
      user: req.user._id,
      status: 'pending'
    });
    
    res.json({
      success: true,
      data: {
        expenseCategories,
        productRevenue,
        today: {
          expenses: todayExpenses,
          income: todayIncome
        },
        recent: {
          expenses: recentExpenses,
          income: recentIncome
        },
        totals: {
          expenses: totalExpenses,
          income: totalIncome
        },
        pending: {
          expenses: pendingExpenses,
          income: pendingIncome
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial summary for profile page
// @route   GET /api/dashboard/financial-summary
// @access  Private
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all expenses for this user
    const expenses = await Expense.find({ user: userId });
    
    // Get all income for this user
    const incomes = await Income.find({ user: userId });
    
    // Calculate total expense
    const totalExpense = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    
    // Calculate total income
    const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);
    
    // Calculate net (profit/loss)
    const netAmount = totalIncome - totalExpense;
    
    // Get last month's data
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Get last month's expenses
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= lastMonthStart && expenseDate <= lastMonthEnd;
    });
    
    // Get last month's income
    const lastMonthIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate >= lastMonthStart && incomeDate <= lastMonthEnd;
    });
    
    // Calculate last month's total expense
    const lastMonthTotalExpense = lastMonthExpenses.reduce((acc, expense) => acc + expense.amount, 0);
    
    // Calculate last month's total income
    const lastMonthTotalIncome = lastMonthIncomes.reduce((acc, income) => acc + income.amount, 0);
    
    // Calculate last month's net (profit/loss)
    const lastMonthNetAmount = lastMonthTotalIncome - lastMonthTotalExpense;
    
    // Get recent activity (last 5 transactions, both income and expense)
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(expense => ({
        id: expense._id,
        date: expense.date,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        type: 'expense'
      }));
      
    const recentIncomes = incomes
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(income => ({
        id: income._id,
        date: income.date,
        amount: income.amount,
        description: income.description,
        category: income.category,
        type: 'income'
      }));
      
    // Combine and sort recent activity
    const recentActivity = [...recentExpenses, ...recentIncomes]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
      
    res.json({
      success: true,
      data: {
        totalExpense,
        totalIncome,
        netAmount,
        lastMonth: {
          totalExpense: lastMonthTotalExpense,
          totalIncome: lastMonthTotalIncome,
          netAmount: lastMonthNetAmount
        },
        recentActivity
      }
    });
    
  } catch (error) {
    next(error);
  }
}; 