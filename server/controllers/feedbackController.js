const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res, next) => {
  try {
    const { message, category } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide feedback message'
      });
    }
    
    const feedback = await Feedback.create({
      user: req.user.id,
      message,
      category: category || 'General Feedback'
    });
    
    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's feedback
// @route   GET /api/feedback
// @access  Private
exports.getUserFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id })
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
}; 