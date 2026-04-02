const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get profile of the current authenticated user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get profile by ID (Public or Protected depending on privacy settings - keeping basic for now)
router.get('/:userId', async (req, res) => {
    try {
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
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { ...req.body, isProfileComplete: true },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;
