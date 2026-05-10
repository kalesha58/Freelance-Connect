const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
    {
        done: { type: Boolean, default: false },
        at: { type: Date }
    },
    { _id: false }
);

const referralSchema = new mongoose.Schema(
    {
        referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        referredUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        referralCode: { type: String, required: true },
        status: {
            type: String,
            enum: ['signed_up', 'milestone_completed', 'rewarded', 'rejected'],
            default: 'signed_up',
            index: true
        },
        milestones: {
            profileCompleted: { type: milestoneSchema, default: () => ({}) },
            firstJobPosted: { type: milestoneSchema, default: () => ({}) },
            firstJobApplied: { type: milestoneSchema, default: () => ({}) },
            firstHire: { type: milestoneSchema, default: () => ({}) }
        },
        rewardGiven: { type: Boolean, default: false },
        rewardType: { type: String, enum: ['credits', 'perk', null], default: null },
        rewardAmount: { type: Number, default: 0 },
        rewardPerk: { type: String, default: '' },
        signupIp: { type: String, default: '' },
        signupDeviceIdHash: { type: String, default: '', index: true },
        notes: { type: String, default: '' }
    },
    { timestamps: true }
);

referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ signupDeviceIdHash: 1, createdAt: -1 });

module.exports = mongoose.model('Referral', referralSchema);
