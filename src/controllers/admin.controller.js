const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');
const Advocate = require('../models/advocate.model');
const Intern = require('../models/intern.model');
const Internship = require('../models/internship.model');
const Appointment = require('../models/appointment.model');
const Notification = require('../models/notification.model');

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Total users by role
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      // Pending advocate verifications
      Advocate.countDocuments({ verificationStatus: 'pending' }),
      // Total appointments
      Appointment.countDocuments(),
      // Total earnings
      Appointment.aggregate([
        {
          $match: { paymentStatus: 'completed' }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$fee' }
          }
        }
      ])
    ]);

    const userStats = stats[0].reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        users: userStats,
        pendingVerifications: stats[1],
        totalAppointments: stats[2],
        totalEarnings: stats[3][0]?.total || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advocates pending verification
// @route   GET /api/v1/admin/advocates/pending-verification
// @access  Private/Admin
exports.getPendingAdvocates = async (req, res, next) => {
  try {
    const advocates = await Advocate.find({ verificationStatus: 'pending' })
      .select('name email phoneNumber barCouncilNumber specialization documents');

    res.status(200).json({
      success: true,
      count: advocates.length,
      data: advocates
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify advocate
// @route   PUT /api/v1/admin/advocates/:id/verify
// @access  Private/Admin
exports.verifyAdvocate = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id);

    if (!advocate) {
      return next(new ErrorResponse('Advocate not found', 404));
    }

    advocate.verified = true;
    advocate.verificationStatus = 'approved';
    await advocate.save();

    // Create notification
    await Notification.create({
      user: advocate._id,
      title: 'Account Verified',
      message: 'Your advocate account has been verified. You can now start using all features.',
      type: 'verification'
    });

    res.status(200).json({
      success: true,
      data: advocate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject advocate
// @route   PUT /api/v1/admin/advocates/:id/reject
// @access  Private/Admin
exports.rejectAdvocate = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id);

    if (!advocate) {
      return next(new ErrorResponse('Advocate not found', 404));
    }

    advocate.verified = false;
    advocate.verificationStatus = 'rejected';
    await advocate.save();

    // Create notification
    await Notification.create({
      user: advocate._id,
      title: 'Verification Rejected',
      message: 'Your advocate account verification has been rejected. Please contact support for more information.',
      type: 'verification'
    });

    res.status(200).json({
      success: true,
      data: advocate
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all internships
// @route   GET /api/v1/admin/internships
// @access  Private/Admin
exports.getInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find()
      .populate('advocate', 'name email')
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

// @desc    Approve internship
// @route   PUT /api/v1/admin/internships/:id/approve
// @access  Private/Admin
exports.approveInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return next(new ErrorResponse('Internship not found', 404));
    }

    internship.status = 'published';
    await internship.save();

    // Create notification
    await Notification.create({
      user: internship.advocate,
      title: 'Internship Approved',
      message: `Your internship posting "${internship.title}" has been approved.`,
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

// @desc    Reject internship
// @route   PUT /api/v1/admin/internships/:id/reject
// @access  Private/Admin
exports.rejectInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return next(new ErrorResponse('Internship not found', 404));
    }

    internship.status = 'closed';
    await internship.save();

    // Create notification
    await Notification.create({
      user: internship.advocate,
      title: 'Internship Rejected',
      message: `Your internship posting "${internship.title}" has been rejected.`,
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

// @desc    Get platform analytics
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Promise.all([
      // Monthly user registrations
      User.aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ]),
      // Monthly appointments
      Appointment.aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'completed'] },
                  '$fee',
                  0
                ]
              }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ]),
      // Top advocates by appointments
      Appointment.aggregate([
        {
          $group: {
            _id: '$advocate',
            appointmentCount: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentStatus', 'completed'] },
                  '$fee',
                  0
                ]
              }
            }
          }
        },
        { $sort: { appointmentCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'advocate'
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        userRegistrations: analytics[0],
        appointments: analytics[1],
        topAdvocates: analytics[2]
      }
    });
  } catch (err) {
    next(err);
  }
};
