const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB Atlas connection string from .env
const MONGODB_URI = process.env.MONGODB_URI;

async function forceUpdateAdminPassword() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Find the admin user
    const adminEmail = 'riyankpatel036@gmail.com';
    const user = await User.findOne({ email: adminEmail }).select('+password');

    if (!user) {
      console.error(`User with email ${adminEmail} not found.`);
      return;
    }

    console.log('Admin user found:', user.username);
    console.log('Current role:', user.role);
    
    // Ensure role is set to admin
    user.role = 'admin';
    
    // Generate new password hash directly (bypassing any middleware)
    const salt = await bcrypt.genSalt(10);
    const newPassword = 'Riyank3621';
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Set the password directly
    user.password = hashedPassword;
    
    // Save without validation or running middleware
    await User.findByIdAndUpdate(user._id, {
      role: 'admin',
      password: hashedPassword
    }, { new: true });
    
    console.log('Admin password forcefully updated. Please try logging in again.');
    console.log('Email:', adminEmail);
    console.log('Password:', newPassword);
    
    // Verify the update worked
    const updatedUser = await User.findOne({ email: adminEmail }).select('+password');
    const passwordMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the function
forceUpdateAdminPassword(); 