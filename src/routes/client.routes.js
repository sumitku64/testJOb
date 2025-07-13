const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  createCaseRequest,
  getCases,
  bookAppointment,
  getAppointments
} = require('../controllers/client.controller');

/**
 * @swagger
 * /clients/dashboard-stats:
 *   get:
 *     summary: Get client dashboard statistics
 *     tags: [Clients]
 */
router.get(
  '/dashboard-stats',
  protect,
  authorize('client'),
  getDashboardStats
);

/**
 * @swagger
 * /clients/case-requests:
 *   post:
 *     summary: Create a new case request
 *     tags: [Clients]
 */
router.post(
  '/case-requests',
  protect,
  authorize('client'),
  [
    body('advocateId').notEmpty().withMessage('Advocate ID is required'),
    body('description').notEmpty().withMessage('Case description is required'),
    body('type').notEmpty().withMessage('Case type is required')
  ],
  validateRequest,
  createCaseRequest
);

/**
 * @swagger
 * /clients/cases:
 *   get:
 *     summary: Get client's cases
 *     tags: [Clients]
 */
router.get(
  '/cases',
  protect,
  authorize('client'),
  getCases
);

/**
 * @swagger
 * /clients/book-appointment:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Clients]
 */
router.post(
  '/book-appointment',
  protect,
  authorize('client'),
  [
    body('advocateId').notEmpty().withMessage('Advocate ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('type').notEmpty().withMessage('Appointment type is required')
  ],
  validateRequest,
  bookAppointment
);

/**
 * @swagger
 * /clients/appointments:
 *   get:
 *     summary: Get client's appointments
 *     tags: [Clients]
 */
router.get(
  '/appointments',
  protect,
  authorize('client'),
  getAppointments
);

module.exports = router;
