const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Complete user profile
// @route   POST /api/auth/complete-profile
// @access  Private
router.post('/complete-profile', protect, async (req, res) => {
    console.log('Complete Profile POST Hit. User:', req.user._id);
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { isProfileComplete: true },
            { new: true }
        ).select('-password');

        if (user) {
            console.log('User updated successfully');
            res.json({
                _id: user._id,
                isProfileComplete: user.isProfileComplete
            });
        } else {
            console.log('User not found in complete-profile');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Complete Profile Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                isProfileComplete: user.isProfileComplete
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;

    try {
        // Find user by email or phone
        const user = await User.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
                isProfileComplete: user.isProfileComplete
            });
        } else {
            res.status(401).json({ message: 'Invalid email/phone or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isProfileComplete: user.isProfileComplete
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = router;
