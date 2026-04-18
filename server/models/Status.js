const mongoose = require('mongoose');

// ─── Sub-schema: individual status viewer ────────────────────────────────────
const statusViewerSchema = new mongoose.Schema(
    {
        userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName:   { type: String, required: true },
        userAvatar: { type: String },
        viewedAt:   { type: Date, default: Date.now },
    },
    { _id: false }   // no extra id field per viewer
);

// ─── Main Status schema ───────────────────────────────────────────────────────
const statusSchema = new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName:   { type: String, required: true },
    userAvatar: { type: String },
    imageUrl:   { type: String, required: true },   // Cloudinary / upload URL
    /** Statuses expire automatically 24 hours after creation via a TTL index on expiresAt */
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    viewers: [statusViewerSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {

    timestamps: true,   // adds createdAt + updatedAt
});

// ─── TTL index: MongoDB automatically deletes documents when expiresAt is reached
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─── Compound index for fast per-user queries ─────────────────────────────────
statusSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Status', statusSchema);
