/**
 * AppError - Custom Application Error Class
 * Extends native Error with additional properties for better error handling
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Is this a trusted operational error?
   * @param {any} details - Additional error details/context
   */
  constructor(message, statusCode = 500, isOperational = true, details = null) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

/**
 * BadRequestError - 400
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, true, details);
  }
}

/**
 * UnauthorizedError - 401
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, true, details);
  }
}

/**
 * ForbiddenError - 403
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, 403, true, details);
  }
}

/**
 * NotFoundError - 404
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, true, details);
  }
}

/**
 * ConflictError - 409
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict', details = null) {
    super(message, 409, true, details);
  }
}

/**
 * ValidationError - 422
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422, true, details);
  }
}

/**
 * InternalServerError - 500
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details = null) {
    super(message, 500, false, details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
};




