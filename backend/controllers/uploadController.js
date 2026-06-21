const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'vailnet/images';
    let resource_type = 'image';

    if (file.mimetype.startsWith('video/')) {
      folder = 'vailnet/videos';
      resource_type = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'vailnet/audio';
      resource_type = 'video'; // Cloudinary uses 'video' resource_type for audio files too
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'mp3', 'wav', 'webm', 'ogg'],
    };
  },
});

const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('media'); // 'media' is the field name from frontend

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Hakuna faili lililotumwa' });
    }

    // req.file.path contains the secure Cloudinary URL
    res.status(200).json({
      message: 'Faili limefanikiwa kupakiwa',
      url: req.file.path,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server Error wakati wa ku-upload' });
  }
};
