/**
 * BaseController - Abstract controller with common HTTP handling
 * Eliminates duplicate try-catch error handling across all controllers
 * 
 * @module core/base/BaseController
 * @example
 * ```typescript
 * class UserController extends BaseController {
 *   getAll = async (req, res) => 
 *     this.handleRequest(res, () => this.service.getAll(), 'Success');
 * }
 * ```
 */

import type { Request, Response } from 'express';

// Import JS modules with require for compatibility
const { ApiResponse, sendResponse } = require('../http/response/apiResponse');
const { AppError } = require('../errors/AppError');
const { logError } = require('../logger');

import type { 
  AuthenticatedRequest, 
  PaginationParams,
  UserContext 
} from '../types/common.types';

/**
 * Operation callback type
 */
type OperationCallback<T> = () => Promise<T>;

/**
 * Abstract Base Controller
 * Provides common HTTP request handling with standardized error handling
 */
export abstract class BaseController {
  /**
   * Controller name for logging
   */
  protected readonly controllerName: string;

  constructor(controllerName?: string) {
    this.controllerName = controllerName || this.constructor.name;
  }

  /**
   * Handle async request with standard error handling
   * Eliminates repetitive try-catch blocks
   * 
   * @param res - Express response object
   * @param operation - Async operation to execute
   * @param successMessage - Message on success
   * @param statusCode - HTTP status code on success (default: 200)
   * @returns Response
   */
  protected async handleRequest<T>(
    res: Response,
    operation: OperationCallback<T>,
    successMessage: string = 'Thành công',
    statusCode: number = 200
  ): Promise<Response> {
    try {
      const result = await operation();
      return sendResponse(res, statusCode, ApiResponse.success(result, successMessage));
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Handle async request with custom response transformation
   * 
   * @param res - Express response object
   * @param operation - Async operation to execute
   * @param transformer - Transform result before sending
   * @param successMessage - Message on success
   * @param statusCode - HTTP status code on success
   * @returns Response
   */
  protected async handleRequestWithTransform<T, R>(
    res: Response,
    operation: OperationCallback<T>,
    transformer: (data: T) => R,
    successMessage: string = 'Thành công',
    statusCode: number = 200
  ): Promise<Response> {
    try {
      const result = await operation();
      const transformed = transformer(result);
      return sendResponse(res, statusCode, ApiResponse.success(transformed, successMessage));
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Standard error handling
   * Converts errors to appropriate HTTP responses
   * 
   * @param res - Express response object
   * @param error - Error to handle
   * @returns Response
   */
  protected handleError(res: Response, error: unknown): Response {
    // Log error with context
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logError(`[${this.controllerName}] Error:`, errorObj);

    // Handle known AppError (check by duck typing since AppError is from JS)
    const appError = error as { statusCode?: number; message?: string; details?: unknown };
    if (appError && typeof appError.statusCode === 'number' && appError.message) {
      return sendResponse(
        res,
        appError.statusCode,
        ApiResponse.error(appError.message, appError.statusCode, appError.details)
      );
    }

    // Handle unknown errors
    const message = errorObj.message || 'Đã xảy ra lỗi không xác định';
    
    return sendResponse(res, 500, ApiResponse.error(message, 500));
  }

  /**
   * Extract user ID from authenticated request
   * 
   * @param req - Authenticated request
   * @returns User ID or null
   */
  protected getUserId(req: AuthenticatedRequest): string | null {
    return (
      req.user?.sub ||
      req.user?.id ||
      req.user?.userId ||
      req.user?.uid ||
      null
    );
  }

  /**
   * Get user ID or throw UnauthorizedError
   * 
   * @param req - Authenticated request
   * @returns User ID
   * @throws AppError if user not authenticated
   */
  protected requireUserId(req: AuthenticatedRequest): string {
    const userId = this.getUserId(req);
    if (!userId) {
      throw new AppError('Không xác định được người dùng', 401);
    }
    return userId;
  }

  /**
   * Get full user context from request
   * 
   * @param req - Authenticated request
   * @returns User context
   */
  protected getUserContext(req: AuthenticatedRequest): UserContext {
    const userId = this.requireUserId(req);
    return {
      id: userId,
      role: req.user?.role || 'SINH_VIEN',
      permissions: req.user?.permissions || []
    };
  }

  /**
   * Extract pagination parameters from query
   * 
   * @param query - Request query object
   * @returns Pagination parameters with defaults
   */
  protected getPaginationParams(query: Record<string, unknown>): PaginationParams {
    return {
      page: Math.max(1, parseInt(String(query.page), 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 20)),
      sortBy: typeof query.sortBy === 'string' ? query.sortBy : 'createdAt',
      sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc'
    };
  }

  /**
   * Extract filters from query (excluding pagination params)
   * 
   * @param query - Request query object
   * @param excludeKeys - Additional keys to exclude
   * @returns Filter object
   */
  protected getFilters(
    query: Record<string, unknown>,
    excludeKeys: string[] = []
  ): Record<string, unknown> {
    const paginationKeys = ['page', 'limit', 'sortBy', 'sortOrder'];
    const allExcludeKeys = [...paginationKeys, ...excludeKeys];
    
    return Object.entries(query)
      .filter(([key]) => !allExcludeKeys.includes(key))
      .reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);
  }

  /**
   * Send success response helper
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string = 'Thành công',
    statusCode: number = 200
  ): Response {
    return sendResponse(res, statusCode, ApiResponse.success(data, message));
  }

  /**
   * Send error response helper
   */
  protected sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    details?: unknown
  ): Response {
    return sendResponse(res, statusCode, ApiResponse.error(message, statusCode, details));
  }

  /**
   * Send not found response helper
   */
  protected sendNotFound(res: Response, message: string = 'Không tìm thấy'): Response {
    return sendResponse(res, 404, ApiResponse.notFound(message));
  }

  /**
   * Send unauthorized response helper
   */
  protected sendUnauthorized(res: Response, message: string = 'Không có quyền truy cập'): Response {
    return sendResponse(res, 401, ApiResponse.unauthorized(message));
  }
}

// For CommonJS compatibility
module.exports = { BaseController };
