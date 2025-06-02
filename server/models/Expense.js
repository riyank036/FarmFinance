const mongoose = require('mongoose');

// Create expense schema
const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'bank', 'other'],
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
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Add indexes for searching
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });

// Method to get formatted date
expenseSchema.virtual('formattedDate').get(function() {
  if (this.date) {
    return this.date.toLocaleDateString();
  } else {
    return '';
  }
});

// Method to check if expense is recent (within last 7 days)
expenseSchema.virtual('isRecent').get(function() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  if (this.date >= oneWeekAgo) {
    return true;
  } else {
    return false;
  }
});

// Method to update expense status
expenseSchema.methods.updateStatus = async function(newStatus) {
  if (newStatus === 'pending' || newStatus === 'completed' || newStatus === 'cancelled') {
    this.status = newStatus;
    return await this.save();
  } else {
    throw new Error('Invalid status value');
  }
};

// Method to find expenses by date range
expenseSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Method to get total expenses by category
expenseSchema.statics.getTotalByCategory = async function(userId) {
  const result = await this.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(userId) 
      } 
    },
    { 
      $group: { 
        _id: "$category", 
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { 
      $sort: { 
        total: -1 
      } 
    }
  ]);
  
  return result;
};

// Make tags lowercase before saving
expenseSchema.pre('save', function(next) {
  if (this.isModified('tags')) {
    // Make all tags lowercase
    for (let i = 0; i < this.tags.length; i++) {
      this.tags[i] = this.tags[i].toLowerCase();
    }
    
    // Remove duplicate tags
    const uniqueTags = [];
    for (let i = 0; i < this.tags.length; i++) {
      if (!uniqueTags.includes(this.tags[i])) {
        uniqueTags.push(this.tags[i]);
      }
    }
    this.tags = uniqueTags;
  }
  next();
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 