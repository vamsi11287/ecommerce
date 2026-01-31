const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Taken orders report management APIs
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all taken order reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 100
 *         description: Maximum number of reports
 *     responses:
 *       200:
 *         description: List of reports
 *       403:
 *         description: Forbidden - owner/staff only
 */
router.get('/', authMiddleware(['owner', 'staff']), reportController.getAllReports);

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get reports summary grouped by date
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Summary of reports by date
 *       403:
 *         description: Forbidden - owner/staff only
 */
router.get('/summary', authMiddleware(['owner', 'staff']), reportController.getReportsSummary);

/**
 * @swagger
 * /api/reports/date/{date}:
 *   get:
 *     summary: Get reports for a specific date
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: 2026-01-31
 *     responses:
 *       200:
 *         description: Reports for the specified date with statistics
 *       400:
 *         description: Invalid date
 *       403:
 *         description: Forbidden - owner/staff only
 */
router.get('/date/:date', authMiddleware(['owner', 'staff']), reportController.getReportsByDate);

module.exports = router;
