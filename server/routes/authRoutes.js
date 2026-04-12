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
    const { name, email, password, role, referredByCode } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let referredById = null;
        if (referredByCode) {
            const referrer = await User.findOne({ referralCode: referredByCode });
            if (referrer) {
                referredById = referrer._id;
            }
        }

        const referralCode = name.replace(/\s+/g, '').toLowerCase() + Math.floor(1000 + Math.random() * 9000);

        const user = await User.create({
            name,
            email,
            password,
            role,
            referralCode,
            referredBy: referredById
        });

        if (user) {
            const userObj = user.toObject();
            delete userObj.password;
            res.status(201).json({
                ...userObj,
                token: generateToken(user._id)
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
            const userObj = user.toObject();
            delete userObj.password;
            res.json({
                ...userObj,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email/phone or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { emailOrPhone } = req.body;
    // For now, simulate sending OTP
    res.json({ message: 'If an account exists, a reset code has been sent.' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
    const { emailOrPhone, otp, password } = req.body;
    // For now, simulate successful reset
    res.json({ message: 'Password has been reset successfully.' });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    // For now, accept '123456' as valid
    if (otp === '123456') {
        res.json({ message: 'OTP verified successfully.' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            res.json(user);
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
