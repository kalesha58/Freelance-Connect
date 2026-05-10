const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');
const ReferralConfig = require('../models/ReferralConfig');

const MAX_GENERATE_ATTEMPTS = 6;

/**
 * Hash a raw device id sent from the client. Stored hash never reveals the raw id.
 */
const hashDeviceId = (raw) => {
    if (!raw || typeof raw !== 'string') return '';
    return crypto.createHash('sha256').update(raw).digest('hex');
};

/**
 * Pick a base slug from the user name, falling back to "user" if empty.
 */
const slugifyName = (name) => {
    const s = (name || '').toString().replace(/\s+/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return s || 'user';
};

/**
 * Generate a referral code that does not collide with existing users. Retries on collision.
 */
const generateReferralCode = async (name) => {
    const base = slugifyName(name).slice(0, 14);
    for (let i = 0; i < MAX_GENERATE_ATTEMPTS; i++) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const candidate = `${base}${suffix}`;
        const existing = await User.findOne({ referralCode: candidate }).select('_id').lean();
        if (!existing) return candidate;
    }
    return `${base}${Date.now().toString().slice(-6)}`;
};

/**
 * Resolve which reward configuration applies to a given user role.
 */
const rewardForRole = (config, role) => {
    if (role === 'freelancer') return config.freelancerReward;
    if (role === 'hiring') return config.hiringReward;
    if (role === 'requester') return config.requesterReward;
    return null;
};

/**
 * Insert a notification (best-effort; logs and swallows errors so caller never fails).
 */
const pushNotification = async ({ userId, type, title, body, data }) => {
    try {
        await Notification.create({ userId, type, title, body: body || '', data: data || {} });
    } catch (err) {
        console.error('Notification create failed:', err.message);
    }
};

/**
 * Called from signup. Validates referral, creates the Referral row,
 * stamps referrer.referralCount, and notifies referrer. Never throws to
 * the caller — signup must succeed even if referral linking fails.
 */
const linkReferralOnSignup = async ({ newUser, referredByCode, ip, deviceIdHash }) => {
    if (!referredByCode) return { linked: false, reason: 'no_code' };

    try {
        const config = await ReferralConfig.getSingleton();
        if (!config.enabled) return { linked: false, reason: 'disabled' };

        const trimmedCode = String(referredByCode).trim();
        if (!trimmedCode) return { linked: false, reason: 'empty_code' };

        if (config.selfReferralBlocked && newUser.referralCode && trimmedCode === newUser.referralCode) {
            return { linked: false, reason: 'self_referral' };
        }

        const referrer = await User.findOne({ referralCode: trimmedCode });
        if (!referrer) return { linked: false, reason: 'code_not_found' };
        if (referrer._id.equals(newUser._id)) return { linked: false, reason: 'self_referral' };

        if (deviceIdHash && config.maxReferralsPerDevice > 0) {
            const usedCount = await Referral.countDocuments({ signupDeviceIdHash: deviceIdHash });
            if (usedCount >= config.maxReferralsPerDevice) {
                return { linked: false, reason: 'device_cap' };
            }
        }

        const existing = await Referral.findOne({ referredUserId: newUser._id });
        if (existing) return { linked: false, reason: 'already_linked' };

        await Referral.create({
            referrerId: referrer._id,
            referredUserId: newUser._id,
            referralCode: trimmedCode,
            status: 'signed_up',
            signupIp: ip || '',
            signupDeviceIdHash: deviceIdHash || ''
        });

        await User.updateOne({ _id: newUser._id }, { $set: { referredBy: referrer._id } });
        await User.updateOne({ _id: referrer._id }, { $inc: { referralCount: 1 } });

        await pushNotification({
            userId: referrer._id,
            type: 'referral_joined',
            title: 'Your referral just joined!',
            body: `${newUser.name} signed up using your code.`,
            data: { referredUserId: String(newUser._id) }
        });

        return { linked: true, referrerId: referrer._id };
    } catch (err) {
        console.error('linkReferralOnSignup error:', err.message);
        return { linked: false, reason: 'error' };
    }
};

/**
 * Mark a milestone for the referred user. If the milestone matches the configured
 * reward trigger for the referred user's role and reward hasn't been given,
 * credits the referrer and inserts a notification. Idempotent.
 */
const trackReferralEvent = async ({ userId, milestone }) => {
    if (!userId || !milestone) return { updated: false, reason: 'missing_args' };

    try {
        const referral = await Referral.findOne({ referredUserId: userId });
        if (!referral) return { updated: false, reason: 'not_referred' };
        if (referral.status === 'rejected') return { updated: false, reason: 'rejected' };

        const milestoneEntry = referral.milestones?.[milestone];
        if (milestoneEntry?.done) return { updated: false, reason: 'already_done' };

        referral.milestones[milestone] = { done: true, at: new Date() };
        if (referral.status === 'signed_up') {
            referral.status = 'milestone_completed';
        }

        const referredUser = await User.findById(userId).select('name role').lean();
        const config = await ReferralConfig.getSingleton();
        const reward = referredUser ? rewardForRole(config, referredUser.role) : null;
        const shouldReward =
            !referral.rewardGiven &&
            reward &&
            reward.milestone === milestone &&
            config.enabled;

        if (shouldReward) {
            referral.rewardGiven = true;
            referral.status = 'rewarded';
            referral.rewardType = reward.perk ? 'perk' : 'credits';
            referral.rewardAmount = reward.amount || 0;
            referral.rewardPerk = reward.perk || '';

            const inc = { rewardsEarned: reward.amount || 0 };
            if (reward.perk === 'premiumChatUnlocks') inc['perks.premiumChatUnlocks'] = 1;
            if (reward.perk === 'freeJobBoosts') inc['perks.freeJobBoosts'] = 1;

            await User.updateOne({ _id: referral.referrerId }, { $inc: inc });

            await pushNotification({
                userId: referral.referrerId,
                type: 'referral_rewarded',
                title: 'Reward credited',
                body: `You earned ${reward.amount} credits because ${referredUser?.name || 'a referral'} hit a milestone.`,
                data: { referralId: String(referral._id), amount: reward.amount, perk: reward.perk }
            });
        } else {
            await pushNotification({
                userId: referral.referrerId,
                type: 'referral_milestone',
                title: 'Referral progress',
                body: `${referredUser?.name || 'A referral'} just hit "${milestone}".`,
                data: { referralId: String(referral._id), milestone }
            });
        }

        await referral.save();
        return { updated: true, rewarded: shouldReward };
    } catch (err) {
        console.error('trackReferralEvent error:', err.message);
        return { updated: false, reason: 'error' };
    }
};

/**
 * Admin-triggered manual approve: forces the rewarded state and credits the referrer.
 */
const approveReward = async (referralId) => {
    const referral = await Referral.findById(referralId);
    if (!referral) throw new Error('Referral not found');
    if (referral.rewardGiven) return referral;

    const referredUser = await User.findById(referral.referredUserId).select('role name').lean();
    const config = await ReferralConfig.getSingleton();
    const reward = referredUser ? rewardForRole(config, referredUser.role) : null;
    const amount = reward?.amount || 0;
    const perk = reward?.perk || '';

    referral.rewardGiven = true;
    referral.status = 'rewarded';
    referral.rewardType = perk ? 'perk' : 'credits';
    referral.rewardAmount = amount;
    referral.rewardPerk = perk;
    await referral.save();

    const inc = { rewardsEarned: amount };
    if (perk === 'premiumChatUnlocks') inc['perks.premiumChatUnlocks'] = 1;
    if (perk === 'freeJobBoosts') inc['perks.freeJobBoosts'] = 1;
    await User.updateOne({ _id: referral.referrerId }, { $inc: inc });

    await pushNotification({
        userId: referral.referrerId,
        type: 'referral_rewarded',
        title: 'Reward approved',
        body: `An admin approved your referral reward (${amount} credits).`,
        data: { referralId: String(referral._id), amount, perk, manual: true }
    });

    return referral;
};

/**
 * Admin-triggered reject: marks the referral rejected and notifies referrer.
 */
const rejectReward = async (referralId, reason) => {
    const referral = await Referral.findById(referralId);
    if (!referral) throw new Error('Referral not found');
    referral.status = 'rejected';
    if (reason) referral.notes = reason;
    await referral.save();
    await pushNotification({
        userId: referral.referrerId,
        type: 'referral_rejected',
        title: 'Referral rejected',
        body: reason || 'A referral has been rejected by admin.',
        data: { referralId: String(referral._id) }
    });
    return referral;
};

module.exports = {
    hashDeviceId,
    generateReferralCode,
    linkReferralOnSignup,
    trackReferralEvent,
    approveReward,
    rejectReward,
    pushNotification
};
