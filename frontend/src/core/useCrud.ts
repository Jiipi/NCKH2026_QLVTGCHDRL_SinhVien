/**
 * useCrud - Generic hook for CRUD operations
 * Eliminates duplicate CRUD state management across all features
 * 
 * @module core/hooks/useCrud
 * 
 * @example
 * ```tsx
 * const api = {
 *   list: () => axios.get('/users'),
 *   getById: (id) => axios.get(`/users/${id}`),
 *   create: (data) => axios.post('/users', data),
 *   update: (id, data) => axios.put(`/users/${id}`, data),
 *   delete: (id) => axios.delete(`/users/${id}`)
 * };
 * 
 * const {
 *   items,
 *   loading,
 *   submitting,
 *   error,
 *   create,
 *   update,
 *   remove,
 *   refetch
 * } = useCrud(api);
 * ```
 */

import { useState, useCallback } from 'react';
import { useAsyncData } from './useAsyncData';
import type { ApiResult, PaginatedResponse, PaginationParams } from './types';

/**
 * API interface for CRUD operations
 */
export interface CrudApi<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  /** List items (with optional pagination) */
  list: (params?: PaginationParams) => Promise<ApiResult<PaginatedResponse<T>> | PaginatedResponse<T>>;
  /** Get single item by ID */
  getById?: (id: string) => Promise<ApiResult<T> | T>;
  /** Create new item */
  create?: (data: CreateDto) => Promise<ApiResult<T> | T>;
  /** Update existing item */
  update?: (id: string, data: UpdateDto) => Promise<ApiResult<T> | T>;
  /** Delete item */
  delete?: (id: string) => Promise<ApiResult<void> | void>;
}

export interface UseCrudOptions {
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Initial pagination params */
  initialPagination?: PaginationParams;
  /** Callback on success */
  onSuccess?: (message: string) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

export interface UseCrudReturn<T, CreateDto, UpdateDto> {
  // Data
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  
  // States
  loading: boolean;
  submitting: boolean;
  error: string | null;
  
  // Pagination
  pagination: PaginationParams;
  setPagination: (params: PaginationParams) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // CRUD Actions
  refetch: () => Promise<void>;
  create: (data: CreateDto) => Promise<ApiResult<T>>;
  update: (id: string, data: UpdateDto) => Promise<ApiResult<T>>;
  remove: (id: string) => Promise<ApiResult<void>>;
  
  // Selection
  selectedItem: T | null;
  selectItem: (item: T | null) => void;
}

/**
 * Generic hook for CRUD operations with pagination
 */
export function useCrud<T, CreateDto = Partial<T>, UpdateDto = Partial<T>>(
  api: CrudApi<T, CreateDto, UpdateDto>,
  options: UseCrudOptions = {}
): UseCrudReturn<T, CreateDto, UpdateDto> {
  const {
    autoFetch = true,
    initialPagination = { page: 1, limit: 20 },
    onSuccess,
    onError
  } = options;

  // Pagination state
  const [pagination, setPaginationState] = useState<PaginationParams>(initialPagination);
  
  // Submitting state for create/update/delete
  const [submitting, setSubmitting] = useState(false);
  
  // Selected item for editing
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // Fetch list data
  const { data, loading, error, refetch, setData } = useAsyncData<PaginatedResponse<T>>(
    () => api.list(pagination),
    [pagination.page, pagination.limit, pagination.sortBy, pagination.sortOrder],
    { autoFetch }
  );

  // Pagination helpers
  const setPagination = useCallback((params: PaginationParams) => {
    setPaginationState(prev => ({ ...prev, ...params }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (data && data.page < data.totalPages) {
      goToPage(data.page + 1);
    }
  }, [data, goToPage]);

  const prevPage = useCallback(() => {
    if (data && data.page > 1) {
      goToPage(data.page - 1);
    }
  }, [data, goToPage]);

  // Create item
  const create = useCallback(async (createData: CreateDto): Promise<ApiResult<T>> => {
    if (!api.create) {
      return { success: false, error: 'Create not supported' };
    }

    setSubmitting(true);
    try {
      const result = await api.create(createData);
      
      // Handle ApiResult or raw data
      if (result && typeof result === 'object' && 'success' in result) {
        const apiResult = result as ApiResult<T>;
        if (apiResult.success) {
          onSuccess?.('Tạo thành công');
          refetch();
        } else {
          onError?.(apiResult.error || 'Tạo thất bại');
        }
        return apiResult;
      } else {
        onSuccess?.('Tạo thành công');
        refetch();
        return { success: true, data: result as T };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSubmitting(false);
    }
  }, [api, onSuccess, onError, refetch]);

  // Update item
  const update = useCallback(async (id: string, updateData: UpdateDto): Promise<ApiResult<T>> => {
    if (!api.update) {
      return { success: false, error: 'Update not supported' };
    }

    setSubmitting(true);
    try {
      const result = await api.update(id, updateData);
      
      if (result && typeof result === 'object' && 'success' in result) {
        const apiResult = result as ApiResult<T>;
        if (apiResult.success) {
          onSuccess?.('Cập nhật thành công');
          refetch();
        } else {
          onError?.(apiResult.error || 'Cập nhật thất bại');
        }
        return apiResult;
      } else {
        onSuccess?.('Cập nhật thành công');
        refetch();
        return { success: true, data: result as T };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSubmitting(false);
    }
  }, [api, onSuccess, onError, refetch]);

  // Delete item
  const remove = useCallback(async (id: string): Promise<ApiResult<void>> => {
    if (!api.delete) {
      return { success: false, error: 'Delete not supported' };
    }

    setSubmitting(true);
    try {
      const result = await api.delete(id);
      
      if (result && typeof result === 'object' && 'success' in result) {
        const apiResult = result as ApiResult<void>;
        if (apiResult.success) {
          onSuccess?.('Xóa thành công');
          refetch();
        } else {
          onError?.(apiResult.error || 'Xóa thất bại');
        }
        return apiResult;
      } else {
        onSuccess?.('Xóa thành công');
        refetch();
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSubmitting(false);
    }
  }, [api, onSuccess, onError, refetch]);

  return {
    // Data
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || pagination.page || 1,
    limit: data?.limit || pagination.limit || 20,
    totalPages: data?.totalPages || 0,
    hasNext: data?.hasNext || false,
    hasPrev: data?.hasPrev || false,
    
    // States
    loading,
    submitting,
    error,
    
    // Pagination
    pagination,
    setPagination,
    goToPage,
    nextPage,
    prevPage,
    
    // CRUD Actions
    refetch,
    create,
    update,
    remove,
    
    // Selection
    selectedItem,
    selectItem: setSelectedItem
  };
}

export default useCrud;
