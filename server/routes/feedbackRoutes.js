const express = require('express');
const { submitFeedback, getUserFeedback } = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit feedback
router.post('/', auth, submitFeedback);

// Get user's feedback
router.get('/', auth, getUserFeedback);

module.exports = router; 