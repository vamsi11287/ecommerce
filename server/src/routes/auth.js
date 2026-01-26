const express = require('express');
const { register, login, getProfile, verifyToken, getAllStaff, updateStaff, deleteStaff } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../utils/validators');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Route for user registration (owner/staff/kitchen only)
router.post('/register', validateRegistration, register);

// Route for user login (owner/staff/kitchen only)
router.post('/login', validateLogin, login);

// Route to get current user profile
router.get('/profile', authMiddleware(), getProfile);

// Route to verify token
router.get('/verify', authMiddleware(), verifyToken);

// Staff management routes (owner only)
router.get('/staff', authMiddleware(['owner']), getAllStaff);
router.put('/staff/:id', authMiddleware(['owner']), updateStaff);
router.delete('/staff/:id', authMiddleware(['owner']), deleteStaff);

module.exports = router;