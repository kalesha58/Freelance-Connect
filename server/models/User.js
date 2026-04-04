const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['freelancer', 'hiring', 'requester', 'admin'], required: true },
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

// Hash password before saving
userSchema.pre('save', async function () {
    console.log('User pre-save hook triggered. Modified password:', this.isModified('password'));
    if (!this.isModified('password')) {
        return;
    }
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
