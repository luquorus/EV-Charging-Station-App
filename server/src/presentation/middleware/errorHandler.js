const { errorResponse } = require('../../utils/apiResponse');
const { isAppError } = require('../../utils/errors');
const { logger } = require('../../config/logger');

// Centralized error handling middleware
// MUST have 4 params to be recognized by Express.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const requestId = req.id;

  if (isAppError(err)) {
    logger.warn({ code: err.code, details: err.details, path: req.path }, err.message);
    const body = errorResponse(err.code, err.message, err.statusCode, err.details, {
      requestId,
    });
    return res.status(err.statusCode).json(body);
  }

  logger.error({ path: req.path, err }, 'Unhandled error');
  const body = errorResponse('INTERNAL_SERVER_ERROR', 'Something went wrong', 500, [], {
    requestId,
  });

  return res.status(500).json(body);
}

module.exports = { errorHandler };
