/**
 * Smoke test for the referral program. Boots an in-memory MongoDB,
 * exercises the full happy path, and prints a checklist. NOT a unit test
 * — it's a one-shot verifier for the work in this PR.
 *
 *   node server/scripts/smokeReferral.js
 */

process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'smoke-secret';

const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const User = require(path.join(__dirname, '..', 'models', 'User'));
const Referral = require(path.join(__dirname, '..', 'models', 'Referral'));
const Notification = require(path.join(__dirname, '..', 'models', 'Notification'));
const ReferralConfig = require(path.join(__dirname, '..', 'models', 'ReferralConfig'));
const referralService = require(path.join(__dirname, '..', 'utils', 'referralService'));

const log = (label, ok, extra = '') => {
    const symbol = ok ? '[OK]' : '[FAIL]';
    console.log(`${symbol} ${label}${extra ? ' — ' + extra : ''}`);
    if (!ok) process.exitCode = 1;
};

(async () => {
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri());

    try {
        // 0. Ensure config singleton exists with defaults.
        const config = await ReferralConfig.getSingleton();
        log('Config singleton created', !!config && config.enabled === true);

        // 1. Create a referrer (freelancer) with a generated code.
        const refCode = await referralService.generateReferralCode('Alice Wonder');
        const referrer = await User.create({
            name: 'Alice Wonder',
            email: 'alice@example.com',
            password: 'hash',
            role: 'freelancer',
            referralCode: refCode,
        });
        log('Referrer created with referralCode', /^alicewonder\d/.test(referrer.referralCode), referrer.referralCode);

        // 2. Create a referred user (freelancer) and link via signup.
        const newUser = await User.create({
            name: 'Bob Builder',
            email: 'bob@example.com',
            password: 'hash',
            role: 'freelancer',
            referralCode: await referralService.generateReferralCode('Bob Builder'),
        });
        const linkResult = await referralService.linkReferralOnSignup({
            newUser,
            referredByCode: referrer.referralCode,
            ip: '127.0.0.1',
            deviceIdHash: referralService.hashDeviceId('device-1'),
        });
        log('Referral linked on signup', linkResult.linked === true);

        const refRow = await Referral.findOne({ referredUserId: newUser._id });
        log('Referral row created with status=signed_up', refRow?.status === 'signed_up');

        const refresherReferrer = await User.findById(referrer._id).lean();
        log('Referrer.referralCount incremented', refresherReferrer.referralCount === 1);

        const joinedNotif = await Notification.findOne({ userId: referrer._id, type: 'referral_joined' });
        log('referral_joined notification inserted', !!joinedNotif);

        // 3. Self-referral attempt should fail.
        const selfRes = await referralService.linkReferralOnSignup({
            newUser: referrer,
            referredByCode: referrer.referralCode,
            ip: '127.0.0.1',
            deviceIdHash: referralService.hashDeviceId('device-2'),
        });
        log('Self-referral blocked', selfRes.linked === false && (selfRes.reason === 'self_referral' || selfRes.reason === 'already_linked'));

        // 4. Device cap should kick in beyond config.maxReferralsPerDevice.
        const devHash = referralService.hashDeviceId('device-cap');
        const cap = config.maxReferralsPerDevice || 5;
        let lastResult = { linked: true };
        for (let i = 0; i < cap + 1; i++) {
            const u = await User.create({
                name: `Cap ${i}`,
                email: `cap${i}@example.com`,
                password: 'hash',
                role: 'freelancer',
                referralCode: await referralService.generateReferralCode(`Cap ${i}`),
            });
            lastResult = await referralService.linkReferralOnSignup({
                newUser: u,
                referredByCode: referrer.referralCode,
                ip: '127.0.0.1',
                deviceIdHash: devHash,
            });
        }
        log('Device cap triggers refusal', lastResult.linked === false && lastResult.reason === 'device_cap');

        // 5. Profile completed milestone should NOT trigger reward (freelancer config triggers on firstJobApplied).
        await User.updateOne({ _id: newUser._id }, { $set: { isProfileComplete: true } });
        await referralService.trackReferralEvent({ userId: newUser._id, milestone: 'profileCompleted' });
        const refAfterProfile = await Referral.findOne({ referredUserId: newUser._id });
        log('After profile milestone status=milestone_completed', refAfterProfile.status === 'milestone_completed');
        log('Profile milestone does NOT pay reward yet', refAfterProfile.rewardGiven === false);

        // 6. firstJobApplied should pay the reward (default freelancer config).
        await referralService.trackReferralEvent({ userId: newUser._id, milestone: 'firstJobApplied' });
        const refAfterApply = await Referral.findOne({ referredUserId: newUser._id });
        log('After firstJobApplied status=rewarded', refAfterApply.status === 'rewarded');
        log('After firstJobApplied rewardGiven=true', refAfterApply.rewardGiven === true);

        const referrerAfterReward = await User.findById(referrer._id).lean();
        log('Referrer.rewardsEarned credited', referrerAfterReward.rewardsEarned === config.freelancerReward.amount);
        log('Referrer.perks.premiumChatUnlocks bumped', referrerAfterReward.perks.premiumChatUnlocks === 1);

        const rewardedNotif = await Notification.findOne({ userId: referrer._id, type: 'referral_rewarded' });
        log('referral_rewarded notification inserted', !!rewardedNotif);

        // 7. Idempotency — replaying the milestone must be a no-op.
        const replay = await referralService.trackReferralEvent({ userId: newUser._id, milestone: 'firstJobApplied' });
        log('Replaying milestone is idempotent (already_done)', replay.updated === false && replay.reason === 'already_done');
        const referrerAfterReplay = await User.findById(referrer._id).lean();
        log('Replay does not double-credit referrer', referrerAfterReplay.rewardsEarned === config.freelancerReward.amount);

        // 8. Admin reject path should set status=rejected and create a notification.
        const altUser = await User.create({
            name: 'Carol',
            email: 'carol@example.com',
            password: 'hash',
            role: 'freelancer',
            referralCode: await referralService.generateReferralCode('Carol'),
        });
        await referralService.linkReferralOnSignup({
            newUser: altUser,
            referredByCode: referrer.referralCode,
            ip: '127.0.0.1',
            deviceIdHash: referralService.hashDeviceId('carol-device'),
        });
        const altRow = await Referral.findOne({ referredUserId: altUser._id });
        await referralService.rejectReward(altRow._id, 'Suspicious signup');
        const altRowAfter = await Referral.findOne({ _id: altRow._id });
        log('Admin reject sets status=rejected', altRowAfter.status === 'rejected');
        const rejectedNotif = await Notification.findOne({ userId: referrer._id, type: 'referral_rejected' });
        log('referral_rejected notification inserted', !!rejectedNotif);

        console.log('\nSmoke test complete.');
    } finally {
        await mongoose.disconnect();
        await mem.stop();
    }
})().catch((err) => {
    console.error('Smoke test crashed:', err);
    process.exit(1);
});
