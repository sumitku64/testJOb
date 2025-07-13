const mongoose = require('mongoose');
const User = require('./user.model');

const internSchema = new mongoose.Schema({
  education: {
    currentInstitution: {
      type: String,
      required: [true, 'Please add current institution']
    },
    degree: {
      type: String,
      required: [true, 'Please add degree']
    },
    year: {
      type: Number,
      required: [true, 'Please add current year']
    }
  },
  resume: {
    type: String,
    required: [true, 'Please upload your resume']
  },
  skills: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  applications: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Internship'
  }]
});

const Intern = User.discriminator('intern', internSchema);

module.exports = Intern;
