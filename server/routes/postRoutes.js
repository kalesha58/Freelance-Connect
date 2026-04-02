const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');

// Get all posts (Public)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get posts by user ID (Public)
router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new post (Protected)
router.post('/', protect, async (req, res) => {
    const post = new Post({
        userId: req.user._id,
        userName: req.user.name,
        userAvatar: req.user.avatar,
        userRole: req.user.role,
        type: req.body.type || 'social',
        imageUrl: req.body.imageUrl,
        caption: req.body.caption,
        tags: req.body.tags || []
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;
