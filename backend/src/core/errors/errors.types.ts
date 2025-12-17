/**
 * Core Errors - Type Definitions
 * Custom application error types
 */

// ============== Base Error Types ==============

/**
 * AppError - Base custom error class
 */
export interface IAppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details: unknown | null;
  timestamp: string;
  toJSON(): AppErrorJSON;
}

/**
 * AppError JSON representation
 */
export interface AppErrorJSON {
  message: string;
  statusCode: number;
  details: unknown | null;
  timestamp: string;
  stack?: string;
}

// ============== Error Constructor Types ==============

/**
 * AppError constructor interface
 */
export interface IAppErrorConstructor {
  new (message?: string, statusCode?: number, isOperational?: boolean, details?: unknown): IAppError;
}

/**
 * Specialized error constructor interface
 */
export interface ISpecializedErrorConstructor {
  new (message?: string, details?: unknown): IAppError;
}

// ============== HTTP Error Types ==============

/**
 * Bad Request Error (400)
 */
export interface IBadRequestError extends IAppError {
  statusCode: 400;
}

/**
 * Unauthorized Error (401)
 */
export interface IUnauthorizedError extends IAppError {
  statusCode: 401;
}

/**
 * Forbidden Error (403)
 */
export interface IForbiddenError extends IAppError {
  statusCode: 403;
}

/**
 * Not Found Error (404)
 */
export interface INotFoundError extends IAppError {
  statusCode: 404;
}

/**
 * Conflict Error (409)
 */
export interface IConflictError extends IAppError {
  statusCode: 409;
}

/**
 * Validation Error (422)
 */
export interface IValidationError extends IAppError {
  statusCode: 422;
}

/**
 * Internal Server Error (500)
 */
export interface IInternalServerError extends IAppError {
  statusCode: 500;
}

// ============== Error Handler Types ==============

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Error mapper function type
 */
export type ErrorMapper = (error: Error) => IAppError;

// ============== Module Exports ==============
module.exports = {};
