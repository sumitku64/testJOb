const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');
const Advocate = require('../models/advocate.model');
const Intern = require('../models/intern.model');

// @desc    Upload documents
// @route   POST /api/v1/upload/documents
// @access  Private
exports.uploadDocuments = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(new ErrorResponse('Please upload files', 400));
    }

    const files = req.files.map(file => file.filename);

    // If user is advocate, update their documents
    if (req.user.role === 'advocate') {
      await Advocate.findByIdAndUpdate(req.user.id, {
        $push: { documents: { $each: files } }
      });
    }

    res.status(200).json({
      success: true,
      data: files
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload resume
// @route   POST /api/v1/upload/resume
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Only interns can upload resume
    if (req.user.role !== 'intern') {
      return next(new ErrorResponse('Only interns can upload resume', 403));
    }

    await Intern.findByIdAndUpdate(req.user.id, {
      resume: req.file.filename
    });

    res.status(200).json({
      success: true,
      data: req.file.filename
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload avatar
// @route   POST /api/v1/upload/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.filename },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
