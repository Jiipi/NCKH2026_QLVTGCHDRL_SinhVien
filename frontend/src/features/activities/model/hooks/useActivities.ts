/**
 * useActivities Hook - TypeScript Version
 * Business Layer - Activities list management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { activityApi } from '../../../../shared/api/repositories';
import type { Activity, GetActivitiesParams, PaginatedResponse } from '../../../../shared/types';

// ============ TYPES ============
export type ActivityMode = 'list' | 'my' | 'class' | 'admin';

export interface ActivityFilters extends GetActivitiesParams {
    page: number;
    limit: number;
}

export interface UseActivitiesOptions {
    mode?: ActivityMode;
    initialFilters?: Partial<ActivityFilters>;
    autoFetch?: boolean;
}

export interface UseActivitiesReturn {
    // Data
    activities: Activity[];
    total: number;
    totalPages: number;
    isEmpty: boolean;

    // Loading/Error state
    loading: boolean;
    error: string | null;

    // Filters
    filters: ActivityFilters;
    updateFilters: (newFilters: Partial<ActivityFilters>) => void;
    resetFilters: () => void;

    // Pagination
    currentPage: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;

    // Actions
    fetchActivities: (customFilters?: Partial<ActivityFilters>) => Promise<void>;
    refresh: () => void;
}

const DEFAULT_FILTERS: ActivityFilters = {
    page: 1,
    limit: 10,
    search: '',
    type: '',
    status: undefined,
    semester: '',
};

/**
 * useActivities - Hook quản lý danh sách hoạt động
 */
export function useActivities(options: UseActivitiesOptions = {}): UseActivitiesReturn {
    const {
        mode = 'list',
        initialFilters = {},
        autoFetch = true,
    } = options;

    // State
    const [activities, setActivities] = useState<Activity[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ActivityFilters>({
        ...DEFAULT_FILTERS,
        ...initialFilters,
    });

    // Derived state
    const totalPages = useMemo(() => {
        return Math.ceil(total / (filters.limit || 10));
    }, [total, filters.limit]);

    const isEmpty = useMemo(() => {
        return !loading && activities.length === 0;
    }, [loading, activities]);

    // Fetch activities - using shared activityApi
    const fetchActivities = useCallback(async (customFilters: Partial<ActivityFilters> = {}): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const params: GetActivitiesParams = { ...filters, ...customFilters };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                const value = params[key as keyof GetActivitiesParams];
                if (value === '' || value === null || value === undefined) {
                    delete params[key as keyof GetActivitiesParams];
                }
            });

            // Use shared activityApi - same API for all modes
            // Backend handles role-based filtering automatically
            const result: PaginatedResponse<Activity> = await activityApi.getActivities(params);

            setActivities(result.items || []);
            setTotal(result.pagination?.total || 0);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách hoạt động';
            setError(errorMessage);
            setActivities([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<ActivityFilters>): void => {
        setFilters((prev: ActivityFilters) => ({
            ...prev,
            ...newFilters,
            // Reset to page 1 if filters change (except page itself)
            page: newFilters.page !== undefined ? newFilters.page : 1,
        }));
    }, []);

    // Reset filters
    const resetFilters = useCallback((): void => {
        setFilters({
            ...DEFAULT_FILTERS,
            ...initialFilters,
        });
    }, [initialFilters]);

    // Pagination helpers
    const goToPage = useCallback((page: number): void => {
        updateFilters({ page });
    }, [updateFilters]);

    const nextPage = useCallback((): void => {
        if (filters.page < totalPages) {
            goToPage(filters.page + 1);
        }
    }, [filters.page, totalPages, goToPage]);

    const prevPage = useCallback((): void => {
        if (filters.page > 1) {
            goToPage(filters.page - 1);
        }
    }, [filters.page, goToPage]);

    // Refresh
    const refresh = useCallback((): void => {
        fetchActivities();
    }, [fetchActivities]);

    // Auto fetch on mount and when filters change
    useEffect(() => {
        if (autoFetch) {
            fetchActivities();
        }
    }, [filters, autoFetch, fetchActivities]);

    return {
        // Data
        activities,
        total,
        totalPages,
        isEmpty,

        // Loading/Error state
        loading,
        error,

        // Filters
        filters,
        updateFilters,
        resetFilters,

        // Pagination
        currentPage: filters.page,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: filters.page < totalPages,
        hasPrevPage: filters.page > 1,

        // Actions
        fetchActivities,
        refresh,
    };
}

export default useActivities;
