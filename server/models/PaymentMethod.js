const mongoose = require('mongoose');

const SUPPORTED_TYPES = ['card', 'upi', 'bank'];
const SUPPORTED_BRANDS = ['visa', 'mastercard', 'amex', 'discover', 'rupay', 'other'];

const paymentMethodSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: SUPPORTED_TYPES, default: 'card' },

        // --- Card-only fields (no PAN ever stored) ---
        brand: { type: String, enum: SUPPORTED_BRANDS, default: 'other' },
        last4: {
            type: String,
            validate: {
                validator: (v) => !v || /^\d{4}$/.test(v),
                message: 'last4 must be exactly 4 digits.'
            }
        },
        holderName: { type: String, default: '', trim: true, maxlength: 80 },
        expiryMonth: { type: Number, min: 1, max: 12 },
        expiryYear: { type: Number, min: 2000, max: 2100 },

        // --- UPI-only fields ---
        upiId: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: (v) => !v || /^[a-z0-9._-]{2,64}@[a-z][a-z0-9]{1,32}$/i.test(v),
                message: 'Enter a valid UPI ID (e.g. name@bank).'
            }
        },

        // --- Bank-only fields ---
        bankName: { type: String, default: '', trim: true, maxlength: 60 },
        accountLast4: {
            type: String,
            validate: {
                validator: (v) => !v || /^\d{4}$/.test(v),
                message: 'accountLast4 must be exactly 4 digits.'
            }
        },

        isDefault: { type: Boolean, default: false },
        // Reserved for future Stripe/Razorpay integration. Not used yet.
        provider: { type: String, default: 'manual' },
        providerToken: { type: String, default: '' }
    },
    { timestamps: true }
);

paymentMethodSchema.index({ userId: 1, isDefault: -1, createdAt: -1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
module.exports.SUPPORTED_TYPES = SUPPORTED_TYPES;
module.exports.SUPPORTED_BRANDS = SUPPORTED_BRANDS;
