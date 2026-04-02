const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
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

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
router.post('/:id/apply', protect, async (req, res) => {
    const { coverLetter } = req.body;

    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const alreadyApplied = await Application.findOne({
            jobId: req.params.id,
            applicantId: req.user._id
        });

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied for this job' });
        }

        const application = await Application.create({
            jobId: req.params.id,
            applicantId: req.user._id,
            applicantName: req.user.name,
            applicantAvatar: req.user.avatar,
            coverLetter
        });

        // Update job applicant count
        job.applicants = (job.applicants || 0) + 1;
        await job.save();

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get applicants for a job
// @route   GET /api/jobs/:id/applicants
// @access  Private (Owner only)
router.get('/:id/applicants', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.clientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view applicants' });
        }

        const applicants = await Application.find({ jobId: req.params.id })
            .sort({ createdAt: -1 });

        res.json(applicants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update application status (Hire/Reject)
// @route   PUT /api/jobs/applications/:id
// @access  Private (Owner only)
router.put('/applications/:id', protect, async (req, res) => {
    const { status } = req.body;

    try {
        const application = await Application.findById(req.params.id).populate('jobId');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (application.jobId.clientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        application.status = status;
        await application.save();

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
