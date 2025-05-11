const mongoose = require('mongoose');

// Set JWT secrets from environment variables or use defaults (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'farmfinance_dev_secret_key_2023';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Export for use in other files
module.exports = {
  connectDB,
  JWT_SECRET,
  JWT_EXPIRY
}; 