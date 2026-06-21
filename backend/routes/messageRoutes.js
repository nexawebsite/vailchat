const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// @route   GET api/messages/:userId/:otherUserId
// @desc    Get message history between two users
// @access  Public (Should be protected in production)
router.get('/:userId/:otherUserId', messageController.getMessages);

module.exports = router;
