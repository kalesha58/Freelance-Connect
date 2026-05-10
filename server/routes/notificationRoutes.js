const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @desc    List notifications for the current user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
        const items = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
        res.json({ items, unreadCount });
    } catch (err) {
        console.error('GET /notifications error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// @desc    Mark a single notification read
// @route   POST /api/notifications/:id/read
// @access  Private
router.post('/:id/read', protect, async (req, res) => {
    try {
        const result = await Notification.updateOne(
            { _id: req.params.id, userId: req.user._id },
            { $set: { read: true } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ ok: true });
    } catch (err) {
        console.error('POST /notifications/:id/read error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// @desc    Mark all notifications read
// @route   POST /api/notifications/read-all
// @access  Private
router.post('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
        res.json({ ok: true });
    } catch (err) {
        console.error('POST /notifications/read-all error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
