const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['freelancer', 'hiring', 'requester'], required: true },
    avatar: { type: String },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    services: { type: [String], default: [] },
    education: [{
        institution: String,
        degree: String,
        startYear: String,
        endYear: String
    }],
    experience: [{
        company: String,
        role: String,
        startYear: String,
        endYear: String,
        description: String
    }],
    rating: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
