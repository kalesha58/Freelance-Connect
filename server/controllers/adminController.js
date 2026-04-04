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
        const users = await User.find({}).select('-password');
        res.json(users);
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

// Job Management
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({}).populate('postedBy', 'name email');
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
        const posts = await Post.find({}).populate('user', 'name email');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

module.exports = {
    adminLogin,
    getStats,
    getUsers,
    deleteUser,
    getJobs,
    deleteJob,
    getPosts,
    deletePost
};
