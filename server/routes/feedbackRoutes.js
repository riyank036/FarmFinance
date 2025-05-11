const express = require('express');
const { submitFeedback, getUserFeedback } = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

const router = express.Router();

// Test route - no auth required
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Feedback routes are working' });
});

// Debug route - verify auth middleware
router.get('/auth-check', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Test submission endpoint without auth (for debugging)
router.post('/test-submit', (req, res) => {
  const { message, category } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide feedback message'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Test feedback received (no auth)',
    data: {
      message,
      category: category || 'General Feedback',
      testOnly: true
    }
  });
});

// Submit feedback
router.post('/', auth, submitFeedback);

// Get user's feedback
router.get('/', auth, getUserFeedback);

module.exports = router; 