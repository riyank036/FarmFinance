const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema } = require('../validation/userSchema');
const { JWT_SECRET, JWT_EXPIRY } = require('../config/db');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Validate input with Zod
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    const { username, email, password } = validationResult.data;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        message: 'User already exists with that email or username'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      authProvider: 'local'
    });

    // Set last login timestamp
    await user.updateLoginTimestamp();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.safeUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    // Validate input with Zod
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({
        message: 'Validation error',
        errors: formattedErrors
      });
    }

    const { email, password } = validationResult.data;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'You need to create an account first before logging in. Please click on Sign up / Register to get started.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Update last login timestamp
    await user.updateLoginTimestamp();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.safeUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { 
      username, 
      email, 
      profilePicture, 
      phoneNumber,
      location,
      farmDetails, 
      preferences 
    } = req.body;
    
    const updates = {};
    
    // Only add fields that are provided
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (profilePicture) updates.profilePicture = profilePicture;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    
    // Handle nested location object
    if (location) {
      updates.location = {};
      if (location.village) updates.location.village = location.village;
      if (location.district) updates.location.district = location.district;
      if (location.state) updates.location.state = location.state;
    }
    
    // Handle nested objects - farmDetails
    if (farmDetails) {
      updates.farmDetails = {};
      if (farmDetails.name) updates.farmDetails.name = farmDetails.name;
      if (farmDetails.location) updates.farmDetails.location = farmDetails.location;
      if (farmDetails.primaryCrops) updates.farmDetails.primaryCrops = farmDetails.primaryCrops;
      if (farmDetails.farmingType) updates.farmDetails.farmingType = farmDetails.farmingType;
      if (farmDetails.size) {
        updates.farmDetails.size = {};
        if (farmDetails.size.value) updates.farmDetails.size.value = farmDetails.size.value;
        if (farmDetails.size.unit) updates.farmDetails.size.unit = farmDetails.size.unit;
      }
      if (farmDetails.farmType) updates.farmDetails.farmType = farmDetails.farmType;
    }
    
    // Handle nested objects - preferences
    if (preferences) {
      updates.preferences = {};
      if (preferences.currency) updates.preferences.currency = preferences.currency;
      if (preferences.theme) updates.preferences.theme = preferences.theme;
      if (preferences.language) updates.preferences.language = preferences.language;
      if (preferences.dateFormat) updates.preferences.dateFormat = preferences.dateFormat;
      if (preferences.notifications) {
        updates.preferences.notifications = {};
        if (preferences.notifications.email !== undefined) 
          updates.preferences.notifications.email = preferences.notifications.email;
        if (preferences.notifications.app !== undefined) 
          updates.preferences.notifications.app = preferences.notifications.app;
      }
    }
    
    // Find and update the user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: user.safeUser
    });
  } catch (error) {
    next(error);
  }
}; 