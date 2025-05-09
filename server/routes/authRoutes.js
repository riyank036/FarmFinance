const express = require('express');
const { register, login, getMe, forgotPassword, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Get current user
router.get('/me', auth, getMe);

// Update user profile
router.put('/profile', auth, updateProfile);

module.exports = router; 