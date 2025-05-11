const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  product: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [50, 'Product name cannot exceed 50 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be a positive number']
  },
  ratePerUnit: {
    type: Number,
    required: [true, 'Rate per unit is required'],
    min: [0, 'Rate per unit must be a positive number']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount must be a positive number']
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
  buyer: {
    type: String,
    trim: true,
    maxlength: [100, 'Buyer name cannot exceed 100 characters']
  },
  isRegularIncome: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'received', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'received'
  },
  season: {
    type: String,
    enum: {
      values: ['spring', 'summer', 'fall', 'winter', 'other'],
      message: '{VALUE} is not a valid season'
    },
    default: 'other'
  },
  isManualTotal: {
    type: Boolean,
    default: false
  },
  commissionAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
incomeSchema.index({ user: 1, date: -1 });
incomeSchema.index({ product: 1 });
incomeSchema.index({ isRegularIncome: 1 });
incomeSchema.index({ tags: 1 });
incomeSchema.index({ buyer: 1 });
incomeSchema.index({ createdAt: 1 });

// Pre-save middleware to calculate total amount if not provided
incomeSchema.pre('save', function(next) {
  // Check if totalAmount has been manually set
  if (this.isModified('totalAmount') && this.totalAmount !== this.quantity * this.ratePerUnit) {
    // If totalAmount is manually set and different from calculated value, set isManualTotal flag
    this.isManualTotal = true;
  } else if (this.isModified('quantity') || this.isModified('ratePerUnit')) {
    // Only auto-calculate if totalAmount is not manually set or if quantities changed
    if (!this.isManualTotal) {
      this.totalAmount = this.quantity * this.ratePerUnit;
    }
  }
  
  // Calculate commission amount if manual total is less than calculated total
  const calculatedTotal = this.quantity * this.ratePerUnit;
  if (this.isManualTotal && this.totalAmount < calculatedTotal) {
    this.commissionAmount = calculatedTotal - this.totalAmount;
  } else {
    this.commissionAmount = 0;
  }
  
  next();
});

// Pre-save middleware to format tags (lowercase and remove duplicates)
incomeSchema.pre('save', function(next) {
  if (this.isModified('tags')) {
    // Transform tags to lowercase
    this.tags = this.tags.map(tag => tag.toLowerCase());
    
    // Remove duplicates
    this.tags = [...new Set(this.tags)];
  }
  next();
});

// Virtual for formatted date
incomeSchema.virtual('formattedDate').get(function() {
  return this.date ? this.date.toLocaleDateString() : '';
});

// Virtual for profit margin
incomeSchema.virtual('profitMargin').get(function() {
  // Assuming cost is 70% of the rate (example calculation)
  const estimatedCost = this.ratePerUnit * 0.7;
  const profit = this.ratePerUnit - estimatedCost;
  return (profit / this.ratePerUnit * 100).toFixed(2);
});

// Virtual to check if income is recent (within last 30 days)
incomeSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.date >= thirtyDaysAgo;
});

// Method to update payment status
incomeSchema.methods.updateStatus = async function(newStatus) {
  if (!['pending', 'received', 'cancelled'].includes(newStatus)) {
    throw new Error('Invalid status value');
  }
  this.status = newStatus;
  return this.save();
};

// Static method to find income by date range
incomeSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Static method to get total income by product
incomeSchema.statics.getTotalByProduct = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { 
      _id: "$product", 
      total: { $sum: "$totalAmount" },
      quantity: { $sum: "$quantity" },
      count: { $sum: 1 }
    }},
    { $sort: { total: -1 } }
  ]);
  
  return result;
};

// Static method to get monthly income stats
incomeSchema.statics.getMonthlyStats = async function(userId, year) {
  const currentYear = year || new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st of the year
  const endDate = new Date(currentYear, 11, 31); // December 31st of the year
  
  const result = await this.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate } 
      } 
    },
    {
      $group: {
        _id: { $month: "$date" },
        total: { $sum: "$totalAmount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } } // Sort by month
  ]);
  
  // Transform to array with all months (including zeros for months with no income)
  const monthlyData = Array(12).fill(0).map((_, index) => {
    const monthData = result.find(item => item._id === index + 1);
    return {
      month: index + 1,
      monthName: new Date(currentYear, index, 1).toLocaleString('default', { month: 'long' }),
      total: monthData ? monthData.total : 0,
      count: monthData ? monthData.count : 0
    };
  });
  
  return monthlyData;
};

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income; 