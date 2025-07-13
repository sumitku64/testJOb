const ErrorResponse = require('../utils/errorResponse');
const Advocate = require('../models/advocate.model');
const Appointment = require('../models/appointment.model');
const Notification = require('../models/notification.model');

// @desc    Get all advocates
// @route   GET /api/v1/advocates
// @access  Public
exports.getAdvocates = async (req, res, next) => {
  try {
    const { location, specialization, fee, sort } = req.query;

    let query = {
      verified: true,
      verificationStatus: 'approved'
    };

    // Add location filter if provided
    if (location) {
      query['location.city'] = location;
    }

    // Add specialization filter if provided
    if (specialization) {
      query.specialization = specialization;
    }

    // Add fee range filter if provided
    if (fee) {
      const [min, max] = fee.split('-');
      query.consultationFee = {
        $gte: parseInt(min),
        $lte: parseInt(max)
      };
    }

    // Create query
    let advocatesQuery = Advocate.find(query);

    // Sort
    if (sort) {
      const sortFields = sort.split(',').join(' ');
      advocatesQuery = advocatesQuery.sort(sortFields);
    } else {
      advocatesQuery = advocatesQuery.sort('-ratings');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Advocate.countDocuments(query);

    advocatesQuery = advocatesQuery.skip(startIndex).limit(limit);

    // Execute query
    const advocates = await advocatesQuery;

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
      count: advocates.length,
      pagination,
      data: advocates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single advocate
// @route   GET /api/v1/advocates/:id
// @access  Public
exports.getAdvocate = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id);

    if (!advocate) {
      return next(new ErrorResponse('Advocate not found', 404));
    }

    res.status(200).json({
      success: true,
      data: advocate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advocate dashboard stats
// @route   GET /api/v1/advocates/dashboard-stats
// @access  Private/Advocate
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Get total appointments
      Appointment.countDocuments({ advocate: req.user.id }),
      // Get pending appointments
      Appointment.countDocuments({ advocate: req.user.id, status: 'pending' }),
      // Get this month's appointments
      Appointment.countDocuments({
        advocate: req.user.id,
        createdAt: {
          $gte: new Date(new Date().setDate(1)),
          $lte: new Date()
        }
      }),
      // Get total earnings
      Appointment.aggregate([
        {
          $match: {
            advocate: req.user._id,
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$fee' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAppointments: stats[0],
        pendingAppointments: stats[1],
        monthlyAppointments: stats[2],
        totalEarnings: stats[3][0]?.total || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advocate's case requests
// @route   GET /api/v1/advocates/case-requests
// @access  Private/Advocate
exports.getCaseRequests = async (req, res, next) => {
  try {
    const requests = await Appointment.find({
      advocate: req.user.id,
      status: 'pending'
    }).populate('client', 'name email');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle case request (accept/reject)
// @route   PUT /api/v1/advocates/case-requests/:id/accept
// @route   PUT /api/v1/advocates/case-requests/:id/reject
// @access  Private/Advocate
exports.handleCaseRequest = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      advocate: req.user.id
    });

    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    // Update status based on the endpoint
    appointment.status = req.path.endsWith('accept') ? 'confirmed' : 'cancelled';
    await appointment.save();

    // Create notification for client
    await Notification.create({
      user: appointment.client,
      title: 'Case Request Update',
      message: `Your case request has been ${appointment.status}`,
      type: 'case-request',
      relatedId: appointment._id,
      onModel: 'Appointment'
    });

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advocate's appointments
// @route   GET /api/v1/advocates/appointments
// @access  Private/Advocate
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    
    let query = { advocate: req.user.id };

    if (status) {
      query.status = status;
    }

    if (date) {
      query.date = new Date(date);
    }

    const appointments = await Appointment.find(query)
      .populate('client', 'name email phoneNumber')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advocate's verification status
// @route   GET /api/v1/advocates/verification-status
// @access  Private/Advocate
exports.getVerificationStatus = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.user.id).select('verified verificationStatus');

    res.status(200).json({
      success: true,
      data: {
        verified: advocate.verified,
        status: advocate.verificationStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update advocate profile
// @route   PUT /api/v1/advocates/profile
// @access  Private/Advocate
exports.updateAdvocateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      specialization: req.body.specialization,
      experience: req.body.experience,
      consultationFee: req.body.consultationFee,
      languages: req.body.languages,
      education: req.body.education,
      availability: req.body.availability
    };

    const advocate = await Advocate.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: advocate
    });
  } catch (err) {
    next(err);
  }
};
