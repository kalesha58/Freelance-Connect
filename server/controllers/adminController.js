const User = require('../models/User');
const Job = require('../models/Job');
const Post = require('../models/Post');
const Application = require('../models/Application');
const Report = require('../models/Report');
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
// Dashboard statistics
const getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const jobCount = await Job.countDocuments();
        const postCount = await Post.countDocuments();
        const applicationCount = await Application.countDocuments();

        // 1. User Growth (Last 12 Months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const growthData = await User.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Map to expected format { label: 'Jan', value: 10 }
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedGrowth = monthNames.map((name, i) => {
            const data = growthData.find(d => d._id.month === (i + 1));
            return { label: name, value: data ? data.count : 0 };
        });

        // 2. Weekly Jobs (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklyJobsData = await Job.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const formattedWeekly = days.map((name, i) => {
            const data = weeklyJobsData.find(d => d._id === (i + 1));
            return { label: name, value: data ? data.count : 0 };
        });

        // 3. Activity Feed (Recent Users, Jobs, Posts)
        const recentUsers = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(3).lean();
        const recentJobs = await Job.find({}).sort({ createdAt: -1 }).limit(3).lean();
        const recentPosts = await Post.find({}).sort({ createdAt: -1 }).limit(3).lean();

        const activityFeed = [
            ...recentUsers.map(u => ({ action: 'User Registered', user: u.name, status: 'Success', time: u.createdAt, description: u.email })),
            ...recentJobs.map(j => ({ action: 'New Job Posted', user: j.clientName || 'Client', status: 'Success', time: j.createdAt, description: j.title })),
            ...recentPosts.map(p => ({ action: 'New Post', user: p.userName || 'User', status: 'Info', time: p.createdAt, description: p.caption.substring(0, 30) + '...' }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

        res.json({
            users: userCount,
            jobs: jobCount,
            posts: postCount,
            applications: applicationCount,
            growthData: formattedGrowth,
            weeklyJobs: formattedWeekly,
            activityFeed
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
        const allUsersList = await User.find({}).select('_id name email role referredBy').lean();
        
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
                enriched.referralsList = referredUsers;
            }
            
            return enriched;
        });
        
        res.json(enrichedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add additional stats/data
        const jobs = await Job.find({ clientId: user._id }).lean();
        user.totalJobs = jobs.length;
        user.pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'open').length;

        // Populate referrals if freelancer
        if (user.role === 'freelancer') {
            const referredUsers = await User.find({ referredBy: user._id }).select('_id name email').lean();
            user.referralsList = referredUsers;
        }

        res.json(user);
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

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('clientId', 'name email profilePic avatar');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
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

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('userId', 'name email profilePic avatar');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
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

// Moderation & Trust
const toggleUserVerification = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isVerified = !user.isVerified;
        await user.save();
        
        res.json({ message: `User verification ${user.isVerified ? 'enabled' : 'disabled'}`, isVerified: user.isVerified });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate('reporterId', 'name email')
            .sort({ createdAt: -1 })
            .lean();
            
        // For each report, we need to fetch the target details (User/Job/Post)
        // Since targetId is generic, we can loop through and fetch manually or use dynamic ref
        // For simplicity here, we'll map through
        const enrichedReports = await Promise.all(reports.map(async (report) => {
            let target = null;
            if (report.targetType === 'User') target = await User.findById(report.targetId).select('name email avatar').lean();
            else if (report.targetType === 'Job') target = await Job.findById(report.targetId).select('title budget clientName').lean();
            else if (report.targetType === 'Post') target = await Post.findById(report.targetId).select('caption userName imageUrl').lean();
            
            return { ...report, target };
        }));

        res.json(enrichedReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resolveReport = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id, 
            { status, adminNotes }, 
            { new: true }
        );
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    adminLogin,
    getStats,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getJobs,
    getJobById,
    createJob,
    deleteJob,
    getPosts,
    getPostById,
    createPost,
    deletePost,
    toggleUserVerification,
    getReports,
    resolveReport
};
