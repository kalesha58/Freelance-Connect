const express = require('express');
const router = express.Router();
const {
    adminLogin,
    getStats,
    getUsers,
    deleteUser,
    getJobs,
    deleteJob,
    getPosts,
    deletePost
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminAuth');

// Public route: Admin login
router.post('/login', adminLogin);

// Protected routes (Admin only)
router.get('/stats', adminProtect, getStats);
router.get('/users', adminProtect, getUsers);
router.delete('/users/:id', adminProtect, deleteUser);

router.get('/jobs', adminProtect, getJobs);
router.delete('/jobs/:id', adminProtect, deleteJob);

router.get('/posts', adminProtect, getPosts);
router.delete('/posts/:id', adminProtect, deletePost);

module.exports = router;
