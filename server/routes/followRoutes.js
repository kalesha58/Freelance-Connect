const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const FREELANCER = 'freelancer';

function mapPopulatedUser(u) {
    if (!u) return null;
    const o = typeof u.toObject === 'function' ? u.toObject() : u;
    return {
        _id: o._id,
        name: o.name,
        tagline: o.tagline || '',
        avatar: o.avatar,
        profilePic: o.profilePic,
        role: o.role,
    };
}

// GET /api/follow/status/:userId — is current user following this freelancer?
router.get('/status/:userId', protect, async (req, res) => {
    try {
        const targetId = req.params.userId;
        if (targetId === String(req.user._id)) {
            return res.json({ isFollowing: false });
        }
        const exists = await Follow.findOne({
            followerId: req.user._id,
            followingId: targetId,
        }).lean();
        res.json({ isFollowing: !!exists });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/follow/:userId — follow a freelancer (freelancer → freelancer only)
router.post('/:userId', protect, async (req, res) => {
    try {
        const targetId = req.params.userId;
        if (targetId === String(req.user._id)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        if (req.user.role !== FREELANCER) {
            return res.status(403).json({ message: 'Only freelancers can use follow' });
        }

        const target = await User.findById(targetId).select('role');
        if (!target) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (target.role !== FREELANCER) {
            return res.status(400).json({ message: 'You can only follow other freelancers' });
        }

        try {
            await Follow.create({
                followerId: req.user._id,
                followingId: targetId,
            });
            await User.updateOne({ _id: req.user._id }, { $inc: { following: 1 } });
            await User.updateOne({ _id: targetId }, { $inc: { followers: 1 } });
        } catch (err) {
            if (err.code === 11000) {
                return res.json({ success: true, isFollowing: true });
            }
            throw err;
        }

        res.json({ success: true, isFollowing: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/follow/:userId — unfollow
router.delete('/:userId', protect, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const removed = await Follow.findOneAndDelete({
            followerId: req.user._id,
            followingId: targetId,
        });

        if (removed) {
            await User.updateOne({ _id: req.user._id, following: { $gt: 0 } }, { $inc: { following: -1 } });
            await User.updateOne({ _id: targetId, followers: { $gt: 0 } }, { $inc: { followers: -1 } });
        }

        res.json({ success: true, isFollowing: false });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/follow/me/following — freelancers I follow
router.get('/me/following', protect, async (req, res) => {
    try {
        const edges = await Follow.find({ followerId: req.user._id })
            .populate('followingId', 'name tagline avatar profilePic role')
            .sort({ createdAt: -1 })
            .lean();

        const users = edges
            .map((e) => e.followingId)
            .filter(Boolean)
            .map((u) => mapPopulatedUser(u));
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/follow/me/followers — freelancers who follow me
router.get('/me/followers', protect, async (req, res) => {
    try {
        const edges = await Follow.find({ followingId: req.user._id })
            .populate('followerId', 'name tagline avatar profilePic role')
            .sort({ createdAt: -1 })
            .lean();

        const users = edges
            .map((e) => e.followerId)
            .filter(Boolean)
            .map((u) => mapPopulatedUser(u));
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
