const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in query results by default
  },
  profilePicture: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    village: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  preferences: {
    currency: {
      type: String,
      default: 'INR'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      default: 'en'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      app: {
        type: Boolean,
        default: true
      }
    }
  },
  farmDetails: {
    name: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    size: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['acres', 'hectares'],
        default: 'acres'
      }
    },
    primaryCrops: {
      type: [String],
      default: []
    },
    farmingType: {
      type: String,
      enum: ['Organic', 'Conventional', 'Mixed'],
      default: 'Conventional'
    },
    farmType: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster lookups
userSchema.index({ 'farmDetails.location': 1 });
userSchema.index({ createdAt: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

// Virtual for account age in days
userSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual to get expenses (not stored in DB, populated on demand)
userSchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'user'
});

// Virtual to get incomes (not stored in DB, populated on demand)
userSchema.virtual('incomes', {
  ref: 'Income',
  localField: '_id',
  foreignField: 'user'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create a method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to user
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiry (1 hour)
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  
  return resetToken;
};

// Create method to generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to user
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set expiry (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Update lastLogin timestamp
userSchema.methods.updateLoginTimestamp = async function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Need to select password explicitly since we have select: false
  if (!this.password) {
    const user = await this.constructor.findById(this._id).select('+password');
    return await bcrypt.compare(candidatePassword, user.password);
  }
  
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual to get safe user data without sensitive fields
userSchema.virtual('safeUser').get(function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    profilePicture: this.profilePicture,
    role: this.role,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    preferences: this.preferences,
    farmDetails: this.farmDetails,
    fullName: this.fullName,
    accountAge: this.accountAge
  };
});

// Static method to get user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 