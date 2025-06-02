const Expense = require('../models/Expense');
const { expenseSchema, updateExpenseSchema } = require('../validation/expenseSchema');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    // Get query parameters
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const sort = req.query.sort || '-date';
    const category = req.query.category;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const isRecurring = req.query.isRecurring;
    const tags = req.query.tags;

    // Create filter object
    let filter = { user: req.user.id };

    // Add category filter
    if (category) {
      filter.category = category;
    }

    // Add recurring filter
    if (isRecurring) {
      filter.isRecurring = isRecurring === 'true';
    }
    
    // Add date filter
    if (startDate || endDate) {
      filter.date = {};
      
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    // Add tags filter
    if (tags) {
      const tagArray = tags.split(',');
      const cleanedTags = [];
      
      for (let i = 0; i < tagArray.length; i++) {
        cleanedTags.push(tagArray[i].trim().toLowerCase());
      }
      
      filter.tags = { $in: cleanedTags };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get expenses
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Count total expenses
    const total = await Expense.countDocuments(filter);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    // Send response
    res.json({
      success: true,
      count: expenses.length,
      total: total,
      pagination: {
        page: page,
        limit: limit,
        pages: totalPages
      },
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense stats for a user
// @route   GET /api/expenses/stats
// @access  Private
exports.getExpenseStats = async (req, res, next) => {
  try {
    // Get category summary
    const categorySummary = await Expense.getTotalByCategory(req.user.id);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's expenses
    const todayExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    }).lean();
    
    // Calculate total for today
    let totalToday = 0;
    for (let i = 0; i < todayExpenses.length; i++) {
      totalToday += todayExpenses[i].amount;
    }
    
    // Get first day of month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get last day of month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Get monthly expenses
    const monthlyExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    }).lean();
    
    // Calculate total for month
    let totalThisMonth = 0;
    for (let i = 0; i < monthlyExpenses.length; i++) {
      totalThisMonth += monthlyExpenses[i].amount;
    }
    
    // Get recurring expenses
    const recurringExpenses = await Expense.find({
      user: req.user.id,
      isRecurring: true
    }).lean();
    
    // Calculate total recurring
    let totalRecurring = 0;
    for (let i = 0; i < recurringExpenses.length; i++) {
      totalRecurring += recurringExpenses[i].amount;
    }
    
    // Send response
    res.json({
      success: true,
      data: {
        categorySummary: categorySummary,
        todayExpenses: {
          count: todayExpenses.length,
          total: totalToday
        },
        monthlyExpenses: {
          count: monthlyExpenses.length,
          total: totalThisMonth
        },
        recurringExpenses: {
          count: recurringExpenses.length,
          total: totalRecurring
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;
    
    const expense = await Expense.findOne({
      _id: expenseId,
      user: userId
    }).lean();

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    // Validate expense data
    const validationResult = expenseSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    // Get validated data
    const expenseData = validationResult.data;
    
    // Add user ID to expense data
    expenseData.user = req.user.id;
    
    // Create expense
    const expense = await Expense.create(expenseData);

    // Send response
    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    // Validate update data
    const validationResult = updateExpenseSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    // Get expense ID and user ID
    const expenseId = req.params.id;
    const userId = req.user.id;
    
    // Check if expense exists and belongs to user
    const existingExpense = await Expense.findOne({
      _id: expenseId,
      user: userId
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Get validated data
    const updateData = validationResult.data;
    
    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      updateData,
      { new: true }
    );

    // Send response
    res.json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;
    
    // Find and delete expense
    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      user: userId
    });

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
    next(error);
  }
};

// @desc    Get expenses by date range
// @route   GET /api/expenses/date-range
// @access  Private
exports.getExpensesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate are required'
      });
    }
    
    // Use static model method
    const expenses = await Expense.findByDateRange(
      req.user.id,
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense status
// @route   PATCH /api/expenses/:id/status
// @access  Private
exports.updateExpenseStatus = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;
    
    // Validate status
    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Status is required and must be a string'
      });
    }
    
    // Check if expense exists and belongs to user
    const existingExpense = await Expense.findOne({
      _id: expenseId,
      user: userId
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update expense status
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { status },
      { new: true }
    );

    // Send response
    res.json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
}; 