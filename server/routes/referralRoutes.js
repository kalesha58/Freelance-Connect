const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Referral = require('../models/Referral');
const ReferralConfig = require('../models/ReferralConfig');
const { protect } = require('../middleware/authMiddleware');
const {
    generateReferralCode,
    linkReferralOnSignup,
    hashDeviceId
} = require('../utils/referralService');

// @desc    Summary of the current user's referral activity
// @route   GET /api/referrals/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('name referralCode referralCount rewardsEarned perks referredBy')
            .lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.referralCode) {
            const code = await generateReferralCode(user.name);
            await User.updateOne({ _id: req.user._id }, { $set: { referralCode: code } });
            user.referralCode = code;
        }

        const referrals = await Referral.find({ referrerId: req.user._id })
            .populate('referredUserId', 'name email avatar profilePic createdAt role')
            .sort({ createdAt: -1 })
            .lean();

        const history = referrals.map((r) => ({
            _id: r._id,
            user: r.referredUserId
                ? {
                      _id: r.referredUserId._id,
                      name: r.referredUserId.name,
                      avatar: r.referredUserId.avatar || r.referredUserId.profilePic || '',
                      role: r.referredUserId.role,
                      joinedAt: r.referredUserId.createdAt
                  }
                : null,
            status: r.status,
            milestones: r.milestones,
            rewardGiven: r.rewardGiven,
            rewardAmount: r.rewardAmount,
            rewardPerk: r.rewardPerk,
            createdAt: r.createdAt
        }));

        res.json({
            referralCode: user.referralCode,
            referralCount: user.referralCount || 0,
            rewardsEarned: user.rewardsEarned || 0,
            perks: user.perks || { premiumChatUnlocks: 0, freeJobBoosts: 0 },
            referredBy: user.referredBy || null,
            history
        });
    } catch (err) {
        console.error('GET /referrals/me error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// @desc    Apply a referral code to the current user (deferred attribution)
// @route   POST /api/referrals/apply
// @access  Private
router.post('/apply', protect, async (req, res) => {
    try {
        const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
        if (!code) return res.status(400).json({ message: 'Referral code is required' });

        if (req.user.referredBy) {
            return res.status(400).json({ message: 'A referral code is already applied to this account.' });
        }

        const config = await ReferralConfig.getSingleton();
        if (!config.enabled) {
            return res.status(400).json({ message: 'Referrals are currently disabled.' });
        }

        if (req.user.referralCode && req.user.referralCode === code) {
            return res.status(400).json({ message: 'You cannot use your own referral code.' });
        }

        const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || '';
        const deviceIdHash = hashDeviceId(req.headers['x-device-id']);

        const result = await linkReferralOnSignup({
            newUser: req.user,
            referredByCode: code,
            ip,
            deviceIdHash
        });

        if (!result.linked) {
            const reasonMap = {
                self_referral: 'You cannot use your own referral code.',
                code_not_found: 'Invalid referral code.',
                device_cap: 'Referral limit reached for this device.',
                already_linked: 'A referral code is already applied to this account.',
                disabled: 'Referrals are currently disabled.',
                no_code: 'Referral code is required',
                empty_code: 'Referral code is required'
            };
            return res.status(400).json({ message: reasonMap[result.reason] || 'Could not apply referral code.' });
        }

        return res.json({ message: 'Referral code applied successfully.' });
    } catch (err) {
        console.error('POST /referrals/apply error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// @desc    Backfill missing code for legacy users
// @route   POST /api/referrals/generate
// @access  Private
router.post('/generate', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.referralCode) return res.json({ referralCode: user.referralCode });

        const code = await generateReferralCode(user.name);
        user.referralCode = code;
        await user.save();
        res.json({ referralCode: code });
    } catch (err) {
        console.error('POST /referrals/generate error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
