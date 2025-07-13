const ErrorResponse = require('../utils/errorResponse');
const Advocate = require('../models/advocate.model');
const Internship = require('../models/internship.model');

// @desc    Search advocates
// @route   GET /api/v1/search/advocates
// @access  Public
exports.searchAdvocates = async (req, res, next) => {
  try {
    const { q, location, category, fee, sort } = req.query;

    let query = {
      verified: true,
      verificationStatus: 'approved'
    };

    // Add text search if query provided
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { specialization: { $regex: q, $options: 'i' } }
      ];
    }

    // Add location filter if provided
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    // Add category/specialization filter if provided
    if (category) {
      query.specialization = { $regex: category, $options: 'i' };
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

// @desc    Search internships
// @route   GET /api/v1/search/internships
// @access  Public
exports.searchInternships = async (req, res, next) => {
  try {
    const { q, location, type, stipend, sort } = req.query;

    let query = { status: 'published' };

    // Add text search if query provided
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Add location filter if provided
    if (location) {
      query.location = { $regex: location, $options: 'i' };
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
    let internshipsQuery = Internship.find(query)
      .populate('advocate', 'name email specialization');

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
