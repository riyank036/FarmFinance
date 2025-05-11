// Simple validation schemas for user registration and login
const registerSchema = {
  safeParse: (data) => {
    const errors = {};
    let hasErrors = false;
    
    // Validate username
    if (!data.username || data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      hasErrors = true;
    }
    
    // Validate email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address';
      hasErrors = true;
    }
    
    // Validate password
    if (!data.password || data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }
    
    return {
      success: !hasErrors,
      data: hasErrors ? null : data,
      error: {
        format: () => errors
      }
    };
  }
};

const loginSchema = {
  safeParse: (data) => {
    const errors = {};
    let hasErrors = false;
    
    // Validate email
    if (!data.email) {
      errors.email = 'Email is required';
      hasErrors = true;
    }
    
    // Validate password
    if (!data.password) {
      errors.password = 'Password is required';
      hasErrors = true;
    }
    
    return {
      success: !hasErrors,
      data: hasErrors ? null : data,
      error: {
        format: () => errors
      }
    };
  }
};

module.exports = {
  registerSchema,
  loginSchema
}; 