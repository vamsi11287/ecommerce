const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, optionalAuth, simpleAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, STARTED, COMPLETED, READY]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware(['owner', 'staff', 'kitchen']), orderController.getOrders);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: number
 *                 pendingOrders:
 *                   type: number
 *                 completedOrders:
 *                   type: number
 *                 todayRevenue:
 *                   type: number
 *       403:
 *         description: Forbidden
 */
router.get('/stats', authMiddleware(['owner', 'staff']), orderController.getOrderStats);

/**
 * @swagger
 * /api/orders/history:
 *   get:
 *     summary: Get order history by date (owner only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Order history
 *       403:
 *         description: Forbidden - owner only
 */
router.get('/history', authMiddleware(['owner']), orderController.getOrderHistory);

/**
 * @swagger
 * /api/orders/ready:
 *   get:
 *     summary: Get ready orders for public display
 *     tags: [Orders]
 *     security: []
 *     responses:
 *       200:
 *         description: List of ready orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/ready', orderController.getReadyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/:id', authMiddleware(['owner', 'staff', 'kitchen']), orderController.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: John Doe
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     name:
 *                       type: string
 *                       example: Margherita Pizza
 *                     price:
 *                       type: number
 *                       example: 12.99
 *                     quantity:
 *                       type: number
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', optionalAuth, orderController.createOrder);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, STARTED, COMPLETED, READY]
 *                 example: STARTED
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 */
router.patch('/:id/status', simpleAuth, orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/taken:
 *   post:
 *     summary: Mark order as taken and move to reports (owner/staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order marked as taken and moved to reports
 *       403:
 *         description: Forbidden - owner/staff only
 *       404:
 *         description: Order not found
 */
router.post('/:id/taken', authMiddleware(['owner', 'staff']), orderController.markOrderAsTaken);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order permanently
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/:id', authMiddleware(['owner', 'staff']), orderController.deleteOrder);

module.exports = router;