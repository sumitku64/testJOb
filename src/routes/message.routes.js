const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const {
  getConversations,
  getConversation,
  createConversation,
  sendMessage
} = require('../controllers/message.controller');

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Messages]
 */
router.get(
  '/conversations',
  protect,
  getConversations
);

/**
 * @swagger
 * /messages/conversations/{id}:
 *   get:
 *     summary: Get single conversation with messages
 *     tags: [Messages]
 */
router.get(
  '/conversations/:id',
  protect,
  getConversation
);

/**
 * @swagger
 * /messages/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Messages]
 */
router.post(
  '/conversations',
  protect,
  [
    body('participants').isArray().withMessage('Participants must be an array'),
    body('participants.*').isMongoId().withMessage('Invalid participant ID')
  ],
  validateRequest,
  createConversation
);

/**
 * @swagger
 * /messages/conversations/{id}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messages]
 */
router.post(
  '/conversations/:id/messages',
  protect,
  [
    body('content').notEmpty().withMessage('Message content is required')
  ],
  validateRequest,
  sendMessage
);

module.exports = router;
