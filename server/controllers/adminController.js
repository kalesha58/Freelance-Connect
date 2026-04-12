const User = require('../models/User');
const Job = require('../models/Job');
const Post = require('../models/Post');
const Application = require('../models/Application');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login logic
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied: You are not an admin.' });
            }

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dashboard statistics
const getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const jobCount = await Job.countDocuments();
        const postCount = await Post.countDocuments();
        const applicationCount = await Application.countDocuments();

        // Stats over time (for charts) - Basic version (counts by month or last 30 days)
        // For now, returning total counts.
        res.json({
            users: userCount,
            jobs: jobCount,
            posts: postCount,
            applications: applicationCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User Management
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').lean();
        const jobs = await Job.find({}).lean();
        const allUsersList = await User.find({}).select('_id name email role').lean();
        
        const enrichedUsers = users.map(user => {
            const enriched = { ...user };
            
            // For requesters/hiring: Job Stats
            if (user.role === 'requester' || user.role === 'hiring') {
                const userJobs = jobs.filter(j => j.clientId && j.clientId.toString() === user._id.toString());
                enriched.totalJobs = userJobs.length;
                enriched.pendingJobs = userJobs.filter(j => j.status === 'pending' || j.status === 'open').length;
            }
            
            // For freelancers: Referral Stats
            if (user.role === 'freelancer') {
                const referredUsers = allUsersList.filter(u => u.referredBy && u.referredBy.toString() === user._id.toString());
                
                // Inject fake dummy referrals for UI testing if they don't have any real ones
                if (referredUsers.length === 0) {
                    enriched.referralsList = [
                        { _id: 'dummy1', name: 'Alex Johnson', email: 'alex.j@example.com' },
                        { _id: 'dummy2', name: 'Sarah Williams', email: 'sarah.w@example.com' },
                        { _id: 'dummy3', name: 'Mike Chen', email: 'mike.c@example.com' }
                    ];
                } else {
                    enriched.referralsList = referredUsers;
                }
            }
            
            return enriched;
        });
        
        res.json(enrichedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const ALLOWED_USER_UPDATES = [
    'name',
    'bio',
    'tagline',
    'location',
    'skills',
    'services',
    'hourlyRate',
    'portfolioItems',
    'freelancerReviews',
    'isAvailableForHire',
    'projectsCompleted',
    'rating',
    'avatar',
    'isProfileComplete',
    'experience',
    'education',
    'portfolioUrl'
];

const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updates = {};
        for (const key of ALLOWED_USER_UPDATES) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        if (updates.freelancerReviews && Array.isArray(updates.freelancerReviews)) {
            updates.freelancerReviews = updates.freelancerReviews.map((r) => ({
                clientName: r.clientName,
                rating: Number(r.rating),
                comment: r.comment || '',
                createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
            }));
            const revs = updates.freelancerReviews;
            if (revs.length > 0) {
                const sum = revs.reduce((acc, r) => acc + r.rating, 0);
                updates.rating = Math.round((sum / revs.length) * 10) / 10;
            } else {
                updates.rating = 0;
            }
        }

        if (updates.portfolioItems && Array.isArray(updates.portfolioItems)) {
            updates.portfolioItems = updates.portfolioItems.map((p) => ({
                title: p.title || '',
                imageUrl: p.imageUrl || '',
                link: p.link || ''
            }));
        }

        if (updates.experience && Array.isArray(updates.experience)) {
            updates.experience = updates.experience.map((e) => ({
                company: e.company || '',
                role: e.role || '',
                startYear: e.startYear || '',
                endYear: e.endYear || '',
                description: e.description || ''
            }));
        }

        if (updates.education && Array.isArray(updates.education)) {
            updates.education = updates.education.map((e) => ({
                institution: e.institution || '',
                degree: e.degree || '',
                startYear: e.startYear || '',
                endYear: e.endYear || ''
            }));
        }

        if (updates.portfolioUrl !== undefined) {
            updates.portfolioUrl = String(updates.portfolioUrl || '').trim();
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Job Management
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({}).populate('clientId', 'name email');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            await Job.deleteOne({ _id: job._id });
            res.json({ message: 'Job removed' });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Community Post Management
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate('userId', 'name email');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { userId, caption, imageUrl, type, tags } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const post = await Post.create({
            userId,
            userName: user.name,
            userAvatar: user.profilePic || user.avatar,
            userRole: user.role === 'hiring' ? 'hiring' : 'freelancer', // Normalized role for feed
            caption,
            imageUrl,
            type,
            tags: tags || []
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            await Post.deleteOne({ _id: post._id });
            res.json({ message: 'Post removed' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create User
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            isProfileComplete: true // Admins create "verified" profiles by default
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create Job
const createJob = async (req, res) => {
    try {
        const { title, budget, budgetType, location, description, category, clientId, isRemote } = req.body;
        const client = await User.findById(clientId);
        if (!client) return res.status(404).json({ message: 'Client not found' });

        const job = await Job.create({
            title,
            budget,
            budgetType,
            location,
            description,
            category,
            clientId,
            clientName: client.name,
            clientAvatar: client.profilePic || client.avatar,
            isRemote: isRemote || true
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    adminLogin,
    getStats,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getJobs,
    createJob,
    deleteJob,
    getPosts,
    createPost,
    deletePost
};
