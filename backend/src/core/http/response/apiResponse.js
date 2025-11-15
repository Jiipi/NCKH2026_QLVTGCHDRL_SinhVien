/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 */

/**
 * Standard API Response Class
 */
class ApiResponse {
  /**
   * Success response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {any} errors - Error details
   */
  static error(message = 'Error occurred', statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      statusCode,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validation error response
   * @param {any} errors - Validation error details
   * @param {string} message - Error message
   */
  static validationError(errors, message = 'Validation failed') {
    return {
      success: false,
      message,
      statusCode: 422,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Not found response
   * @param {string} message - Not found message
   */
  static notFound(message = 'Resource not found') {
    return {
      success: false,
      message,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Unauthorized response
   * @param {string} message - Unauthorized message
   */
  static unauthorized(message = 'Unauthorized access') {
    return {
      success: false,
      message,
      statusCode: 401,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Forbidden response
   * @param {string} message - Forbidden message
   */
  static forbidden(message = 'Forbidden access') {
    return {
      success: false,
      message,
      statusCode: 403,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Paginated response
   * @param {Array} items - Array of items
   * @param {number} total - Total count
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {string} message - Success message
   */
  static paginated(items, total, page, limit, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      message,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Send response helper
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} responseData - Response data
 */
const sendResponse = (res, statusCode, responseData) => {
  return res.status(statusCode).json(responseData);
};

/**
 * Send success response helper
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return sendResponse(res, statusCode, ApiResponse.success(data, message, statusCode));
};

/**
 * Send error response helper
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Error details
 */
const sendError = (res, message, statusCode = 500, errors = null) => {
  return sendResponse(res, statusCode, ApiResponse.error(message, statusCode, errors));
};

module.exports = {
  ApiResponse,
  sendResponse,
  sendSuccess,
  sendError,
};




