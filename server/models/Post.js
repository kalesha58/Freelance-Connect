const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    userRole: { type: String, enum: ['freelancer', 'hiring'], required: true },
    type: { type: String, enum: ['portfolio', 'social'], default: 'social' },
    imageUrl: { type: String },
    caption: { type: String },
    tags: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    comments: [{
        userName: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
