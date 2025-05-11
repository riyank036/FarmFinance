const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    console.log('===============================================');
    console.log('Received feedback submission request');
    console.log('User from auth middleware:', req.user ? `ID: ${req.user.id}, Email: ${req.user.email}` : 'No user');
    console.log('Request body:', req.body);
    console.log('Headers:', req.headers);
    
    // Return early with error if req.user is undefined or doesn't have id
    if (!req.user) {
      console.log('Feedback submission error: req.user is undefined');
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found in request object.'
      });
    }

    if (!req.user.id) {
      console.log('Feedback submission error: req.user.id is undefined');
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User ID not found.'
      });
    }

    const { message, category } = req.body;
    
    if (!message) {
      console.log('Feedback submission validation failed: No message provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide feedback message'
      });
    }
    
    console.log('Creating feedback for user ID:', req.user.id);
    console.log('Message:', message);
    console.log('Category:', category || 'General Feedback');
    
    try {
      // Create feedback with user ID from authenticated user
      const feedback = await Feedback.create({
        user: req.user.id,
        message,
        category: category || 'General Feedback'
      });
      
      console.log('Feedback created successfully:', feedback);
      
      return res.status(201).json({
        success: true,
        data: feedback
      });
    } catch (dbError) {
      console.error('Error creating feedback in database:', dbError);
      
      // Check for validation errors from Mongoose
      if (dbError.name === 'ValidationError') {
        const messages = Object.values(dbError.errors).map(val => val.message);
        return res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
      }
      
      // Check for cast errors (usually invalid ID format)
      if (dbError.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      throw dbError; // Rethrow to be caught by outer catch
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error submitting feedback. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's feedback
// @route   GET /api/feedback
// @access  Private
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id })
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Error getting user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving feedback'
    });
  }
};

// ----- ADMIN FEEDBACK MANAGEMENT ENDPOINTS -----

// @desc    Get all feedback entries
// @route   GET /api/admin/feedback
// @access  Admin
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'username email')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Error getting all feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving feedback entries'
    });
  }
};

// @desc    Get feedback by ID
// @route   GET /api/admin/feedback/:id
// @access  Admin
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'username email');
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error getting feedback by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving feedback'
    });
  }
};

// @desc    Update feedback status
// @route   PUT /api/admin/feedback/:id
// @access  Admin
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['New', 'In Review', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (New, In Review, Resolved)'
      });
    }
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'username email');
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback status'
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Admin
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback'
    });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/admin/feedback/stats
// @access  Admin
exports.getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    
    // Count by status
    const statusCounts = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Count by category
    const categoryCounts = await Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Get recent feedback
    const recentFeedback = await Feedback.find()
      .populate('user', 'username email')
      .sort('-createdAt')
      .limit(5);
    
    res.json({
      success: true,
      stats: {
        total,
        byStatus: statusCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        byCategory: categoryCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        recentFeedback
      }
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving feedback statistics'
    });
  }
}; 