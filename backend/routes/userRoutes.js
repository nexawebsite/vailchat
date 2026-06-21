const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// @route   GET api/users
// @desc    Get all users
// @access  Public (Should be protected in production)
router.get('/', userController.getAllUsers);
// @route   POST api/users/settings
// @desc    Update user settings (avatar, wallpaper)
router.post('/settings', userController.updateSettings);

// @route   POST api/users/contacts
// @desc    Add a contact
router.post('/contacts', userController.addContact);

module.exports = router;
