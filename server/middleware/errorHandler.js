const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Field Value';
    const field = Object.keys(err.keyValue)[0];
    errors = [{
      field,
      message: `${field} already exists`
    }];
  }
  
  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid Data';
    errors = [{
      field: err.path,
      message: `Invalid ${err.kind}`
    }];
  }
  
  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 