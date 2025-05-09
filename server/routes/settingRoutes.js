const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/auth');

// @route   GET /api/settings/public
// @desc    Get public settings
// @access  Public
router.get('/public', settingController.getPublicSettings);

module.exports = router; 