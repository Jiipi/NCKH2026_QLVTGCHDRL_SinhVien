/**
 * Custom Error Classes
 * Provides better error handling and consistent error responses
 */

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Operational errors vs programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id 
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  const { logError } = require('../../core/logger');
  
  // Log error
  logError('Error Handler', err, {
    path: req.path,
    method: req.method,
    userId: req.user?.sub
  });
  
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;
  
  // Handle operational errors
  if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    // Joi/Zod validation errors
    statusCode = 400;
    message = 'Validation error';
    details = err.details;
  } else if (err.code === 'P2002') {
    // Prisma unique constraint error
    statusCode = 409;
    message = 'Duplicate entry';
    details = err.meta;
  } else if (err.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    message = 'Record not found';
  }
  
  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  errorHandler,
  asyncHandler
};




