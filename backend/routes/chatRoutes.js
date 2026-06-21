const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.accessChat);
router.post('/group', chatController.createGroup);
router.get('/:userId', chatController.getUserChats);
router.put('/group/rename', chatController.renameGroup);
router.put('/group/remove', chatController.removeFromGroup);
router.put('/group/add', chatController.addToGroup);

module.exports = router;
