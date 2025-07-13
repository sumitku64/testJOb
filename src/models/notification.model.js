const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'appointment',
        'message',
        'case-request',
        'verification',
        'internship',
        'system'
      ],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String
    },
    relatedId: {
      type: mongoose.Schema.ObjectId,
      refPath: 'onModel'
    },
    onModel: {
      type: String,
      enum: ['Appointment', 'Message', 'Internship', 'User']
    }
  },
  {
    timestamps: true
  }
);

// Create index for faster queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
