const Expense = require('../models/Expense');
const { expenseSchema, updateExpenseSchema } = require('../validation/expenseSchema');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-date',
      category,
      startDate,
      endDate,
      isRecurring,
      tags
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };

    if (category) filter.category = category;
    if (isRecurring) filter.isRecurring = isRecurring === 'true';
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Add tags filter if provided
    if (tags) {
      // Handle comma-separated tags
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    // Get pagination values
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Expense.countDocuments(filter);
    
    res.json({
      success: true,
      count: expenses.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
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
    // Get total expenses by category
    const categorySummary = await Expense.getTotalByCategory(req.user.id);
    
    // Get today's expenses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    }).lean();
    
    // Get this month's expenses
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    }).lean();
    
    // Calculate totals
    const totalToday = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalThisMonth = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Get recurring expenses
    const recurringExpenses = await Expense.find({
      user: req.user.id,
      isRecurring: true
    }).lean();
    
    const totalRecurring = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    res.json({
      success: true,
      data: {
        categorySummary,
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
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id
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
    // Validate expense data with Zod
    const validationResult = expenseSchema.safeParse(req.body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    const validatedData = validationResult.data;
    
    // Create expense with validated data and user ID
    const expense = await Expense.create({
      ...validatedData,
      user: req.user.id
    });

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
    // Validate update data with Zod
    const validationResult = updateExpenseSchema.safeParse(req.body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    const validatedData = validationResult.data;
    
    // Find expense and check ownership
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense'
      });
    }

    // Update with validated data
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: expense
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
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, completed, or cancelled)'
      });
    }
    
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense'
      });
    }
    
    // Use the model method to update status
    await expense.updateStatus(status);
    
    res.json({
      success: true,
      data: expense
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
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      data: {}
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