/**
 * Script to create an admin user or promote an existing user to admin role
 * 
 * Usage:
 * - Create a new admin: node createAdmin.js create admin@example.com Admin123!
 * - Promote existing user: node createAdmin.js promote user@example.com
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Create or update an admin user
 */
async function createAdminUser(email, password) {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    console.error('Make sure your .env file contains MONGODB_URI');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User exists, update role and password if needed
      console.log(`User with email ${email} already exists.`);
      
      // Update role to admin if not already
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        console.log('Updated user role to admin.');
      }
      
      // Update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        existingUser.password = await bcrypt.hash(password, salt);
        console.log('Updated user password.');
      }
      
      await existingUser.save();
      console.log('Admin user updated successfully!');
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const adminUser = new User({
        username: email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Update admin password
 */
async function updateAdminPassword(email, newPassword) {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    console.error('Make sure your .env file contains MONGODB_URI');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Find admin user
    const adminUser = await User.findOne({ email });
    
    if (!adminUser) {
      console.error(`User with email ${email} not found.`);
      return;
    }
    
    // Update password
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(newPassword, salt);
    await adminUser.save();
    
    console.log('Admin password updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Command-line argument parsing
const command = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!command || !email || !password) {
  console.log('Usage:');
  console.log('  node createAdmin.js create <email> <password> - Create a new admin user');
  console.log('  node createAdmin.js update <email> <newPassword> - Update admin password');
  process.exit(1);
}

// Execute appropriate function based on command
if (command === 'create') {
  createAdminUser(email, password);
} else if (command === 'update') {
  updateAdminPassword(email, password);
} else {
  console.error('Invalid command. Use "create" or "update".');
  process.exit(1);
} 