const mongoose = require('mongoose');
const User = require('./user.model');

const advocateSchema = new mongoose.Schema({
  specialization: {
    type: String,
    required: [true, 'Please add specialization']
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience']
  },
  barCouncilNumber: {
    type: String,
    required: [true, 'Please add bar council number'],
    unique: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please add consultation fee']
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      startTime: String,
      endTime: String,
      isBooked: {
        type: Boolean,
        default: false
      }
    }]
  }],
  ratings: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not be more than 5']
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  documents: [{
    type: String
  }],
  languages: [{
    type: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  cases: {
    ongoing: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    }
  }
});

const Advocate = User.discriminator('advocate', advocateSchema);

module.exports = Advocate;
