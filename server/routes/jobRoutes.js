const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ postedAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Hiring role)
router.post('/', protect, async (req, res) => {
    const { title, budget, budgetType, location, deadline, description, skills, category, isRemote } = req.body;

    try {
        const job = await Job.create({
            title,
            budget,
            budgetType,
            location,
            deadline,
            description,
            skills,
            category,
            isRemote,
            clientId: req.user._id,
            clientName: req.user.name,
            clientAvatar: req.user.avatar,
            clientRating: req.user.rating || 0
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            res.json(job);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (job) {
            if (job.clientId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized to update this job' });
            }

            const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedJob);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (job) {
            if (job.clientId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized to delete this job' });
            }

            await Job.findByIdAndDelete(req.params.id);
            res.json({ message: 'Job removed' });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
