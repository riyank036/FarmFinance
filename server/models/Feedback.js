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
  }
}, {
  timestamps: true
});

// Create index for faster lookup
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ createdAt: 1 });
feedbackSchema.index({ status: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback; 