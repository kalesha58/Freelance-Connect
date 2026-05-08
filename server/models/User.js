const mongoose = require('mongoose');

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['freelancer', 'hiring', 'requester', 'admin'], required: true },
    avatar: { type: String },
    profilePic: { type: String },
    bio: { type: String, default: "" },
    tagline: { type: String, default: "" },
    location: { type: String, default: "" },
    username: {
        type: String,
        trim: true,
        validate: {
            validator: (value) => !value || USERNAME_REGEX.test(value),
            message: 'Username must be 3-20 characters and only contain letters, numbers, and underscores.'
        }
    },
    usernameLower: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    companyName: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    industry: { type: String, default: "" },
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
    /** Hourly rate in INR for freelancer marketplace display */
    hourlyRate: { type: Number, default: 0 },
    /** External portfolio URL (Behance, Dribbble, personal site) — opened in-app from public profile */
    portfolioUrl: { type: String, default: '' },
    /** Shown on freelancer profile as headline (e.g. “Senior UI/UX Designer”) */
    portfolioItems: [{
        title: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        link: { type: String, default: '' }
    }],
    /** Reviews left by hiring partners / clients — shown on public freelancer profile */
    freelancerReviews: [{
        clientName: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
    }],
    isAvailableForHire: { type: Boolean, default: true },
    projectsCompleted: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isVerified: { type: Boolean, default: false },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    console.log('User pre-save hook triggered. Modified password:', this.isModified('password'));
    if (this.isModified('username')) {
        this.username = this.username ? String(this.username).trim() : this.username;
        this.usernameLower = this.username ? this.username.toLowerCase() : undefined;
    }
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
