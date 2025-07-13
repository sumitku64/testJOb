const { body, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

const validateRequest = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => err.msg);
    return next(new ErrorResponse(extractedErrors[0], 400));
  };
};

module.exports = validateRequest;
