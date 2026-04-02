const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get profile by ID
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or update profile
router.post('/', async (req, res) => {
    const { email, name, role, ...profileData } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            // Update existing user
            user = await User.findOneAndUpdate({ email }, { ...profileData, isProfileComplete: true }, { new: true });
        } else {
            // Create new user
            user = new User({ email, name, role, ...profileData, isProfileComplete: true });
            await user.save();
        }
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
