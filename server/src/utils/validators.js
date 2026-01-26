const { body, validationResult } = require('express-validator');

// Validation for user registration
const validateRegistration = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
        .trim()
        .toLowerCase(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['owner', 'staff', 'kitchen']).withMessage('Invalid role'),
    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

// Validation for user login
const validateLogin = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .trim()
        .toLowerCase(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

// Validation for order creation
const validateOrder = [
    body('customerName')
        .notEmpty().withMessage('Customer name is required')
        .trim(),
    body('items')
        .isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.menuItemId')
        .notEmpty().withMessage('Menu item ID is required')
        .isMongoId().withMessage('Invalid menu item ID'),
    body('items.*.quantity')
        .isInt({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('orderType')
        .optional()
        .isIn(['STAFF', 'CUSTOMER']).withMessage('Invalid order type'),
    body('notes')
        .optional()
        .trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

// Validation for menu item creation/update
const validateMenuItem = [
    body('name')
        .notEmpty().withMessage('Menu item name is required')
        .trim(),
    body('price')
        .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('description')
        .optional()
        .trim(),
    body('category')
        .optional()
        .trim(),
    body('imageUrl')
        .optional()
        .isURL().withMessage('Invalid image URL'),
    body('isAvailable')
        .optional()
        .isBoolean().withMessage('isAvailable must be a boolean'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

// Validation for order status update
const validateOrderStatus = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['PENDING', 'STARTED', 'COMPLETED', 'READY']).withMessage('Invalid status'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateOrder,
    validateMenuItem,
    validateOrderStatus
};