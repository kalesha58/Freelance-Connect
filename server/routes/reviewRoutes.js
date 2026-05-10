const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const summarize = (reviews) => {
    const items = Array.isArray(reviews) ? reviews : [];
    const counts = [0, 0, 0, 0, 0]; // index 0 -> 1 star ... index 4 -> 5 stars
    let total = 0;
    items.forEach((r) => {
        const v = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
        counts[v - 1] += 1;
        total += v;
    });
    const count = items.length;
    const average = count > 0 ? Number((total / count).toFixed(2)) : 0;
    return {
        average,
        count,
        breakdown: {
            5: counts[4],
            4: counts[3],
            3: counts[2],
            2: counts[1],
            1: counts[0]
        }
    };
};

// GET /api/reviews/me — current user's incoming reviews + summary
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('freelancerReviews rating').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        const reviews = (user.freelancerReviews || [])
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ summary: summarize(reviews), reviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/reviews/:userId — public reviews for a user
router.get('/:userId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const user = await User.findById(req.params.userId).select('freelancerReviews rating').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });
        const reviews = (user.freelancerReviews || [])
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ summary: summarize(reviews), reviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/reviews/:userId — leave a review for a freelancer
router.post('/:userId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        if (String(req.user._id) === String(req.params.userId)) {
            return res.status(400).json({ message: 'You cannot review yourself.' });
        }
        const rating = Number(req.body?.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
        }
        const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim().slice(0, 1000) : '';

        const target = await User.findById(req.params.userId);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.role !== 'freelancer') {
            return res.status(400).json({ message: 'Reviews can only be left for freelancers.' });
        }

        target.freelancerReviews = target.freelancerReviews || [];
        target.freelancerReviews.push({
            clientName: req.user.name || 'Anonymous Client',
            rating: Math.round(rating),
            comment,
            createdAt: new Date()
        });

        const summary = summarize(target.freelancerReviews);
        target.rating = summary.average;
        await target.save();

        res.status(201).json({ summary, review: target.freelancerReviews[target.freelancerReviews.length - 1] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
