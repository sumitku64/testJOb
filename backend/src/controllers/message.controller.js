const ErrorResponse = require('../utils/errorResponse');
const { Message, Conversation } = require('../models/message.model');
const Notification = require('../models/notification.model');

// @desc    Get user's conversations
// @route   GET /api/v1/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single conversation with messages
// @route   GET /api/v1/messages/conversations/:id
// @access  Private
exports.getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name avatar');

    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return next(new ErrorResponse('Not authorized to access this conversation', 401));
    }

    // Get messages
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    // Update conversation unread count
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new conversation
// @route   POST /api/v1/messages/conversations
// @access  Private
exports.createConversation = async (req, res, next) => {
  try {
    const { participants } = req.body;

    // Add current user to participants
    participants.push(req.user.id);

    // Check if conversation already exists between these participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants },
      type: 'direct'
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: existingConversation
      });
    }

    const conversation = await Conversation.create({
      participants,
      type: participants.length > 2 ? 'group' : 'direct'
    });

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send message in conversation
// @route   POST /api/v1/messages/conversations/:id/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return next(new ErrorResponse('Conversation not found', 404));
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return next(new ErrorResponse('Not authorized to send message in this conversation', 401));
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      content: req.body.content,
      attachments: req.body.attachments
    });

    // Update conversation's last message
    conversation.lastMessage = message._id;
    
    // Increment unread count for all participants except sender
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    // Create notifications for other participants
    const notifications = conversation.participants
      .filter(p => p.toString() !== req.user.id)
      .map(participant => ({
        user: participant,
        title: 'New Message',
        message: `You have a new message from ${req.user.name}`,
        type: 'message',
        relatedId: conversation._id,
        onModel: 'Conversation'
      }));

    await Notification.insertMany(notifications);

    // Populate sender details
    await message.populate('sender', 'name avatar');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};
