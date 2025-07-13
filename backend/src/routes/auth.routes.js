const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('role')
      .isIn(['client', 'advocate', 'intern'])
      .withMessage('Invalid role specified')
  ],
  validateRequest,
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  validateRequest,
  login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Auth]
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 */
router.put(
  '/profile',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please include a valid email')
  ],
  validateRequest,
  updateProfile
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please include a valid email')],
  validateRequest,
  forgotPassword
);

/**
 * @swagger
 * /auth/reset-password/{resetToken}:
 *   put:
 *     summary: Reset password
 *     tags: [Auth]
 */
router.put(
  '/reset-password/:resetToken',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  validateRequest,
  resetPassword
);

// Test endpoint for MongoDB sanitization
router.get('/test-sanitize', (req, res) => {
  // Log both query and body for demonstration
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);
  
  res.json({ 
    message: 'Sanitization Test Results',
    query: req.query,
    body: req.body
  });
});

module.exports = router;
