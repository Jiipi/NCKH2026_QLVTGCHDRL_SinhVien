/**
 * API Response Utility - Standardized API response formats
 * @module core/utils/response
 */

import { Response } from 'express';

/**
 * Standard success response data
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  statusCode: number;
}

/**
 * Standard error response data
 */
export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: unknown;
}

/**
 * API Response utility class for standardized responses
 */
export class ApiResponse {
  /**
   * Create a success response
   */
  static success<T>(data: T, message: string = 'Success', statusCode: number = 200): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  /**
   * Create an error response
   */
  static error(message: string = 'Error occurred', statusCode: number = 500, errors: unknown = null): ErrorResponse {
    return {
      success: false,
      message,
      statusCode,
      errors: errors || undefined
    };
  }

  /**
   * Create a validation error response
   */
  static validationError(errors: unknown, message: string = 'Validation failed'): ErrorResponse {
    return {
      success: false,
      message,
      statusCode: 400,
      errors
    };
  }

  /**
   * Create a not found response
   */
  static notFound(message: string = 'Resource not found'): ErrorResponse {
    return {
      success: false,
      message,
      statusCode: 404
    };
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized access'): ErrorResponse {
    return {
      success: false,
      message,
      statusCode: 401
    };
  }

  /**
   * Create a forbidden response
   */
  static forbidden(message: string = 'Forbidden access'): ErrorResponse {
    return {
      success: false,
      message,
      statusCode: 403
    };
  }
}

/**
 * Helper function to send response
 */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  responseData: SuccessResponse<T> | ErrorResponse
): Response {
  return res.status(statusCode).json(responseData);
}

/**
 * Send success response helper
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response {
  return res.status(statusCode).json(ApiResponse.success(data, message, statusCode));
}

/**
 * Send error response helper
 */
export function sendError(
  res: Response,
  message: string = 'Error occurred',
  statusCode: number = 500,
  errors: unknown = null
): Response {
  return res.status(statusCode).json(ApiResponse.error(message, statusCode, errors));
}

// CommonJS compatibility
module.exports = {
  ApiResponse,
  sendResponse,
  sendSuccess,
  sendError
};
