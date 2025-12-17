/**
 * Pagination utility functions for admin endpoints
 * @module core/utils/pagination
 */

import { PaginationParams } from '../types';

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Pagination response interface
 */
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

/**
 * Pagination options for validation
 */
export interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
  minLimit?: number;
}

/**
 * Validated pagination parameters with offset
 */
export interface ValidatedPaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Database query options
 */
export interface QueryOptions {
  skip: number;
  take: number;
  orderBy: Record<string, 'asc' | 'desc'>;
}

/**
 * Create standardized pagination response
 */
export function createPaginationResponse({
  page,
  limit,
  total,
  maxLimit = 100
}: {
  page: number | string;
  limit: number | string;
  total: number;
  maxLimit?: number;
}): PaginationResponse {
  const actualLimit = Math.min(parseInt(String(limit)), maxLimit);
  const currentPage = parseInt(String(page));
  const totalPages = Math.ceil(total / actualLimit);

  return {
    page: currentPage,
    limit: actualLimit,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null
  };
}

/**
 * Validate and sanitize pagination parameters
 */
export function validatePaginationParams(
  query: { page?: string | number; limit?: string | number },
  options: PaginationOptions = {}
): ValidatedPaginationParams {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    maxLimit = 100,
    minLimit = 1
  } = options;

  const page = Math.max(parseInt(String(query.page)) || defaultPage, 1);
  const limit = Math.min(
    Math.max(parseInt(String(query.limit)) || defaultLimit, minLimit),
    maxLimit
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

/**
 * Create paginated database query options
 */
export function createQueryOptions(
  paginationParams: ValidatedPaginationParams,
  orderBy: Record<string, 'asc' | 'desc'> = { ngay_tao: 'desc' }
): QueryOptions {
  return {
    skip: paginationParams.offset,
    take: paginationParams.limit,
    orderBy
  };
}

/**
 * Create a paginated result from items and total count
 */
export function createPaginatedResult<T>(
  items: T[],
  total: number,
  params: { page: number; limit: number }
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    items,
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1
  };
}

// CommonJS compatibility
module.exports = {
  createPaginationResponse,
  validatePaginationParams,
  createQueryOptions,
  createPaginatedResult
};
