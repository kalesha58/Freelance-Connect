const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { hasBlockingRelationship } = require('../utils/blocking');

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

// Get profile of the current authenticated user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Fetch referrals
        const referrals = await User.find({ referredBy: req.user._id }).select('name email createdAt').lean();
        user.referralsList = referrals;
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get profile by ID (Public or Protected depending on privacy settings - keeping basic for now)
router.get('/:userId', optionalAuth, async (req, res) => {
    try {
        if (req.user?._id) {
            const blocked = await hasBlockingRelationship(req.user._id, req.params.userId);
            if (blocked) {
                return res.status(404).json({ message: 'User not found' });
            }
        }
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update current user's profile
router.put('/', protect, async (req, res) => {
    try {
        const updatePayload = { ...req.body, isProfileComplete: true };

        if (Object.prototype.hasOwnProperty.call(req.body, 'username')) {
            const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
            if (!USERNAME_REGEX.test(username)) {
                return res.status(400).json({
                    message: 'Username must be 3-20 characters and only contain letters, numbers, and underscores.'
                });
            }
            updatePayload.username = username;
            updatePayload.usernameLower = username.toLowerCase();
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updatePayload,
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        if (err?.code === 11000 && err?.keyPattern?.usernameLower) {
            return res.status(409).json({ message: 'Username is already taken.' });
        }
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;
