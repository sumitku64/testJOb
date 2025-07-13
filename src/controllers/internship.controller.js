const ErrorResponse = require('../utils/errorResponse');
const Internship = require('../models/internship.model');
const Notification = require('../models/notification.model');
const Intern = require('../models/intern.model');

// @desc    Create new internship
// @route   POST /api/v1/internships
// @access  Private/Advocate
exports.createInternship = async (req, res, next) => {
  try {
    // Add advocate to req.body
    req.body.advocate = req.user.id;

    const internship = await Internship.create(req.body);

    res.status(201).json({
      success: true,
      data: internship
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all internships
// @route   GET /api/v1/internships
// @access  Public
exports.getInternships = async (req, res, next) => {
  try {
    const { location, type, stipend, sort } = req.query;

    let query = { status: 'published' };

    // Add location filter if provided
    if (location) {
      query.location = location;
    }

    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    // Add stipend range filter if provided
    if (stipend) {
      const [min, max] = stipend.split('-');
      query.stipend = {
        $gte: parseInt(min),
        $lte: parseInt(max)
      };
    }

    // Create query
    let internshipsQuery = Internship.find(query).populate('advocate', 'name');

    // Sort
    if (sort) {
      const sortFields = sort.split(',').join(' ');
      internshipsQuery = internshipsQuery.sort(sortFields);
    } else {
      internshipsQuery = internshipsQuery.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Internship.countDocuments(query);

    internshipsQuery = internshipsQuery.skip(startIndex).limit(limit);

    // Execute query
    const internships = await internshipsQuery;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: internships.length,
      pagination,
      data: internships
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single internship
// @route   GET /api/v1/internships/:id
// @access  Public
exports.getInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('advocate', 'name email specialization')
      .populate('applications.intern', 'name email');

    if (!internship) {
      return next(new ErrorResponse('Internship not found', 404));
    }

    res.status(200).json({
      success: true,
      data: internship
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply for internship
// @route   POST /api/v1/internships/:id/apply
// @access  Private/Intern
exports.applyForInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return next(new ErrorResponse('Internship not found', 404));
    }

    // Check if application deadline has passed
    if (new Date(internship.applicationDeadline) < new Date()) {
      return next(new ErrorResponse('Application deadline has passed', 400));
    }

    // Check if intern has already applied
    if (internship.applications.some(app => app.intern.toString() === req.user.id)) {
      return next(new ErrorResponse('Already applied to this internship', 400));
    }

    // Add application
    internship.applications.push({
      intern: req.user.id,
      status: 'pending'
    });

    await internship.save();

    // Update intern's applications array
    await Intern.findByIdAndUpdate(req.user.id, {
      $push: { applications: internship._id }
    });

    // Create notification for advocate
    await Notification.create({
      user: internship.advocate,
      title: 'New Internship Application',
      message: `New application received for ${internship.title}`,
      type: 'internship',
      relatedId: internship._id,
      onModel: 'Internship'
    });

    res.status(200).json({
      success: true,
      data: internship
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advocate's internship posts
// @route   GET /api/v1/internships/my-posts
// @access  Private/Advocate
exports.getMyPosts = async (req, res, next) => {
  try {
    const internships = await Internship.find({ advocate: req.user.id })
      .populate('applications.intern', 'name email');

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get intern's applications
// @route   GET /api/v1/internships/my-applications
// @access  Private/Intern
exports.getMyApplications = async (req, res, next) => {
  try {
    const intern = await Intern.findById(req.user.id)
      .populate({
        path: 'applications',
        populate: {
          path: 'advocate',
          select: 'name email'
        }
      });

    res.status(200).json({
      success: true,
      count: intern.applications.length,
      data: intern.applications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update internship
// @route   PUT /api/v1/internships/:id
// @access  Private/Advocate
exports.updateInternship = async (req, res, next) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return next(new ErrorResponse('Internship not found', 404));
    }

    // Make sure user is internship owner
    if (internship.advocate.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          'User not authorized to update this internship',
          401
        )
      );
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: internship
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete internship
// @route   DELETE /api/v1/internships/:id
// @access  Private/Advocate
exports.deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return next(new ErrorResponse('Internship not found', 404));
    }

    // Make sure user is internship owner
    if (internship.advocate.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          'User not authorized to delete this internship',
          401
        )
      );
    }

    await internship.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
