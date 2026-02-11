/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

const logger = require('./logger');
const { errorResponse } = require('./responseFormatter');

/**
 * Express error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'unauthenticated'
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry - resource already exists';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference - related resource not found';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred';
  }

  return errorResponse(res, message, statusCode,
    process.env.NODE_ENV !== 'production' ? err.stack : undefined
  );
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Async handler wrapper
 * Eliminates need for try-catch in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
