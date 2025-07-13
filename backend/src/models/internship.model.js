const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    advocate: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    requirements: [{
      type: String,
      required: [true, 'Please add requirements']
    }],
    duration: {
      type: Number,
      required: [true, 'Please add duration in months']
    },
    stipend: {
      type: Number,
      required: [true, 'Please add stipend amount']
    },
    location: {
      type: String,
      required: [true, 'Please add a location']
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'remote'],
      required: true
    },
    startDate: {
      type: Date,
      required: [true, 'Please add start date']
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft'
    },
    applications: [{
      intern: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      },
      appliedAt: {
        type: Date,
        default: Date.now
      }
    }],
    skills: [{
      type: String
    }],
    numberOfOpenings: {
      type: Number,
      required: [true, 'Please add number of openings']
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Please add application deadline']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Internship', internshipSchema);
