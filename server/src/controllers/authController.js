const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register new user (only for owner, staff, kitchen - not for customers)
exports.register = async (req, res) => {
    try {
        const { username, password, role, email } = req.body;

        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({ 
                success: false,
                message: 'Username, password, and role are required' 
            });
        }

        // Customers don't need accounts
        if (role === 'customer') {
            return res.status(400).json({ 
                success: false,
                message: 'Customers do not need accounts. They can order directly.' 
            });
        }

        // Only allow owner, staff, and kitchen roles
        if (!['owner', 'staff', 'kitchen'].includes(role)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid role. Allowed roles: owner, staff, kitchen' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: 'Username already exists' 
            });
        }

        // Create new user
        const newUser = new User({ 
            username, 
            password, 
            role,
            email 
        });
        
        await newUser.save();

        res.status(201).json({ 
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error registering user', 
            error: error.message 
        });
    }
};

// Login (only for owner, staff, kitchen)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Username and password are required' 
            });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ 
                success: false,
                message: 'Account is inactive. Contact administrator.' 
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role,
                username: user.username 
            }, 
            process.env.JWT_SECRET || 'your-secret-key', 
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error logging in', 
            error: error.message 
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching profile', 
            error: error.message 
        });
    }
};

// Verify token
exports.verifyToken = async (req, res) => {
    try {
        res.status(200).json({ 
            success: true,
            message: 'Token is valid',
            data: {
                user: req.user
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error verifying token', 
            error: error.message 
        });
    }
};

// Get all staff members (owner only)
exports.getAllStaff = async (req, res) => {
    try {
        const staff = await User.find({
            role: { $in: ['owner', 'staff', 'kitchen'] }
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching staff',
            error: error.message
        });
    }
};

// Update staff member (owner only)
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, fullName, role, email, phone } = req.body;

        // Find the staff member
        const staff = await User.findById(id);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Prevent editing owner accounts
        if (staff.role === 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Cannot edit owner accounts'
            });
        }

        // Check if username is being changed and if it already exists
        if (username && username !== staff.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
            staff.username = username;
        }

        // Update fields
        if (fullName) staff.fullName = fullName;
        if (role && ['staff', 'kitchen'].includes(role)) staff.role = role;
        if (email) staff.email = email;
        if (phone) staff.phone = phone;

        // Update password if provided
        if (password) {
            staff.password = password;
        }

        await staff.save();

        res.status(200).json({
            success: true,
            message: 'Staff member updated successfully',
            data: {
                id: staff._id,
                username: staff.username,
                fullName: staff.fullName,
                role: staff.role,
                email: staff.email,
                phone: staff.phone
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating staff member',
            error: error.message
        });
    }
};

// Delete staff member (owner only)
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the staff member
        const staff = await User.findById(id);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Prevent deleting owner accounts
        if (staff.role === 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete owner accounts'
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting staff member',
            error: error.message
        });
    }
};