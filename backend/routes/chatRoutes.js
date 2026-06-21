const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/group', chatController.createGroup);
router.get('/:userId', chatController.getUserChats);

module.exports = router;
