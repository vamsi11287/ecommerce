const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Application settings management APIs
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings (owner only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all settings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Settings'
 *       403:
 *         description: Forbidden - owner only
 */
router.get('/', authMiddleware(['owner']), settingsController.getAllSettings);

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Get a single setting by key (owner only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *         example: customerOrderingEnabled
 *     responses:
 *       200:
 *         description: Setting details
 *       404:
 *         description: Setting not found
 *       403:
 *         description: Forbidden - owner only
 */
router.get('/:key', authMiddleware(['owner']), settingsController.getSetting);

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Update or create a setting (owner only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 example: customerOrderingEnabled
 *               value:
 *                 type: boolean
 *                 example: true
 *               description:
 *                 type: string
 *                 example: Enable/disable customer ordering
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - owner only
 */
router.post('/', authMiddleware(['owner']), settingsController.updateSetting);

/**
 * @swagger
 * /api/settings/customer-ordering/toggle:
 *   post:
 *     summary: Toggle customer ordering on/off (owner only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Customer ordering toggled successfully
 *       403:
 *         description: Forbidden - owner only
 */
router.post('/customer-ordering/toggle', authMiddleware(['owner']), settingsController.toggleCustomerOrdering);

/**
 * @swagger
 * /api/settings/customer-ordering/status:
 *   get:
 *     summary: Check if customer ordering is enabled
 *     tags: [Settings]
 *     security: []
 *     responses:
 *       200:
 *         description: Customer ordering status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 enabled:
 *                   type: boolean
 *                   example: true
 */
router.get('/customer-ordering/status', settingsController.isCustomerOrderingEnabled);

module.exports = router;
