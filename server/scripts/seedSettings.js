// server/scripts/seedSettings.js
const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

async function seedSettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Define your default settings
    const defaultSettings = [
      {
        key: 'app_name',
        value: 'Farm Finance',
        category: 'system',
        description: 'Application name displayed throughout the app',
        isPublic: true
      },
      {
        key: 'currency',
        value: 'USD',
        category: 'finance',
        description: 'Default currency for financial transactions',
        isPublic: true
      },
      {
        key: 'notification_email',
        value: true,
        category: 'notification',
        description: 'Enable email notifications',
        isPublic: false
      },
      {
        key: 'theme',
        value: 'light',
        category: 'appearance',
        description: 'UI theme preference',
        isPublic: true
      }
    ];

    // Insert the settings
    for (const setting of defaultSettings) {
      await Setting.setSetting(setting.key, setting.value);
      console.log(`Added setting: ${setting.key}`);
    }

    console.log('Settings seeded successfully');
  } catch (error) {
    console.error('Error seeding settings:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedSettings();