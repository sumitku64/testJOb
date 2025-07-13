const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');
const {
  uploadDocuments,
  uploadResume,
  uploadAvatar
} = require('../controllers/upload.controller');

/**
 * @swagger
 * /upload/documents:
 *   post:
 *     summary: Upload documents
 *     tags: [Upload]
 */
router.post(
  '/documents',
  protect,
  upload.array('documents', 5),
  uploadDocuments
);

/**
 * @swagger
 * /upload/resume:
 *   post:
 *     summary: Upload resume
 *     tags: [Upload]
 */
router.post(
  '/resume',
  protect,
  upload.single('resume'),
  uploadResume
);

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Upload avatar
 *     tags: [Upload]
 */
router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  uploadAvatar
);

module.exports = router;
