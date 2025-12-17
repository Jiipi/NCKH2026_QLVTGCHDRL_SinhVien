/**
 * Shared Dashboard Hook Utilities
 * Common patterns extracted from feature dashboard hooks
 */

import { useState, useEffect, useCallback } from 'react';

export interface LoadingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface FetchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Generic async data fetching hook
 * Handles loading, error states and provides refresh capability
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<FetchResult<T>>,
  deps: unknown[] = [],
  options: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): LoadingState<T> & { refresh: () => Promise<void> } {
  const { enabled = true, onSuccess, onError } = options;
  const [state, setState] = useState<LoadingState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await fetchFn();

      if (result.success && result.data !== undefined) {
        setState({ data: result.data, loading: false, error: null });
        onSuccess?.(result.data);
      } else {
        const errorMsg = result.error || 'Không thể tải dữ liệu';
        setState({ data: null, loading: false, error: errorMsg });
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Lỗi không xác định';
      setState({ data: null, loading: false, error: errorMsg });
      onError?.(errorMsg);
    }
  }, [fetchFn, enabled, onSuccess, onError]);

  useEffect(() => {
    refresh();
  }, [...deps, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refresh };
}

/**
 * Parallel data fetching hook for multiple API calls
 */
export function useParallelFetch<T extends Record<string, unknown>>(
  fetchFns: { [K in keyof T]: () => Promise<FetchResult<T[K]>> },
  deps: unknown[] = [],
  options: { enabled?: boolean } = {}
): LoadingState<T> & { refresh: () => Promise<void> } {
  const { enabled = true } = options;
  const [state, setState] = useState<LoadingState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const keys = Object.keys(fetchFns) as (keyof T)[];
      const promises = keys.map(key => fetchFns[key]());
      const results = await Promise.all(promises);
      
      const data = {} as T;
      const errors: string[] = [];
      
      results.forEach((result, index) => {
        const key = keys[index];
        if (result.success && result.data !== undefined) {
          data[key] = result.data;
        } else if (result.error) {
          errors.push(result.error);
        }
      });

      if (errors.length > 0 && Object.keys(data).length === 0) {
        setState({ data: null, loading: false, error: errors.join('; ') });
      } else {
        setState({ data, loading: false, error: errors.length > 0 ? errors.join('; ') : null });
      }
    } catch (err: any) {
      setState({ data: null, loading: false, error: err?.message || 'Lỗi không xác định' });
    }
  }, [fetchFns, enabled]);

  useEffect(() => {
    refresh();
  }, [...deps, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refresh };
}

/**
 * Filter state hook with common patterns
 */
export function useFilterState<T extends string>(defaultValue: T) {
  const [filter, setFilter] = useState<T>(defaultValue);
  
  const resetFilter = useCallback(() => {
    setFilter(defaultValue);
  }, [defaultValue]);

  return { filter, setFilter, resetFilter };
}

/**
 * Derived statistics hook - computes stats from raw data
 */
export function useDerivedStats<TData, TStats>(
  data: TData | null,
  computeFn: (data: TData) => TStats,
  defaultStats: TStats
): TStats {
  const [stats, setStats] = useState<TStats>(defaultStats);

  useEffect(() => {
    if (data) {
      try {
        const computed = computeFn(data);
        setStats(computed);
      } catch (err) {
        console.error('[useDerivedStats] Compute error:', err);
        setStats(defaultStats);
      }
    } else {
      setStats(defaultStats);
    }
  }, [data, computeFn, defaultStats]);

  return stats;
}
