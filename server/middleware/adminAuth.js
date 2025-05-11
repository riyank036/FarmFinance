const User = require('../models/User');

/**
 * Middleware to verify that a user has admin role
 * This middleware should be used after the regular auth middleware
 */
const adminAuth = (req, res, next) => {
  try {
    // Check if user exists in request (set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // User is authenticated and has admin role, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = adminAuth; 