const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, optionalAuth, simpleAuth } = require('../middleware/auth');

// Get all orders (staff/kitchen only)
router.get('/', authMiddleware(['owner', 'staff', 'kitchen']), orderController.getOrders);

// Get order statistics (owner/staff only)
router.get('/stats', authMiddleware(['owner', 'staff']), orderController.getOrderStats);

// Get order history by date (owner only)
router.get('/history', authMiddleware(['owner']), orderController.getOrderHistory);

// Get ready orders for display (public - no auth)
router.get('/ready', orderController.getReadyOrders);

// Get a specific order by ID
router.get('/:id', authMiddleware(['owner', 'staff', 'kitchen']), orderController.getOrderById);

// Create a new order (staff or customers - optionalAuth)
router.post('/', optionalAuth, orderController.createOrder);

// Update an order status (any authenticated user - no role check)
router.patch('/:id/status', simpleAuth, orderController.updateOrderStatus);

// Delete an order (any authenticated user - no role check)
router.delete('/:id', simpleAuth, orderController.deleteOrder);

module.exports = router;