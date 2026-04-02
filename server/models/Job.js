const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    budget: { type: String, required: true },
    budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    location: { type: String, required: true },
    deadline: { type: Date },
    description: { type: String, required: true },
    skills: [String],
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    clientAvatar: { type: String },
    clientRating: { type: Number, default: 0 },
    category: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
    applicants: { type: Number, default: 0 },
    isRemote: { type: Boolean, default: true }
});

module.exports = mongoose.model('Job', jobSchema);
