const Income = require('../models/Income');
const { incomeSchema, updateIncomeSchema } = require('../validation/incomeSchema');

// @desc    Get all income entries for a user
// @route   GET /api/income
// @access  Private
exports.getIncomes = async (req, res, next) => {
  try {
    // Get query parameters
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const sort = req.query.sort || '-date';
    const product = req.query.product;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Create filter object
    let filter = { user: req.user.id };

    // Add product filter
    if (product) {
      filter.product = product;
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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get income entries
    const incomes = await Income.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Count total income entries
    const total = await Income.countDocuments(filter);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      count: incomes.length,
      total: total,
      pagination: {
        page: page,
        limit: limit,
        pages: totalPages
      },
      data: incomes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single income entry
// @route   GET /api/income/:id
// @access  Private
exports.getIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user.id
    }).lean();

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.json({
      success: true,
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create income entry
// @route   POST /api/income
// @access  Private
exports.createIncome = async (req, res, next) => {
  try {
    // Validate income data with Zod
    const validationResult = incomeSchema.safeParse(req.body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    const validatedData = validationResult.data;
    
    // Create income with validated data and user ID
    const income = await Income.create({
      ...validatedData,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income entry
// @route   PUT /api/income/:id
// @access  Private
exports.updateIncome = async (req, res, next) => {
  try {
    // Validate update data with Zod
    const validationResult = updateIncomeSchema.safeParse(req.body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    const validatedData = validationResult.data;
    
    // Find income and check ownership
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    // Make sure user owns the income entry
    if (income.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this income entry'
      });
    }

    // Update with validated data
    income = await Income.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income entry
// @route   DELETE /api/income/:id
// @access  Private
exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    // Make sure user owns the income entry
    if (income.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this income entry'
      });
    }

    await income.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 