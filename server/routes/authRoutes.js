const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendPasswordResetOtpEmail } = require('../utils/mailer');
const {
    generateReferralCode,
    linkReferralOnSignup,
    hashDeviceId
} = require('../utils/referralService');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// @desc    Complete user profile
// @route   POST /api/auth/complete-profile
// @access  Private
router.post('/complete-profile', protect, async (req, res) => {
    console.log('Complete Profile POST Hit. User:', req.user._id);
    try {
        const wasComplete = !!req.user.isProfileComplete;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { isProfileComplete: true },
            { new: true }
        ).select('-password');

        if (user) {
            console.log('User updated successfully');
            if (!wasComplete) {
                const { trackReferralEvent } = require('../utils/referralService');
                trackReferralEvent({ userId: user._id, milestone: 'profileCompleted' }).catch(() => {});
            }
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

        const referralCode = await generateReferralCode(name);
        const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || '';
        const deviceIdHash = hashDeviceId(req.headers['x-device-id']);

        const user = await User.create({
            name,
            email,
            password,
            role,
            referralCode,
            signupIp: ip,
            signupDeviceIdHash: deviceIdHash
        });

        if (user) {
            await linkReferralOnSignup({
                newUser: user,
                referredByCode,
                ip,
                deviceIdHash
            });

            const fresh = await User.findById(user._id).select('-password').lean();
            res.status(201).json({
                ...fresh,
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
    const emailOrPhone = typeof req.body?.emailOrPhone === 'string' ? req.body.emailOrPhone.trim().toLowerCase() : '';
    const genericResponse = { message: 'If an account exists, a reset code has been sent.' };

    if (!EMAIL_REGEX.test(emailOrPhone)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    try {
        const user = await User.findOne({ email: emailOrPhone });
        if (!user) {
            return res.json(genericResponse);
        }

        const otp = generateOtp();
        user.passwordResetOtpHash = hashOtp(otp);
        user.passwordResetOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
        user.passwordResetOtpAttempts = 0;
        await user.save();

        await sendPasswordResetOtpEmail({ to: user.email, otp });
        return res.json(genericResponse);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
    const emailOrPhone = typeof req.body?.emailOrPhone === 'string' ? req.body.emailOrPhone.trim().toLowerCase() : '';
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!EMAIL_REGEX.test(emailOrPhone)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: 'OTP must be a 6-digit code.' });
    }
    if (!PASSWORD_POLICY_REGEX.test(password)) {
        return res.status(400).json({ message: 'Password must be 6+ chars with uppercase, number, and special character.' });
    }

    try {
        const user = await User.findOne({ email: emailOrPhone });
        if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
            return res.status(400).json({ message: 'Invalid or expired reset request.' });
        }

        if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
            user.passwordResetOtpHash = undefined;
            user.passwordResetOtpExpiresAt = undefined;
            user.passwordResetOtpAttempts = 0;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
        }

        if ((user.passwordResetOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
            user.passwordResetOtpHash = undefined;
            user.passwordResetOtpExpiresAt = undefined;
            user.passwordResetOtpAttempts = 0;
            await user.save();
            return res.status(400).json({ message: 'Too many failed attempts. Please request a new code.' });
        }

        if (hashOtp(otp) !== user.passwordResetOtpHash) {
            user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
            await user.save();
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.password = password;
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpiresAt = undefined;
        user.passwordResetOtpAttempts = 0;
        await user.save();

        return res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: 'OTP must be a 6-digit code.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP request.' });
        }

        if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
        }

        if ((user.passwordResetOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
            return res.status(400).json({ message: 'Too many failed attempts. Please request a new code.' });
        }

        if (hashOtp(otp) !== user.passwordResetOtpHash) {
            user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
            await user.save();
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.passwordResetOtpAttempts = 0;
        await user.save();
        return res.json({ message: 'OTP verified successfully.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').lean();

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
