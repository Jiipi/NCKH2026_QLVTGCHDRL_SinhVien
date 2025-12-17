/**
 * AppError - Custom Application Error Class
 * Extends native Error with additional properties for better error handling
 */

import { IAppError, AppErrorJSON } from './errors.types';

/**
 * Base Application Error Class
 */
export class AppError extends Error implements IAppError {
  public statusCode: number;
  public isOperational: boolean;
  public details: unknown | null;
  public timestamp: string;

  /**
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param isOperational - Is this a trusted operational error?
   * @param details - Additional error details/context
   */
  constructor(
    message: string = 'Error',
    statusCode: number = 500,
    isOperational: boolean = true,
    details: unknown | null = null
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON format
   */
  toJSON(): AppErrorJSON {
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
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details: unknown | null = null) {
    super(message, 400, true, details);
  }
}

/**
 * UnauthorizedError - 401
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details: unknown | null = null) {
    super(message, 401, true, details);
  }
}

/**
 * ForbiddenError - 403
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details: unknown | null = null) {
    super(message, 403, true, details);
  }
}

/**
 * NotFoundError - 404
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details: unknown | null = null) {
    super(message, 404, true, details);
  }
}

/**
 * ConflictError - 409
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details: unknown | null = null) {
    super(message, 409, true, details);
  }
}

/**
 * ValidationError - 422
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details: unknown | null = null) {
    super(message, 422, true, details);
  }
}

/**
 * InternalServerError - 500
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details: unknown | null = null) {
    super(message, 500, false, details);
  }
}

// CommonJS compatibility
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
