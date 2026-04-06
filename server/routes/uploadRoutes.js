const express = require('express');
const router = express.Router();
const { cloudinary, upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

// @desc    Upload an image to Cloudinary
// @route   POST /api/upload
// @access  Private
// Uses memory storage + upload API so uploads work on Vercel serverless (streaming storage is unreliable).
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!cloudinaryConfigured()) {
      console.error('Upload rejected: CLOUDINARY_* env vars are missing');
      return res.status(503).json({
        message:
          'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the server.',
      });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'freelance_connect',
      transformation: 'c_limit,w_1000,h_1000',
      resource_type: 'image',
    });

    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: error.message || 'Upload failed',
    });
  }
});

module.exports = router;
