const dotenv = require('dotenv');

// Load environment variables early
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
let errorHandler;
let connectDB;

// Initialize express app
const app = express();

// Middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// CORS configuration
const allowedOrigins = [
  'https://farmfinance-036.netlify.app',
  'https://farmfinance.netlify.app',
  'https://farmfinance.onrender.com',
  'https://farmfinance.onrender.com/api',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Basic route that always works
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FarmFinance API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Enhanced health check with more details
app.get('/api/health', (req, res) => {
  const status = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  res.json(status);
});

// Debug auth endpoint
app.get('/api/debug/auth', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  res.json({
    success: true,
    hasAuthHeader: !!req.header('Authorization'),
    hasToken: !!token,
    headersSent: JSON.stringify(req.headers)
  });
});

// Function to connect to MongoDB
const setupDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Log all registered models
    console.log('Registered Mongoose models:');
    Object.keys(mongoose.models).forEach(modelName => {
      console.log(` - ${modelName}`);
    });
    
    return true;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    console.log('Will continue to retry DB connection...');
    return false;
  }
};

// Function to set up routes
const setupRoutes = () => {
  try {
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/expenses', require('./routes/expenseRoutes'));
    app.use('/api/income', require('./routes/incomeRoutes'));
    app.use('/api/dashboard', require('./routes/dashboardRoutes'));
    app.use('/api/feedback', require('./routes/feedbackRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));
    app.use('/api/settings', require('./routes/settingRoutes'));
    console.log('Routes set up successfully');
  } catch (err) {
    console.error(`Error setting up routes: ${err.message}`);
  }
};

// Setup error handler
const setupErrorHandler = () => {
  try {
    errorHandler = require('./middleware/errorHandler');
    app.use(errorHandler);
    console.log('Error handler set up successfully');
  } catch (err) {
    console.error(`Error setting up error handler: ${err.message}`);
    app.use((err, req, res, next) => {
      console.error('Server error:', err.stack);
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: err.message
      });
    });
  }
};

// Start server
const PORT = parseInt(process.env.PORT || '10000', 10);

// Import setting controller for initialization
const settingController = require('./controllers/settingController');

// Initialize the server
const initServer = async () => {
  // Try to connect to database
  await setupDatabase();
  
  // Set up routes regardless of database connection
  setupRoutes();
  
  // Set up error handler
  setupErrorHandler();
  
  // Initialize default settings
  try {
    await settingController.initializeDefaultSettings();
  } catch (err) {
    console.error(`Error initializing settings: ${err.message}`);
  }
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Continue running the server
});

// Start the server
initServer();