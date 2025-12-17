/**
 * useAsyncData - Generic hook for async data fetching
 * Eliminates duplicate loading/error state management across all hooks
 * 
 * @module core/hooks/useAsyncData
 * 
 * @example
 * ```tsx
 * // Simple usage
 * const { data, loading, error, refetch } = useAsyncData(
 *   () => api.getUsers(),
 *   []
 * );
 * 
 * // With dependencies
 * const { data } = useAsyncData(
 *   () => api.getUserById(userId),
 *   [userId]
 * );
 * 
 * // Disable auto-fetch
 * const { data, refetch } = useAsyncData(
 *   () => api.search(query),
 *   [query],
 *   { autoFetch: false }
 * );
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ApiResult, AsyncState } from './types';

export interface UseAsyncDataOptions<T> {
  /** Initial data value */
  initialData?: T | null;
  /** Auto-fetch on mount/deps change (default: true) */
  autoFetch?: boolean;
  /** Keep previous data while loading (default: false) */
  keepPreviousData?: boolean;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

export interface UseAsyncDataReturn<T> extends AsyncState<T> {
  /** Refetch data */
  refetch: () => Promise<void>;
  /** Manually set data */
  setData: (data: T | null) => void;
  /** Clear error */
  clearError: () => void;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * Generic hook for async data fetching with loading/error state
 * 
 * @param fetcher - Async function that fetches data
 * @param deps - Dependencies array (triggers refetch when changed)
 * @param options - Configuration options
 * @returns Async data state and control functions
 */
export function useAsyncData<T>(
  fetcher: () => Promise<ApiResult<T> | T>,
  deps: readonly unknown[] = [],
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    initialData = null,
    autoFetch = true,
    keepPreviousData = false,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null
  });

  // Track mounted state to prevent updates after unmount
  const isMounted = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      ...(keepPreviousData ? {} : { data: prev.data })
    }));

    try {
      const result = await fetcher();
      
      // Ignore if unmounted or stale request
      if (!isMounted.current || fetchId !== fetchIdRef.current) return;

      // Handle ApiResult or raw data
      if (result && typeof result === 'object' && 'success' in result) {
        const apiResult = result as ApiResult<T>;
        if (apiResult.success && apiResult.data !== undefined) {
          setState({ data: apiResult.data, loading: false, error: null });
          onSuccess?.(apiResult.data);
        } else {
          const errorMsg = apiResult.error || 'Đã xảy ra lỗi';
          setState({ data: null, loading: false, error: errorMsg });
          onError?.(errorMsg);
        }
      } else {
        // Raw data response
        setState({ data: result as T, loading: false, error: null });
        onSuccess?.(result as T);
      }
    } catch (err) {
      if (!isMounted.current || fetchId !== fetchIdRef.current) return;
      
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      setState({ data: null, loading: false, error: errorMsg });
      onError?.(errorMsg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    fetchIdRef.current++;
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  // Auto-fetch on mount and deps change
  useEffect(() => {
    isMounted.current = true;
    
    if (autoFetch) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchData, autoFetch]);

  return {
    ...state,
    refetch: fetchData,
    setData,
    clearError,
    reset
  };
}

export default useAsyncData;
