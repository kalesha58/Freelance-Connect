const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// GET /api/posts  — All posts (Public)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/posts/user/:userId  — Posts by user (Public)
// ─────────────────────────────────────────────
router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/posts  — Create post (Protected)
// ─────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    const post = new Post({
        userId: req.user._id,
        userName: req.user.name,
        userAvatar: req.user.profilePic || req.user.avatar,
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

// ─────────────────────────────────────────────
// POST /api/posts/:id/like  — Toggle like (Protected)
// ─────────────────────────────────────────────
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user._id;
        const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ likes: post.likes, likesCount: post.likes.length, likedByMe: !alreadyLiked });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/posts/:id/comments  — Get comments (Public)
// ─────────────────────────────────────────────
router.get('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).select('comments userId');
        if (!post) return res.status(404).json({ message: 'Post not found' });

        res.json({ comments: post.comments, postOwnerId: post.userId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/posts/:id/comments  — Add comment (Protected)
// ─────────────────────────────────────────────
router.post('/:id/comments', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ message: 'Comment text required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = {
            userId: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.profilePic || req.user.avatar,
            text: text.trim(),
            likes: [],
            replies: []
        };

        post.comments.push(newComment);
        await post.save();

        const savedComment = post.comments[post.comments.length - 1];
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/posts/:id/comments/:commentId/reply  — Reply to comment (Protected)
// ─────────────────────────────────────────────
router.post('/:id/comments/:commentId/reply', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ message: 'Reply text required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const newReply = {
            userId: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.profilePic || req.user.avatar,
            text: text.trim()
        };

        comment.replies.push(newReply);
        await post.save();

        const savedReply = comment.replies[comment.replies.length - 1];
        res.status(201).json(savedReply);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
