const mongoose = require('mongoose');
const User = require('../models/User');

// Function to make a user admin by email
async function makeUserAdmin(email) {
  try {
    // Get MongoDB URI from environment variable
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('MongoDB URI not found. Set MONGODB_URI environment variable.');
      process.exit(1);
    }
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`User ${user.username} (${user.email}) has been made an admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address: node makeAdmin.js your@email.com');
  process.exit(1);
}

makeUserAdmin(email); 