/**
 * Core Types - Shared type definitions for frontend
 * @module core/types
 */

// ==================== API TYPES ====================

/**
 * Standard API response format from backend
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  timestamp?: string;
  errors?: unknown;
}

/**
 * Result type for API operations
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

/**
 * Paginated response from backend
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters (generic)
 */
export interface FilterParams {
  [key: string]: string | number | boolean | undefined | null;
}

// ==================== STATE TYPES ====================

/**
 * Async data state
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * CRUD state with submitting indicator
 */
export interface CrudState<T> extends AsyncState<T[]> {
  submitting: boolean;
  selectedItem: T | null;
}

// ==================== USER TYPES ====================

/**
 * User roles in the system
 */
export type UserRole = 'ADMIN' | 'GIANG_VIEN' | 'LOP_TRUONG' | 'SINH_VIEN' | 'QUAN_LY';

/**
 * User context from auth
 */
export interface UserContext {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  permissions?: string[];
  avatar?: string;
  fullName?: string;
}

// ==================== HELPER TYPES ====================

/**
 * Make some properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make some properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * ID type (string UUID)
 */
export type ID = string;

/**
 * Timestamp type
 */
export type Timestamp = string | Date;

/**
 * Callback function type
 */
export type VoidCallback = () => void;
export type AsyncCallback<T = void> = () => Promise<T>;
