const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
    'referral_joined',
    'referral_milestone',
    'referral_rewarded',
    'referral_rejected',
    'system'
];

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: NOTIFICATION_TYPES, default: 'system' },
        title: { type: String, required: true },
        body: { type: String, default: '' },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
        read: { type: Boolean, default: false }
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
