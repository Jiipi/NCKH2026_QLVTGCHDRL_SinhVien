/**
 * API Response Utilities
 * Standardized response format for all API endpoints
 * @module core/http/response/apiResponse
 */

import { Response } from 'express';

/**
 * Base response interface
 */
interface BaseResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Success response interface
 */
export interface SuccessApiResponse<T = unknown> extends BaseResponse {
  success: true;
  data: T;
}

/**
 * Error response interface
 */
export interface ErrorApiResponse extends BaseResponse {
  success: false;
  errors?: unknown;
  stack?: string;
}

/**
 * Paginated response interface
 */
export interface PaginatedApiResponse<T = unknown> extends BaseResponse {
  success: true;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

/**
 * Standard API Response Class
 */
export class ApiResponse {
  /**
   * Success response
   */
  static success<T>(data: T, message: string = 'Success', statusCode: number = 200): SuccessApiResponse<T> {
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
   */
  static error(message: string = 'Error occurred', statusCode: number = 500, errors: unknown = null): ErrorApiResponse {
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
   */
  static validationError(errors: unknown, message: string = 'Validation failed'): ErrorApiResponse {
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
   */
  static notFound(message: string = 'Resource not found'): ErrorApiResponse {
    return {
      success: false,
      message,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized access'): ErrorApiResponse {
    return {
      success: false,
      message,
      statusCode: 401,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Forbidden response
   */
  static forbidden(message: string = 'Forbidden access'): ErrorApiResponse {
    return {
      success: false,
      message,
      statusCode: 403,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success'
  ): PaginatedApiResponse<T> {
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
 */
export function sendResponse(
  res: Response,
  statusCode: number,
  responseData: SuccessApiResponse | ErrorApiResponse | PaginatedApiResponse
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
  return sendResponse(res, statusCode, ApiResponse.success(data, message, statusCode));
}

/**
 * Send error response helper
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors: unknown = null
): Response {
  return sendResponse(res, statusCode, ApiResponse.error(message, statusCode, errors));
}
