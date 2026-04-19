const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminAuth');

// Public route: Admin login
router.post('/login', adminLogin);

// Protected routes (Admin only)
router.get('/stats', adminProtect, getStats);

router.get('/users', adminProtect, getUsers);
router.get('/users/:id', adminProtect, getUserById);
router.post('/users', adminProtect, createUser);
router.put('/users/:id', adminProtect, updateUser);
router.delete('/users/:id', adminProtect, deleteUser);
router.put('/users/:id/verify', adminProtect, toggleUserVerification);

router.get('/jobs', adminProtect, getJobs);
router.get('/jobs/:id', adminProtect, getJobById);
router.post('/jobs', adminProtect, createJob);
router.delete('/jobs/:id', adminProtect, deleteJob);

router.get('/posts', adminProtect, getPosts);
router.get('/posts/:id', adminProtect, getPostById);
router.post('/posts', adminProtect, createPost);
router.delete('/posts/:id', adminProtect, deletePost);

router.get('/reports', adminProtect, getReports);
router.put('/reports/:id', adminProtect, resolveReport);

module.exports = router;
