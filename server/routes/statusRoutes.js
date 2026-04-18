const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Status = require('../models/Status');
const { protect } = require('../middleware/authMiddleware');

// ─── Helper: 24-h boundary ────────────────────────────────────────────────────
const activeStatusFilter = () => ({ expiresAt: { $gt: new Date() } });

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statuses
// Returns all active (non-expired) statuses, newest first.
// Used by the story bar to show statuses from all users.
// Protected: requires login so we can compute viewedByMe per status.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
    try {
        const myId = String(req.user._id);

        const statuses = await Status.find(activeStatusFilter())
            .sort({ createdAt: -1 })
            .lean();

        // Annotate each status with viewedByMe and viewersCount
        const enriched = statuses.map(s => ({
            ...s,
            // viewedByMe: true if the current user is in the viewers list
            viewedByMe: s.viewers.some(v => String(v.userId) === myId),
            viewersCount: s.viewers.length,
        }));

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statuses/mine
// Returns only the current user's own active statuses (for "Your Story" bubble).
// Also includes the full viewers array (not shown on other users' statuses).
// ─────────────────────────────────────────────────────────────────────────────
router.get('/mine', protect, async (req, res) => {
    try {
        const statuses = await Status.find({
            userId: req.user._id,
            ...activeStatusFilter(),
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json(statuses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/statuses
// Create a new status (image URL must already be uploaded via /api/upload).
// Users can post multiple statuses per 24-hour window.
// Body: { imageUrl: string }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl || typeof imageUrl !== 'string') {
            return res.status(400).json({ message: 'imageUrl is required' });
        }

        const status = new Status({
            userId:     req.user._id,
            userName:   req.user.name,
            userAvatar: req.user.profilePic || req.user.avatar,
            imageUrl,
            // expiresAt defaults to now + 24h (see model)
        });

        const saved = await status.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/statuses/:id/view
// Record the current user as a viewer of the given status.
// Idempotent: viewing the same status twice does NOT add a duplicate row.
// The status owner viewing their own status is a no-op (returns 200 silently).
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/view', protect, async (req, res) => {
    try {
        const status = await Status.findOne({
            _id: req.params.id,
            ...activeStatusFilter(),
        });

        if (!status) {
            return res.status(404).json({ message: 'Status not found or has expired' });
        }

        const myId = String(req.user._id);
        const ownerId = String(status.userId);

        // Owner cannot be a viewer of their own status
        if (myId === ownerId) {
            return res.json({ viewersCount: status.viewers.length, alreadyViewed: true });
        }

        // Idempotent: only add if not already in the list
        const alreadyViewed = status.viewers.some(v => String(v.userId) === myId);
        if (!alreadyViewed) {
            status.viewers.push({
                userId:     req.user._id,
                userName:   req.user.name,
                userAvatar: req.user.profilePic || req.user.avatar,
                viewedAt:   new Date(),
            });
            await status.save();
        }

        res.json({ viewersCount: status.viewers.length, alreadyViewed });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statuses/:id/viewers
// Returns the full viewers list for a status.
// Only accessible by the status owner.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/viewers', protect, async (req, res) => {
    try {
        const status = await Status.findById(req.params.id).lean();
        if (!status) return res.status(404).json({ message: 'Status not found' });

        if (String(status.userId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Only the status owner can view this list' });
        }

        // Return viewers sorted newest-first
        const viewers = [...status.viewers].sort(
            (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        );

        res.json({ viewers, viewersCount: viewers.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/statuses/:id
// Owner can manually delete their own status before it naturally expires.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);
        if (!status) return res.status(404).json({ message: 'Status not found' });

        if (String(status.userId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this status' });
        }

        await Status.findByIdAndDelete(req.params.id);
        res.json({ message: 'Status deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
