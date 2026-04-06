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

    // Do not pass `transformation` here — it is included in the signed payload and
    // often triggers Cloudinary "Invalid Signature" with the Node SDK on serverless.
    // Resize at delivery time (URL transforms) or use a Dashboard upload preset if needed.
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'freelance_connect',
      resource_type: 'image',
    });

    const deliveryUrl = cloudinary.url(result.public_id, {
      secure: true,
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    });

    res.status(200).json({
      url: deliveryUrl,
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
