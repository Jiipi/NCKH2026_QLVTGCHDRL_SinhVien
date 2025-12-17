import { useState, useCallback } from 'react';

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  search: string;
  [key: string]: unknown;
}

/**
 * Pagination hook return type
 */
export interface UsePaginationReturn<T = unknown> {
  // State
  pagination: PaginationParams;
  loading: boolean;
  data: T | null;
  error: string | null;
  
  // Actions
  updatePagination: (newParams: Partial<PaginationParams>) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changePageSize: (limit: number) => void;
  updateSearch: (search: string) => void;
  resetPagination: () => void;
  buildQueryParams: () => string;
  
  // Setters
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Custom hook for managing pagination state
 * @param initialParams - Initial pagination parameters
 * @returns Pagination state and handlers
 */
export function usePagination<T = unknown>(initialParams: Partial<PaginationParams> = {}): UsePaginationReturn<T> {
  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialParams.page || 1,
    limit: initialParams.limit || 20,
    search: initialParams.search || '',
    ...initialParams
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update pagination parameters
  const updatePagination = useCallback((newParams: Partial<PaginationParams>) => {
    setPagination(prev => ({
      ...prev,
      ...newParams,
      // Reset to page 1 when changing search or filters
      page: newParams.search !== undefined || newParams.limit !== undefined ? 1 : (newParams.page || prev.page)
    }));
  }, []);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Go to next page
  const nextPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  // Go to previous page
  const prevPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  // Change page size
  const changePageSize = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Update search
  const updateSearch = useCallback((search: string) => {
    setPagination(prev => ({ ...prev, search, page: 1 }));
  }, []);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      limit: initialParams.limit || 20,
      search: '',
      ...initialParams
    });
  }, [initialParams]);

  // Build query parameters for API calls
  const buildQueryParams = useCallback((): string => {
    const params = new URLSearchParams();
    
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return params.toString();
  }, [pagination]);

  return {
    // State
    pagination,
    loading,
    data,
    error,
    
    // Actions
    updatePagination,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    updateSearch,
    resetPagination,
    buildQueryParams,
    
    // Setters
    setLoading,
    setData,
    setError
  };
}

/**
 * Paginated table hook return type
 */
export interface UsePaginatedTableReturn<T = unknown> extends UsePaginationReturn<T> {
  fetchData: (additionalParams?: Record<string, unknown>) => Promise<T>;
  refresh: () => Promise<T>;
  handlePageChange: (page: number) => void;
  handleSearch: (search: string) => void;
  handlePageSizeChange: (limit: number) => void;
}

/**
 * Fetch function type
 */
export type FetchFunction<T> = (queryParams: string, additionalParams?: Record<string, unknown>) => Promise<T>;

/**
 * Hook for managing table data with pagination
 * @param fetchFunction - Function to fetch data
 * @param initialParams - Initial parameters
 * @returns Table state and handlers
 */
export function usePaginatedTable<T = unknown>(
  fetchFunction: FetchFunction<T>,
  initialParams: Partial<PaginationParams> = {}
): UsePaginatedTableReturn<T> {
  const paginationHook = usePagination<T>(initialParams);
  const { setLoading, setData, setError } = paginationHook;

  // Fetch data with current pagination parameters
  const fetchData = useCallback(async (additionalParams: Record<string, unknown> = {}): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = paginationHook.buildQueryParams();
      const response = await fetchFunction(queryParams, additionalParams);
      
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, paginationHook, setLoading, setData, setError]);

  // Refresh current data
  const refresh = useCallback((): Promise<T> => {
    return fetchData();
  }, [fetchData]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    paginationHook.goToPage(page);
    // Auto-fetch new data when page changes
    setTimeout(() => fetchData(), 0);
  }, [paginationHook, fetchData]);

  // Handle search
  const handleSearch = useCallback((search: string) => {
    paginationHook.updateSearch(search);
    // Auto-fetch new data when search changes
    setTimeout(() => fetchData(), 0);
  }, [paginationHook, fetchData]);

  // Handle page size change
  const handlePageSizeChange = useCallback((limit: number) => {
    paginationHook.changePageSize(limit);
    // Auto-fetch new data when page size changes
    setTimeout(() => fetchData(), 0);
  }, [paginationHook, fetchData]);

  return {
    ...paginationHook,
    fetchData,
    refresh,
    handlePageChange,
    handleSearch,
    handlePageSizeChange
  };
}

export default usePagination;
