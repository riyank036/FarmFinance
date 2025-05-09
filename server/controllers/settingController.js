const Setting = require('../models/Setting');

/**
 * Get all settings (admin only)
 * @route   GET /api/admin/settings
 * @access  Admin
 */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.key,
        value: setting.value,
        description: setting.description,
        isPublic: setting.isPublic,
        updatedAt: setting.updatedAt
      });
      return acc;
    }, {});

    res.json({
      success: true,
      settings: groupedSettings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings'
    });
  }
};

/**
 * Get public settings (available to all authenticated users)
 * @route   GET /api/settings/public
 * @access  Public
 */
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Setting.find({ isPublic: true });
    
    // Convert to key-value object for easier consumption
    const publicSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json({
      success: true,
      settings: publicSettings
    });
  } catch (error) {
    console.error('Error getting public settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving public settings'
    });
  }
};

/**
 * Update settings (admin only)
 * @route   PUT /api/admin/settings
 * @access  Admin
 */
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings format. Expected an array of settings.'
      });
    }

    const updatedSettings = [];

    // Process each setting
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        continue; // Skip invalid settings
      }

      const updatedSetting = await Setting.setSetting(
        setting.key,
        setting.value,
        req.user._id
      );

      // If additional properties are provided, update them
      if (setting.description || setting.category || setting.isPublic !== undefined) {
        const updateData = {};
        
        if (setting.description) updateData.description = setting.description;
        if (setting.category) updateData.category = setting.category;
        if (setting.isPublic !== undefined) updateData.isPublic = setting.isPublic;
        
        if (Object.keys(updateData).length > 0) {
          await Setting.findByIdAndUpdate(updatedSetting._id, updateData);
        }
      }

      updatedSettings.push({
        key: setting.key,
        value: setting.value,
        updated: true
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      updated: updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
};

/**
 * Initialize default settings
 * This should be called during app startup or manually by an admin
 */
exports.initializeDefaultSettings = async () => {
  try {
    const defaultSettings = [
      {
        key: 'siteTitle',
        value: 'Farm Finance',
        category: 'system',
        description: 'Website title',
        isPublic: true
      },
      {
        key: 'defaultCurrency',
        value: 'USD',
        category: 'finance',
        description: 'Default currency for new users',
        isPublic: true
      },
      {
        key: 'defaultLanguage',
        value: 'en',
        category: 'system',
        description: 'Default language',
        isPublic: true
      },
      {
        key: 'enableUserRegistration',
        value: true,
        category: 'system',
        description: 'Allow new user registrations',
        isPublic: false
      },
      {
        key: 'enableEmailNotifications',
        value: true,
        category: 'notification',
        description: 'Enable system email notifications',
        isPublic: false
      },
      {
        key: 'dataRetentionDays',
        value: 365,
        category: 'system',
        description: 'Number of days to retain user data',
        isPublic: false
      },
      {
        key: 'maintenanceMode',
        value: false,
        category: 'system',
        description: 'Enable maintenance mode',
        isPublic: true
      }
    ];

    // Check if settings exist
    for (const setting of defaultSettings) {
      const exists = await Setting.findOne({ key: setting.key });
      if (!exists) {
        await Setting.create(setting);
        console.log(`Created default setting: ${setting.key}`);
      }
    }

    console.log('Default settings initialized');
    return true;
  } catch (error) {
    console.error('Error initializing default settings:', error);
    return false;
  }
}; 