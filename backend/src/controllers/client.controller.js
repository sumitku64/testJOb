const ErrorResponse = require('../utils/errorResponse');
const Appointment = require('../models/appointment.model');
const Advocate = require('../models/advocate.model');
const Notification = require('../models/notification.model');

// @desc    Get client dashboard stats
// @route   GET /api/v1/clients/dashboard-stats
// @access  Private/Client
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Get total appointments
      Appointment.countDocuments({ client: req.user.id }),
      // Get upcoming appointments
      Appointment.countDocuments({
        client: req.user.id,
        date: { $gte: new Date() },
        status: 'confirmed'
      }),
      // Get total spent
      Appointment.aggregate([
        {
          $match: {
            client: req.user._id,
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
        upcomingAppointments: stats[1],
        totalSpent: stats[2][0]?.total || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create case request
// @route   POST /api/v1/clients/case-requests
// @access  Private/Client
exports.createCaseRequest = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.body.advocateId);

    if (!advocate) {
      return next(new ErrorResponse('Advocate not found', 404));
    }

    if (!advocate.verified) {
      return next(new ErrorResponse('Advocate is not verified', 400));
    }

    const appointment = await Appointment.create({
      client: req.user.id,
      advocate: advocate._id,
      type: req.body.type,
      notes: req.body.description,
      fee: advocate.consultationFee,
      date: req.body.date,
      startTime: req.body.startTime
    });

    // Create notification for advocate
    await Notification.create({
      user: advocate._id,
      title: 'New Case Request',
      message: 'You have received a new case request',
      type: 'case-request',
      relatedId: appointment._id,
      onModel: 'Appointment'
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get client's cases
// @route   GET /api/v1/clients/cases
// @access  Private/Client
exports.getCases = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = { client: req.user.id };

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('advocate', 'name email specialization')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Book appointment
// @route   POST /api/v1/clients/book-appointment
// @access  Private/Client
exports.bookAppointment = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.body.advocateId);

    if (!advocate) {
      return next(new ErrorResponse('Advocate not found', 404));
    }

    // Check if the advocate is available at the requested time
    const isSlotAvailable = advocate.availability.some(day => {
      return day.slots.some(slot => 
        !slot.isBooked && 
        slot.startTime === req.body.startTime &&
        new Date(req.body.date).getDay() === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day.day)
      );
    });

    if (!isSlotAvailable) {
      return next(new ErrorResponse('Selected time slot is not available', 400));
    }

    const appointment = await Appointment.create({
      client: req.user.id,
      advocate: advocate._id,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      type: req.body.type,
      fee: advocate.consultationFee
    });

    // Update advocate's availability
    await Advocate.updateOne(
      { 
        _id: advocate._id,
        'availability.day': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(req.body.date).getDay()],
        'availability.slots.startTime': req.body.startTime
      },
      {
        $set: {
          'availability.$.slots.$.isBooked': true
        }
      }
    );

    // Create notification for advocate
    await Notification.create({
      user: advocate._id,
      title: 'New Appointment',
      message: 'You have a new appointment request',
      type: 'appointment',
      relatedId: appointment._id,
      onModel: 'Appointment'
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get client's appointments
// @route   GET /api/v1/clients/appointments
// @access  Private/Client
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    
    let query = { client: req.user.id };

    if (status) {
      query.status = status;
    }

    if (date) {
      query.date = new Date(date);
    }

    const appointments = await Appointment.find(query)
      .populate('advocate', 'name email specialization')
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
