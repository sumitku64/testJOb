const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation',
      required: true
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Please add a message']
    },
    attachments: [{
      type: String
    }],
    readBy: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    lastMessage: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message'
    },
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct'
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
conversationSchema.index({ participants: 1 });

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };
