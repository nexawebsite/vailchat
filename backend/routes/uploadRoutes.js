const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// @route   POST api/upload
// @desc    Upload media file to Cloudinary
// @access  Public (In a real app, this should be protected)
router.post('/', uploadController.uploadMiddleware, uploadController.uploadFile);

module.exports = router;
