const mongoose = require('mongoose');
const Block = require('../models/Block');

function toObjectId(id) {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return new mongoose.Types.ObjectId(id);
}

async function getBlockedUserIdsFor(userId) {
    const oid = toObjectId(userId);
    if (!oid) return [];

    const edges = await Block.find({
        $or: [{ blockerId: oid }, { blockedId: oid }],
    })
        .select('blockerId blockedId')
        .lean();

    const ids = new Set();
    for (const edge of edges) {
        const blocker = String(edge.blockerId);
        const blocked = String(edge.blockedId);
        if (blocker === String(oid)) {
            ids.add(blocked);
        } else {
            ids.add(blocker);
        }
    }
    return [...ids];
}

async function hasBlockingRelationship(userAId, userBId) {
    const a = toObjectId(userAId);
    const b = toObjectId(userBId);
    if (!a || !b) return false;
    if (String(a) === String(b)) return false;

    const edge = await Block.findOne({
        $or: [
            { blockerId: a, blockedId: b },
            { blockerId: b, blockedId: a },
        ],
    })
        .select('_id')
        .lean();
    return !!edge;
}

module.exports = {
    getBlockedUserIdsFor,
    hasBlockingRelationship,
    toObjectId,
};
