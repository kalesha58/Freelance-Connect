const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Report = require('../models/Report');
const Block = require('../models/Block');
const { protect } = require('../middleware/authMiddleware');
const { getBlockedUserIdsFor, toObjectId } = require('../utils/blocking');

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

// @desc    Check username availability
// @route   GET /api/users/username-available?username=...
// @access  Public
router.get('/username-available', async (req, res) => {
    try {
        const username = typeof req.query.username === 'string' ? req.query.username.trim() : '';
        if (!USERNAME_REGEX.test(username)) {
            return res.status(400).json({
                available: false,
                reason: 'Username must be 3-20 characters and only contain letters, numbers, and underscores.'
            });
        }

        const usernameLower = username.toLowerCase();
        const existing = await User.exists({ usernameLower });
        return res.json({ available: !existing });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get all freelancers (with filters)
// @route   GET /api/users/freelancers
// @access  Private (Hiring Partner focus)
router.get('/freelancers', protect, async (req, res) => {
    const { category, search } = req.query;
    let query = { role: 'freelancer' };

    if (category && category !== 'All') {
        query.skills = { $in: [category] };
    }

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    try {
        const blockedUserIds = await getBlockedUserIdsFor(req.user._id);
        if (blockedUserIds.length > 0) {
            query._id = { $nin: blockedUserIds.map((id) => toObjectId(id)).filter(Boolean) };
        }

        const freelancers = await User.find(query).select('-password');
        res.json(freelancers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all users except self (for NewChat contact list)
// @route   GET /api/users/all
// @access  Private
router.get('/all', protect, async (req, res) => {
    try {
        const blockedUserIds = await getBlockedUserIdsFor(req.user._id);
        const excludeIds = [req.user._id, ...blockedUserIds.map((id) => toObjectId(id)).filter(Boolean)];

        const users = await User.find({ _id: { $nin: excludeIds } })
            .select('name avatar profilePic role tagline skills _id');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create user-generated content report
// @route   POST /api/users/reports
// @access  Private
router.post('/reports', protect, async (req, res) => {
    try {
        const { targetId, targetType, reason, details } = req.body || {};
        if (!targetId || !targetType || !reason) {
            return res.status(400).json({ message: 'targetId, targetType and reason are required' });
        }

        const normalizedTargetType = String(targetType).toLowerCase();
        const targetTypeMap = {
            user: 'User',
            post: 'Post',
            job: 'Job',
        };
        const mappedType = targetTypeMap[normalizedTargetType];
        if (!mappedType) {
            return res.status(400).json({ message: 'Invalid targetType' });
        }

        const report = await Report.create({
            reporterId: req.user._id,
            targetId,
            targetType: mappedType,
            reason: details ? `${reason} | ${String(details).slice(0, 300)}` : reason,
        });

        res.status(201).json({ success: true, reportId: report._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Block user
// @route   POST /api/users/block/:userId
// @access  Private
router.post('/block/:userId', protect, async (req, res) => {
    try {
        const blockedUserId = req.params.userId;
        if (!toObjectId(blockedUserId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        if (String(blockedUserId) === String(req.user._id)) {
            return res.status(400).json({ message: 'You cannot block yourself' });
        }

        const target = await User.findById(blockedUserId).select('_id name');
        if (!target) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
        await Block.updateOne(
            { blockerId: req.user._id, blockedId: blockedUserId },
            { $setOnInsert: { blockerId: req.user._id, blockedId: blockedUserId, reason } },
            { upsert: true }
        );

        // Create moderation signal so admin can review abuse quickly.
        await Report.create({
            reporterId: req.user._id,
            targetId: blockedUserId,
            targetType: 'User',
            reason: reason ? `Blocked user: ${reason}` : 'Blocked user for abusive behavior',
        });

        res.json({ success: true, blockedUserId: String(blockedUserId) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Unblock user
// @route   DELETE /api/users/block/:userId
// @access  Private
router.delete('/block/:userId', protect, async (req, res) => {
    try {
        const blockedUserId = req.params.userId;
        await Block.deleteOne({ blockerId: req.user._id, blockedId: blockedUserId });
        res.json({ success: true, blockedUserId: String(blockedUserId) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    List users blocked by current user
// @route   GET /api/users/blocked
// @access  Private
router.get('/blocked', protect, async (req, res) => {
    try {
        const edges = await Block.find({ blockerId: req.user._id })
            .populate('blockedId', 'name avatar profilePic role tagline skills')
            .sort({ createdAt: -1 })
            .lean();

        const blockedUsers = edges
            .map((edge) => edge.blockedId)
            .filter(Boolean);

        res.json(blockedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Check if messaging is allowed between current user and target user
// @route   GET /api/users/block/check/:userId
// @access  Private
router.get('/block/check/:userId', protect, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const edge = await Block.findOne({
            $or: [
                { blockerId: req.user._id, blockedId: targetUserId },
                { blockerId: targetUserId, blockedId: req.user._id },
            ],
        })
            .select('blockerId')
            .lean();

        if (!edge) {
            return res.json({ canInteract: true, blocked: false });
        }
        const blockedByMe = String(edge.blockerId) === String(req.user._id);
        return res.status(403).json({
            canInteract: false,
            blocked: true,
            blockedByMe,
            message: blockedByMe
                ? 'You blocked this user.'
                : 'You cannot interact with this user.',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
