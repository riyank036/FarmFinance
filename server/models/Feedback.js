const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    maxlength: [500, 'Feedback message cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['Bug Report', 'Feature Request', 'General Feedback', 'Support'],
    default: 'General Feedback'
  },
  status: {
    type: String,
    enum: ['New', 'In Review', 'Resolved'],
    default: 'New'
  },
  response: {
    type: String,
    trim: true,
    default: ''
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'feedbacks' // Explicitly setting collection name
});

// Pre-save hook to update isResolved based on status
feedbackSchema.pre('save', function(next) {
  if (this.status === 'Resolved') {
    this.isResolved = true;
  } else {
    this.isResolved = false;
  }
  next();
});

// Create index for faster lookup
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ createdAt: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ isResolved: 1 });

// Virtual for formatted date
feedbackSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback; 