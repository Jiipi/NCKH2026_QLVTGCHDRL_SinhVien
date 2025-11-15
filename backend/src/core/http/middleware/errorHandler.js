/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

const { AppError } = require('../../errors/AppError');
const { mapError } = require('../../errors/errorMapper');
const { ApiResponse } = require('../response/apiResponse');
const { logError } = require('../../logger');
const config = require('../../config');

/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
function errorHandler(err, req, res, next) {
  // Map error to AppError if not already
  const appError = err instanceof AppError ? err : mapError(err);

  // Log error
  logError('Request error', appError, {
    path: req.path,
    method: req.method,
    userId: req.user?.sub,
    ip: req.ip,
  });

  // Prepare response
  const statusCode = appError.statusCode || 500;
  const message = appError.message || 'Internal Server Error';
  const details = appError.details || null;

  // Include stack trace in development
  const responseData = ApiResponse.error(message, statusCode, details);
  
  if (config.server.isDevelopment && appError.stack) {
    responseData.stack = appError.stack;
  }

  return res.status(statusCode).json(responseData);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  const message = `Route ${req.method} ${req.path} not found`;
  logError('404 Not Found', null, {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  return res.status(404).json(ApiResponse.notFound(message));
}

module.exports = {
  errorHandler,
  notFoundHandler,
};




