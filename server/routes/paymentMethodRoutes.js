const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/PaymentMethod');
const { protect } = require('../middleware/authMiddleware');

const detectBrand = (last4 = '') => {
    if (!last4 || !/^\d{4}$/.test(last4)) return 'other';
    return 'other';
};

const sanitizeForResponse = (doc) => {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    delete obj.providerToken;
    return obj;
};

// GET /api/payment-methods — list this user's payment methods, default first
router.get('/', protect, async (req, res) => {
    try {
        const methods = await PaymentMethod.find({ userId: req.user._id })
            .sort({ isDefault: -1, createdAt: -1 })
            .lean();
        res.json(methods.map((m) => {
            delete m.providerToken;
            return m;
        }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/payment-methods — add a new card / upi / bank
router.post('/', protect, async (req, res) => {
    try {
        const { type, brand, last4, holderName, expiryMonth, expiryYear, upiId, bankName, accountLast4, makeDefault } = req.body || {};

        const safeType = ['card', 'upi', 'bank'].includes(type) ? type : 'card';
        const payload = { userId: req.user._id, type: safeType };

        if (safeType === 'card') {
            if (!last4 || !/^\d{4}$/.test(String(last4))) {
                return res.status(400).json({ message: 'Card last 4 digits are required.' });
            }
            payload.brand = brand && ['visa', 'mastercard', 'amex', 'discover', 'rupay', 'other'].includes(brand)
                ? brand
                : detectBrand(last4);
            payload.last4 = String(last4);
            payload.holderName = typeof holderName === 'string' ? holderName.trim().slice(0, 80) : '';
            const m = Number(expiryMonth);
            const y = Number(expiryYear);
            if (!Number.isFinite(m) || m < 1 || m > 12) {
                return res.status(400).json({ message: 'Expiry month must be between 1 and 12.' });
            }
            if (!Number.isFinite(y) || y < new Date().getFullYear() || y > new Date().getFullYear() + 30) {
                return res.status(400).json({ message: 'Expiry year is invalid.' });
            }
            payload.expiryMonth = m;
            payload.expiryYear = y;
        } else if (safeType === 'upi') {
            if (!upiId || typeof upiId !== 'string') {
                return res.status(400).json({ message: 'UPI ID is required.' });
            }
            payload.upiId = upiId.trim().toLowerCase();
        } else if (safeType === 'bank') {
            if (!bankName || !accountLast4 || !/^\d{4}$/.test(String(accountLast4))) {
                return res.status(400).json({ message: 'Bank name and last 4 of account number are required.' });
            }
            payload.bankName = String(bankName).trim().slice(0, 60);
            payload.accountLast4 = String(accountLast4);
        }

        const existingCount = await PaymentMethod.countDocuments({ userId: req.user._id });
        const shouldBeDefault = makeDefault === true || existingCount === 0;
        if (shouldBeDefault) {
            await PaymentMethod.updateMany({ userId: req.user._id, isDefault: true }, { $set: { isDefault: false } });
            payload.isDefault = true;
        }

        const created = await PaymentMethod.create(payload);
        res.status(201).json(sanitizeForResponse(created));
    } catch (err) {
        if (err?.name === 'ValidationError') {
            const first = Object.values(err.errors || {})[0];
            return res.status(400).json({ message: first?.message || err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/payment-methods/:id/default — set this method as default
router.put('/:id/default', protect, async (req, res) => {
    try {
        const method = await PaymentMethod.findOne({ _id: req.params.id, userId: req.user._id });
        if (!method) return res.status(404).json({ message: 'Payment method not found.' });

        await PaymentMethod.updateMany(
            { userId: req.user._id, _id: { $ne: method._id } },
            { $set: { isDefault: false } }
        );
        method.isDefault = true;
        await method.save();
        res.json(sanitizeForResponse(method));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/payment-methods/:id — remove a payment method
router.delete('/:id', protect, async (req, res) => {
    try {
        const method = await PaymentMethod.findOne({ _id: req.params.id, userId: req.user._id });
        if (!method) return res.status(404).json({ message: 'Payment method not found.' });
        const wasDefault = method.isDefault;
        await method.deleteOne();

        if (wasDefault) {
            const next = await PaymentMethod.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
            if (next) {
                next.isDefault = true;
                await next.save();
            }
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
