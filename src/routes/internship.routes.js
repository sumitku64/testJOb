const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');
const {
  createInternship,
  getInternships,
  getInternship,
  applyForInternship,
  getMyPosts,
  getMyApplications,
  updateInternship,
  deleteInternship,
} = require('../controllers/internship.controller');

/**
 * @swagger
 * /internships:
 *   post:
 *     summary: Create a new internship posting
 *     tags: [Internships]
 */
router.post(
  '/',
  protect,
  authorize('advocate'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('stipend').isNumeric().withMessage('Stipend must be a number'),
    body('location').notEmpty().withMessage('Location is required'),
    body('requirements').isArray().withMessage('Requirements must be an array'),
    body('numberOfOpenings').isNumeric().withMessage('Number of openings must be a number')
  ],
  validateRequest,
  createInternship
);

/**
 * @swagger
 * /internships:
 *   get:
 *     summary: Get all internships
 *     tags: [Internships]
 */
router.get('/', getInternships);

/**
 * @swagger
 * /internships/{id}:
 *   get:
 *     summary: Get single internship
 *     tags: [Internships]
 */
router.get('/:id', getInternship);

/**
 * @swagger
 * /internships/{id}/apply:
 *   post:
 *     summary: Apply for an internship
 *     tags: [Internships]
 */
router.post(
  '/:id/apply',
  protect,
  authorize('intern'),
  upload.single('resume'),
  applyForInternship
);

/**
 * @swagger
 * /internships/my-posts:
 *   get:
 *     summary: Get advocate's internship posts
 *     tags: [Internships]
 */
router.get(
  '/my-posts',
  protect,
  authorize('advocate'),
  getMyPosts
);

/**
 * @swagger
 * /internships/my-applications:
 *   get:
 *     summary: Get intern's applications
 *     tags: [Internships]
 */
router.get(
  '/my-applications',
  protect,
  authorize('intern'),
  getMyApplications
);

/**
 * @swagger
 * /internships/{id}:
 *   put:
 *     summary: Update internship posting
 *     tags: [Internships]
 */
router.put(
  '/:id',
  protect,
  authorize('advocate'),
  validateRequest,
  updateInternship
);

/**
 * @swagger
 * /internships/{id}:
 *   delete:
 *     summary: Delete internship posting
 *     tags: [Internships]
 */
router.delete(
  '/:id',
  protect,
  authorize('advocate'),
  deleteInternship
);

module.exports = router;
