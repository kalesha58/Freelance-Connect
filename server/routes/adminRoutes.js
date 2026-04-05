const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminAuth');

// Public route: Admin login
router.post('/login', adminLogin);

// Protected routes (Admin only)
router.get('/stats', adminProtect, getStats);

router.get('/users', adminProtect, getUsers);
router.post('/users', adminProtect, createUser);
router.put('/users/:id', adminProtect, updateUser);
router.delete('/users/:id', adminProtect, deleteUser);

router.get('/jobs', adminProtect, getJobs);
router.post('/jobs', adminProtect, createJob);
router.delete('/jobs/:id', adminProtect, deleteJob);

router.get('/posts', adminProtect, getPosts);
router.post('/posts', adminProtect, createPost);
router.delete('/posts/:id', adminProtect, deletePost);

module.exports = router;
