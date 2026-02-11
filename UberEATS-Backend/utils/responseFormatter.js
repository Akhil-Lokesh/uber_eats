/**
 * Standardized Response Formatter
 * Ensures consistent API responses across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    data
  };

  return res.status(statusCode).json(response);
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {*} errors - Validation errors or additional error details
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 422, errors);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse
};
