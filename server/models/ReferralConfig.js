const mongoose = require('mongoose');

const MILESTONE_KEYS = ['profileCompleted', 'firstJobPosted', 'firstJobApplied', 'firstHire'];

const rewardSchema = new mongoose.Schema(
    {
        amount: { type: Number, default: 50 },
        perk: { type: String, default: '' },
        milestone: { type: String, enum: MILESTONE_KEYS, default: 'profileCompleted' }
    },
    { _id: false }
);

const referralConfigSchema = new mongoose.Schema(
    {
        singleton: { type: String, default: 'global', unique: true },
        enabled: { type: Boolean, default: true },
        selfReferralBlocked: { type: Boolean, default: true },
        maxReferralsPerDevice: { type: Number, default: 5 },
        freelancerReward: {
            type: rewardSchema,
            default: () => ({ amount: 50, perk: 'premiumChatUnlocks', milestone: 'firstJobApplied' })
        },
        hiringReward: {
            type: rewardSchema,
            default: () => ({ amount: 100, perk: 'freeJobBoosts', milestone: 'firstJobPosted' })
        },
        requesterReward: {
            type: rewardSchema,
            default: () => ({ amount: 25, perk: '', milestone: 'profileCompleted' })
        }
    },
    { timestamps: true }
);

referralConfigSchema.statics.getSingleton = async function () {
    let doc = await this.findOne({ singleton: 'global' });
    if (!doc) {
        doc = await this.create({ singleton: 'global' });
    }
    return doc;
};

module.exports = mongoose.model('ReferralConfig', referralConfigSchema);
module.exports.MILESTONE_KEYS = MILESTONE_KEYS;
