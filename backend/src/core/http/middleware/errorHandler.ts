/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 * @module core/http/middleware/errorHandler
 */

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../../errors/AppError';
import { mapError } from '../../errors/errorMapper';
import { ApiResponse, ErrorApiResponse } from '../response/apiResponse';
import { logError } from '../../logger';
import config from '../../config';
import { AuthenticatedRequest } from './authJwt';

/**
 * Extended error response with stack
 */
interface ExtendedErrorResponse extends ErrorApiResponse {
  stack?: string;
}

/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: AuthenticatedRequest,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
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
  const responseData: ExtendedErrorResponse = ApiResponse.error(message, statusCode, details);

  if (config.server.isDevelopment && appError.stack) {
    responseData.stack = appError.stack;
  }

  res.status(statusCode).json(responseData);
};

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const message = `Route ${req.method} ${req.path} not found`;
  logError('404 Not Found', null, {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json(ApiResponse.notFound(message));
}
