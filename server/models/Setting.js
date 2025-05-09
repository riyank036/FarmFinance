const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: {
    type: String,
    enum: ['system', 'appearance', 'finance', 'notification', 'user'],
    default: 'system'
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add a method to get settings by category
settingSchema.statics.getByCategory = async function(category, isPublic = false) {
  const query = { category };
  
  if (isPublic) {
    query.isPublic = true;
  }
  
  return this.find(query);
};

// Add a method to get a single setting by key
settingSchema.statics.getByKey = async function(key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

// Add a method to set a setting value
settingSchema.statics.setSetting = async function(key, value, userId = null) {
  const update = { 
    value,
    lastUpdatedBy: userId
  };

  return this.findOneAndUpdate(
    { key }, 
    update, 
    { new: true, upsert: true }
  );
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting; 