/**
 * Core Module Index
 * Export all core utilities for use across the application
 * 
 * @module core
 * 
 * @example
 * ```typescript
 * import { useAsyncData, useCrud, BaseApi } from '@/core';
 * import type { ApiResult, PaginatedResponse } from '@/core';
 * ```
 */

// Hooks
export { useAsyncData } from './useAsyncData';
export type { UseAsyncDataOptions, UseAsyncDataReturn } from './useAsyncData';

export { useCrud } from './useCrud';
export type { CrudApi, UseCrudOptions, UseCrudReturn } from './useCrud';

// API
export { BaseApi } from './BaseApi';
export type { BaseApiConfig } from './BaseApi';

// Types
export type {
  // API Types
  ApiResponse,
  ApiResult,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  
  // State Types
  AsyncState,
  CrudState,
  
  // User Types
  UserRole,
  UserContext,
  
  // Helper Types
  ID,
  Timestamp,
  PartialBy,
  RequiredBy,
  VoidCallback,
  AsyncCallback
} from './types';
