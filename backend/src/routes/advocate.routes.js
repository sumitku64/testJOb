const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAdvocates,
  getAdvocate,
  getDashboardStats,
  getCaseRequests,
  handleCaseRequest,
  getAppointments,
  getVerificationStatus,
  updateAdvocateProfile
} = require('../controllers/advocate.controller');

/**
 * @swagger
 * /advocates:
 *   get:
 *     summary: Get all advocates
 *     tags: [Advocates]
 */
router.get('/', getAdvocates);

/**
 * @swagger
 * /advocates/{id}:
 *   get:
 *     summary: Get single advocate
 *     tags: [Advocates]
 */
router.get('/:id', getAdvocate);

/**
 * @swagger
 * /advocates/dashboard-stats:
 *   get:
 *     summary: Get advocate dashboard statistics
 *     tags: [Advocates]
 */
router.get(
  '/dashboard-stats',
  protect,
  authorize('advocate'),
  getDashboardStats
);

/**
 * @swagger
 * /advocates/case-requests:
 *   get:
 *     summary: Get advocate's case requests
 *     tags: [Advocates]
 */
router.get(
  '/case-requests',
  protect,
  authorize('advocate'),
  getCaseRequests
);

/**
 * @swagger
 * /advocates/case-requests/{id}/accept:
 *   put:
 *     summary: Accept a case request
 *     tags: [Advocates]
 */
router.put(
  '/case-requests/:id/accept',
  protect,
  authorize('advocate'),
  handleCaseRequest
);

/**
 * @swagger
 * /advocates/case-requests/{id}/reject:
 *   put:
 *     summary: Reject a case request
 *     tags: [Advocates]
 */
router.put(
  '/case-requests/:id/reject',
  protect,
  authorize('advocate'),
  handleCaseRequest
);

/**
 * @swagger
 * /advocates/appointments:
 *   get:
 *     summary: Get advocate's appointments
 *     tags: [Advocates]
 */
router.get(
  '/appointments',
  protect,
  authorize('advocate'),
  getAppointments
);

/**
 * @swagger
 * /advocates/verification-status:
 *   get:
 *     summary: Get advocate's verification status
 *     tags: [Advocates]
 */
router.get(
  '/verification-status',
  protect,
  authorize('advocate'),
  getVerificationStatus
);

/**
 * @swagger
 * /advocates/profile:
 *   put:
 *     summary: Update advocate profile
 *     tags: [Advocates]
 */
router.put(
  '/profile',
  protect,
  authorize('advocate'),
  [
    body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty'),
    body('experience').optional().isNumeric().withMessage('Experience must be a number'),
    body('consultationFee').optional().isNumeric().withMessage('Consultation fee must be a number')
  ],
  validateRequest,
  updateAdvocateProfile
);

module.exports = router;
