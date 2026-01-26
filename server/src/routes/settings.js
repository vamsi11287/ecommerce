const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/auth');

// Get all settings (owner only)
router.get('/', authMiddleware(['owner']), settingsController.getAllSettings);

// Get a single setting by key (owner only)
router.get('/:key', authMiddleware(['owner']), settingsController.getSetting);

// Update or create a setting (owner only)
router.post('/', authMiddleware(['owner']), settingsController.updateSetting);

// Toggle customer ordering (owner only)
router.post('/customer-ordering/toggle', authMiddleware(['owner']), settingsController.toggleCustomerOrdering);

// Check if customer ordering is enabled (public)
router.get('/customer-ordering/status', settingsController.isCustomerOrderingEnabled);

module.exports = router;
