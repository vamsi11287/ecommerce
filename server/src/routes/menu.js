const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const menuController = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/menu-images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Route to get all menu items (public - no auth required)
router.get('/', menuController.getMenuItems);

// Route to get menu categories (public)
router.get('/categories', menuController.getCategories);

// Route to upload menu item image (owner/staff/kitchen) - MUST be before /:id
router.post('/upload-image', authMiddleware(['owner', 'staff', 'kitchen']), upload.single('image'), menuController.uploadImage);

// Route to create a new menu item (owner/staff/kitchen)
router.post('/', authMiddleware(['owner', 'staff', 'kitchen']), menuController.createMenuItem);

// Route to get a single menu item (public)
router.get('/:id', menuController.getMenuItemById);

// Route to update a menu item by ID (owner/staff/kitchen)
router.put('/:id', authMiddleware(['owner', 'staff', 'kitchen']), menuController.updateMenuItem);
router.patch('/:id', authMiddleware(['owner', 'staff', 'kitchen']), menuController.updateMenuItem);

// Route to delete a menu item by ID (owner/staff/kitchen)
router.delete('/:id', authMiddleware(['owner', 'staff', 'kitchen']), menuController.deleteMenuItem);

module.exports = router;