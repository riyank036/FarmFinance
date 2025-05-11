const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Path:', req.path);
    console.log('Auth middleware - Method:', req.method);
    console.log('Auth middleware - Authorization header present:', !!req.header('Authorization'));
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token, access denied' 
      });
    }

    try {
      // Verify token
      console.log('Auth middleware - Verifying token...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Auth middleware - Token decoded successfully, user ID:', decoded.id);
      
      // Find user with the id from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('Auth middleware - User not found for ID:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: 'Token is valid, but user not found' 
        });
      }

      if (!user.isActive) {
        console.log('Auth middleware - User account is deactivated');
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }
      
      // Add user to request object
      req.user = user;
      console.log('Auth middleware - Authentication successful, user:', user.username);
      next();
    } catch (error) {
      console.log('Auth middleware - Token verification error:', error.name, error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware - Unexpected error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

module.exports = auth; 