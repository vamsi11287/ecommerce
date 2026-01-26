const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - only for owner, staff, and kitchen
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers['authorization']?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Access denied. No token provided.' 
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.id).select('-password');

            if (!user || !user.isActive) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token or inactive user.' 
                });
            }

            // Check if user has required role (skip if roles array is empty)
            if (roles.length > 0 && !roles.includes(user.role)) {
                console.log('❌ Authorization failed:');
                console.log('   User role:', user.role);
                console.log('   Required roles:', roles);
                console.log('   User ID:', user._id);
                return res.status(403).json({ 
                    success: false,
                    message: 'Access forbidden. Insufficient permissions.' 
                });
            }

            console.log('✅ Authorization success:');
            console.log('   User:', user.username);
            console.log('   Role:', user.role);
            console.log('   Required roles:', roles.length > 0 ? roles : 'Any authenticated user');

            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token.' 
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token expired.' 
                });
            }
            return res.status(500).json({ 
                success: false,
                message: 'Authentication error.',
                error: error.message 
            });
        }
    };
};

// Optional auth - allows both authenticated and unauthenticated requests
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.id).select('-password');
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Continue without user - token invalid or expired
        next();
    }
};

// Simple auth middleware - just checks if user is authenticated, no role check
const simpleAuth = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token or inactive user.' 
            });
        }

        console.log('✅ Simple auth success:', user.username, 'Role:', user.role);
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired.' 
            });
        }
        return res.status(500).json({ 
            success: false,
            message: 'Authentication error.',
            error: error.message 
        });
    }
};

module.exports = { authMiddleware, optionalAuth, simpleAuth };