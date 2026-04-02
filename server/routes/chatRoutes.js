const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all user conversations
// @route   GET /api/chat/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        })
        .populate('participants', 'name email avatar role')
        .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
router.get('/conversations/:id/messages', protect, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id })
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a message (Create conversation if it doesn't exist)
// @route   POST /api/chat/messages
// @access  Private
router.post('/messages', protect, async (req, res) => {
    const { receiverId, text } = req.body;

    try {
        // 1. Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, receiverId],
                lastMessage: text,
                lastMessageTime: Date.now()
            });
        } else {
            conversation.lastMessage = text;
            conversation.lastMessageTime = Date.now();
            conversation.updatedAt = Date.now();
            await conversation.save();
        }

        // 2. Create message
        const message = await Message.create({
            conversationId: conversation._id,
            senderId: req.user._id,
            text
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
