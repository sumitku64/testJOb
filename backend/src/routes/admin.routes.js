const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getPendingAdvocates,
  verifyAdvocate,
  rejectAdvocate,
  getUsers,
  getInternships,
  approveInternship,
  rejectInternship,
  getAnalytics
} = require('../controllers/admin.controller');

// Protect and authorize all routes
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /admin/dashboard-stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 */
router.get('/dashboard-stats', getDashboardStats);

/**
 * @swagger
 * /admin/advocates/pending-verification:
 *   get:
 *     summary: Get advocates pending verification
 *     tags: [Admin]
 */
router.get('/advocates/pending-verification', getPendingAdvocates);

/**
 * @swagger
 * /admin/advocates/{id}/verify:
 *   put:
 *     summary: Verify an advocate
 *     tags: [Admin]
 */
router.put('/advocates/:id/verify', verifyAdvocate);

/**
 * @swagger
 * /admin/advocates/{id}/reject:
 *   put:
 *     summary: Reject an advocate
 *     tags: [Admin]
 */
router.put('/advocates/:id/reject', rejectAdvocate);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /admin/internships:
 *   get:
 *     summary: Get all internships
 *     tags: [Admin]
 */
router.get('/internships', getInternships);

/**
 * @swagger
 * /admin/internships/{id}/approve:
 *   put:
 *     summary: Approve an internship posting
 *     tags: [Admin]
 */
router.put('/internships/:id/approve', approveInternship);

/**
 * @swagger
 * /admin/internships/{id}/reject:
 *   put:
 *     summary: Reject an internship posting
 *     tags: [Admin]
 */
router.put('/internships/:id/reject', rejectInternship);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get platform analytics
 *     tags: [Admin]
 */
router.get('/analytics', getAnalytics);

module.exports = router;
