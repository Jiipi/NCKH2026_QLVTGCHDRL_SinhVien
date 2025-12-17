/**
 * BaseApi - Generic API class for standard CRUD operations
 * Eliminates duplicate API service code across all features
 * 
 * @module core/api/BaseApi
 * 
 * @example
 * ```typescript
 * // Define your entity
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 * 
 * // Create API instance
 * const userApi = new BaseApi<User>({
 *   baseUrl: '/users'
 * });
 * 
 * // Use it
 * const users = await userApi.list({ page: 1, limit: 20 });
 * const user = await userApi.getById('user-123');
 * const newUser = await userApi.create({ name: 'John', email: 'john@example.com' });
 * await userApi.update('user-123', { name: 'John Doe' });
 * await userApi.delete('user-123');
 * ```
 */

import http from '../shared/api/http';
import type { ApiResult, PaginatedResponse, PaginationParams } from './types';

/**
 * Configuration for BaseApi
 */
export interface BaseApiConfig {
  /** Base URL for all endpoints (e.g., '/users') */
  baseUrl: string;
  /** Custom endpoint paths (optional) */
  endpoints?: {
    list?: string;
    detail?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
}

/**
 * Extract data from axios response
 */
function extractData<T>(response: any): T {
  // Handle nested response structure
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  if (response?.data !== undefined) {
    return response.data;
  }
  return response;
}

/**
 * Convert error to ApiResult
 */
function handleError<T>(error: unknown): ApiResult<T> {
  if (error && typeof error === 'object') {
    const axiosError = error as any;
    const message = axiosError.response?.data?.message 
      || axiosError.message 
      || 'Đã xảy ra lỗi';
    const code = axiosError.response?.status || 500;
    return { success: false, error: message, code };
  }
  return { success: false, error: 'Đã xảy ra lỗi không xác định' };
}

/**
 * Generic Base API class for CRUD operations
 */
export class BaseApi<
  Entity,
  CreateDto = Partial<Entity>,
  UpdateDto = Partial<Entity>
> {
  protected readonly baseUrl: string;
  protected readonly endpoints: Required<NonNullable<BaseApiConfig['endpoints']>>;

  constructor(config: BaseApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.endpoints = {
      list: config.endpoints?.list || this.baseUrl,
      detail: config.endpoints?.detail || `${this.baseUrl}/:id`,
      create: config.endpoints?.create || this.baseUrl,
      update: config.endpoints?.update || `${this.baseUrl}/:id`,
      delete: config.endpoints?.delete || `${this.baseUrl}/:id`
    };
  }

  /**
   * Build URL with ID replacement
   */
  protected buildUrl(endpoint: string, id?: string): string {
    if (id) {
      return endpoint.replace(':id', id);
    }
    return endpoint;
  }

  /**
   * List items with pagination
   */
  async list(params?: PaginationParams): Promise<ApiResult<PaginatedResponse<Entity>>> {
    try {
      const response = await http.get(this.endpoints.list, { params });
      const data = extractData<PaginatedResponse<Entity>>(response);
      return { success: true, data };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get all items without pagination
   */
  async getAll(params?: Record<string, unknown>): Promise<ApiResult<Entity[]>> {
    try {
      const response = await http.get(this.endpoints.list, { params });
      const data = extractData<Entity[]>(response);
      return { success: true, data };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get single item by ID
   */
  async getById(id: string): Promise<ApiResult<Entity>> {
    try {
      const response = await http.get(this.buildUrl(this.endpoints.detail, id));
      const data = extractData<Entity>(response);
      return { success: true, data };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Create new item
   */
  async create(data: CreateDto): Promise<ApiResult<Entity>> {
    try {
      const response = await http.post(this.endpoints.create, data);
      const result = extractData<Entity>(response);
      return { success: true, data: result };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Update existing item
   */
  async update(id: string, data: UpdateDto): Promise<ApiResult<Entity>> {
    try {
      const response = await http.put(this.buildUrl(this.endpoints.update, id), data);
      const result = extractData<Entity>(response);
      return { success: true, data: result };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Partially update item (PATCH)
   */
  async patch(id: string, data: Partial<UpdateDto>): Promise<ApiResult<Entity>> {
    try {
      const response = await http.patch(this.buildUrl(this.endpoints.update, id), data);
      const result = extractData<Entity>(response);
      return { success: true, data: result };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Delete item
   */
  async delete(id: string): Promise<ApiResult<void>> {
    try {
      await http.delete(this.buildUrl(this.endpoints.delete, id));
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Custom GET request
   */
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    try {
      const response = await http.get(`${this.baseUrl}${endpoint}`, { params });
      const data = extractData<T>(response);
      return { success: true, data };
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Custom POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResult<T>> {
    try {
      const response = await http.post(`${this.baseUrl}${endpoint}`, data);
      const result = extractData<T>(response);
      return { success: true, data: result };
    } catch (error) {
      return handleError(error);
    }
  }
}

export default BaseApi;
