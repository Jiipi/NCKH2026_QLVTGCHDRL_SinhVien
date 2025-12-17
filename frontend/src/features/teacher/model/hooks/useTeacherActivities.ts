/**
 * Teacher Activities Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho quản lý hoạt động giáo viên
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { teacherActivitiesApi } from '../../services/teacherActivitiesApi';
import { mapActivityToUI, groupActivitiesByStatus } from '../mappers/teacher.mappers';
import { useDataChangeListener, useAutoRefresh } from '../../../../shared/lib/dataRefresh';
import type { ApiResponse } from '../../types';

/** Hook options */
interface UseTeacherActivitiesOptions {
  initialSemester?: string;
  initialLimit?: string | number;
}

/** Load params */
interface LoadParams {
  nextPage?: number;
  nextLimit?: string | number;
  nextSemester?: string;
}

/**
 * Get initial semester from session storage
 */
function getInitialSemester() {
  try {
    const backendCurrent = sessionStorage.getItem('backend_current_semester');
    if (backendCurrent) return backendCurrent;
    
    const selected = sessionStorage.getItem('selected_semester');
    if (selected) return selected;
    
    const current = sessionStorage.getItem('current_semester');
    if (current) return current;
  } catch (_) {}
  return '';
}

/**
 * Hook quản lý hoạt động của giáo viên
 */
export default function useTeacherActivities({ initialSemester, initialLimit = 'all' }: UseTeacherActivitiesOptions = {}) {
  const [semester, setSemester] = useState(() => initialSemester || getInitialSemester());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [activitiesData, setActivitiesData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business logic: Load activities
  const load = useCallback(async ({ nextPage, nextLimit, nextSemester }: LoadParams = {}) => {
    const p = nextPage || page;
    const l = nextLimit || limit;
    const s = nextSemester !== undefined ? nextSemester : semester;
    
    try {
      setLoading(true);
      setError(null);
      const result = await teacherActivitiesApi.listActivities({ page: p, limit: l, semester: s });
      
      if (result.success && 'data' in result) {
        setActivitiesData(result.data.items || []);
        setTotal(result.data.total || 0);
        if (nextPage !== undefined && nextPage !== page) setPage(nextPage);
        if (nextLimit !== undefined && nextLimit !== limit) setLimit(nextLimit);
        if (nextSemester !== undefined && nextSemester !== semester) setSemester(nextSemester);
      } else {
        const errorMsg = 'error' in result ? result.error : 'Không thể tải danh sách hoạt động';
        console.error('[useTeacherActivities] Load error:', errorMsg);
        setError(errorMsg);
        setActivitiesData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('[useTeacherActivities] Load error:', err);
      setError(err?.message || 'Không thể tải danh sách hoạt động');
      setActivitiesData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, semester]);

  const refresh = useCallback(() => load({ nextPage: page, nextLimit: limit, nextSemester: semester }), [load, page, limit, semester]);

  useEffect(() => {
    load({ nextPage: page, nextLimit: limit, nextSemester: semester });
  }, [page, limit, semester, load]);

  // Auto-reload when activities data changes from other components (same tab)
  useDataChangeListener(['ACTIVITIES', 'APPROVALS', 'REGISTRATIONS'], refresh, { debounceMs: 500 });

  // Auto-refresh for cross-user sync
  useAutoRefresh(refresh, { 
    intervalMs: 30000, 
    enabled: !!semester,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  // Business logic: Transform activities
  const activities = useMemo(() => {
    if (!activitiesData || activitiesData.length === 0) {
      return [];
    }
    return activitiesData.map(mapActivityToUI);
  }, [activitiesData]);

  // Business logic: Group activities by status
  const activitiesByStatus = useMemo(() => {
    return groupActivitiesByStatus(activities);
  }, [activities]);

  // Business logic: Handle approve
  const approve = useCallback(async (id: string) => {
    try {
      const result = await teacherActivitiesApi.approveActivity(id);
      if (result.success) {
        // API already emits event for other components, just refresh locally
        await refresh();
      } else {
        const errorMsg = 'error' in result ? result.error : 'Không thể phê duyệt hoạt động';
        setError(errorMsg);
      }
    } catch (err: unknown) {
      console.error('[useTeacherActivities] Approve error:', err);
      setError((err as Error)?.message || 'Không thể phê duyệt hoạt động');
    }
  }, [refresh]);

  // Business logic: Handle reject
  const reject = useCallback(async (id: string, reason: string) => {
    try {
      const result = await teacherActivitiesApi.rejectActivity(id, reason);
      if (result.success) {
        // API already emits event for other components, just refresh locally
        await refresh();
      } else {
        const errorMsg = 'error' in result ? result.error : 'Không thể từ chối hoạt động';
        setError(errorMsg);
      }
    } catch (err: unknown) {
      console.error('[useTeacherActivities] Reject error:', err);
      setError((err as Error)?.message || 'Không thể từ chối hoạt động');
    }
  }, [refresh]);

  // Business logic: Fetch activity detail
  const fetchDetail = useCallback(async (id: string) => {
    try {
      const result = await teacherActivitiesApi.getActivity(id);
      if (result.success && 'data' in result) {
        return mapActivityToUI(result.data);
      } else {
        const errorMsg = 'error' in result ? result.error : 'Không thể tải chi tiết hoạt động';
        console.error('[useTeacherActivities] Fetch detail error:', errorMsg);
        return null;
      }
    } catch (err: unknown) {
      console.error('[useTeacherActivities] Fetch detail error:', err);
      return null;
    }
  }, []);

  return {
    // Data
    activities,
    activitiesByStatus,
    total,
    semester,
    
    // State
    page,
    limit,
    loading,
    error,
    
    // Setters
    setSemester,
    setPage,
    setLimit,
    
    // Actions
    load,
    refresh,
    approve,
    reject,
    fetchDetail
  };
}

