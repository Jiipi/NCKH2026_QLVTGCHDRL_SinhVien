/**
 * Common Types - Shared type definitions across the application
 * @module core/types/common
 */

/**
 * User context extracted from JWT token
 */
export interface UserContext {
  /** User ID (sub claim from JWT) */
  id: string;
  /** User role */
  role: UserRole;
  /** User permissions list */
  permissions?: string[];
  /** Username */
  username?: string;
  /** Email */
  email?: string;
}

/**
 * Available user roles in the system
 */
export type UserRole = 
  | 'ADMIN' 
  | 'GIANG_VIEN' 
  | 'LOP_TRUONG' 
  | 'SINH_VIEN'
  | 'QUAN_LY';

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Data items */
  items: T[];
  /** Total number of items */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Total pages */
  totalPages: number;
  /** Has next page */
  hasNext: boolean;
  /** Has previous page */
  hasPrev: boolean;
}

/**
 * Standard API response format
 */
export interface ApiResponseFormat<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
  errors?: unknown;
}

/**
 * Filter options for queries
 */
export interface FilterOptions {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Sort options for queries
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * ID type (string UUID)
 */
export type ID = string;

/**
 * Timestamp type
 */
export type Timestamp = Date;

/**
 * Generic callback function type
 */
export type Callback<T = void> = () => T | Promise<T>;

/**
 * Express Request with user context
 */
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
    id?: string;
    userId?: string;
    uid?: string;
    role?: UserRole;
    permissions?: string[];
  };
}

/**
 * Helper to extract user ID from request
 */
export function extractUserId(req: AuthenticatedRequest): string | null {
  return (
    req.user?.sub ||
    req.user?.id ||
    req.user?.userId ||
    req.user?.uid ||
    null
  );
}

/**
 * Helper to create pagination params with defaults
 */
export function createPaginationParams(
  query: { page?: string | number; limit?: string | number; sortBy?: string; sortOrder?: string }
): PaginationParams {
  return {
    page: Math.max(1, parseInt(String(query.page), 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 20)),
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc'
  };
}

/**
 * Helper to create paginated result
 */
export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// For CommonJS compatibility
module.exports = {
  extractUserId,
  createPaginationParams,
  createPaginatedResult
};
