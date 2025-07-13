const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    advocate: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: [true, 'Please add appointment date']
    },
    startTime: {
      type: String,
      required: [true, 'Please add start time']
    },
    endTime: {
      type: String,
      required: [true, 'Please add end time']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    type: {
      type: String,
      enum: ['consultation', 'follow-up', 'document-review'],
      required: true
    },
    notes: {
      type: String
    },
    fee: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    documents: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

// Prevent user from submitting more than one appointment for same time slot
appointmentSchema.index({ advocate: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
