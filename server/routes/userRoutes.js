const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

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
        const freelancers = await User.find(query).select('-password');
        res.json(freelancers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
