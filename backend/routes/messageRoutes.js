const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// @route   GET api/messages/:chatId
// @desc    Get message history for a specific chat
// @access  Public (Should be protected in production)
router.get('/:chatId', messageController.getMessages);

module.exports = router;
