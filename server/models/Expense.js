const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    minlength: [2, 'Category must be at least 2 characters'],
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be a positive number']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['cash', 'credit', 'bank', 'other'],
      message: '{VALUE} is not a valid payment method'
    },
    default: 'cash'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  receiptImage: {
    type: String, // URL to image storage
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'completed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ isRecurring: 1 });
expenseSchema.index({ tags: 1 });
expenseSchema.index({ createdAt: 1 });

// Virtual for formatted date
expenseSchema.virtual('formattedDate').get(function() {
  return this.date ? this.date.toLocaleDateString() : '';
});

// Virtual to check if expense is recent (within last 7 days)
expenseSchema.virtual('isRecent').get(function() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return this.date >= oneWeekAgo;
});

// Methods for business logic
expenseSchema.methods.updateStatus = async function(newStatus) {
  if (!['pending', 'completed', 'cancelled'].includes(newStatus)) {
    throw new Error('Invalid status value');
  }
  this.status = newStatus;
  return this.save();
};

// Static method to find expenses by date range
expenseSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Static method to get total expenses by category
expenseSchema.statics.getTotalByCategory = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { 
      _id: "$category", 
      total: { $sum: "$amount" },
      count: { $sum: 1 }
    }},
    { $sort: { total: -1 } }
  ]);
  
  return result;
};

// Mongoose middleware - pre-save hook
expenseSchema.pre('save', function(next) {
  // If no specific transformations needed, just pass to next middleware
  next();
});

// Middleware to format tags before saving (lowercase and remove duplicates)
expenseSchema.pre('save', function(next) {
  if (this.isModified('tags')) {
    // Transform tags to lowercase
    this.tags = this.tags.map(tag => tag.toLowerCase());
    
    // Remove duplicates
    this.tags = [...new Set(this.tags)];
  }
  next();
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 