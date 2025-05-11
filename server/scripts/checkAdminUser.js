const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB Atlas connection string from .env
const MONGODB_URI = 'mongodb+srv://riyankpatel036:Riyankpatel12345@cluster0.fvzbp.mongodb.net/farmfinance';

async function checkAdminUser() {
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

    console.log('Admin user found:');
    console.log('- Username:', user.username);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Password hash exists:', !!user.password);
    
    // Print the collections in the database
    const collections = await mongoose.connection.db.collections();
    console.log('\nCollections in the database:');
    for (let collection of collections) {
      console.log(`- ${collection.collectionName}`);
    }
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the function
checkAdminUser(); 