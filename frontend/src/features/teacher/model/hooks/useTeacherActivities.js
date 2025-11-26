/**
 * Teacher Activities Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho quản lý hoạt động giáo viên
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { teacherActivitiesApi } from '../../services/teacherActivitiesApi';
import { mapActivityToUI, groupActivitiesByStatus } from '../mappers/teacher.mappers';

/**
 * Hook quản lý hoạt động của giáo viên
 */
export default function useTeacherActivities({ initialSemester, initialLimit = 'all' } = {}) {
  const [semester, setSemester] = useState(initialSemester || '');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [activitiesData, setActivitiesData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business logic: Load activities
  const load = useCallback(async ({ nextPage, nextLimit, nextSemester } = {}) => {
    const p = nextPage || page;
    const l = nextLimit || limit;
    const s = nextSemester !== undefined ? nextSemester : semester;
    
    try {
      setLoading(true);
      setError(null);
      const result = await teacherActivitiesApi.listActivities({ page: p, limit: l, semester: s });
      
      if (result.success) {
        setActivitiesData(result.data.items || []);
        setTotal(result.data.total || 0);
        if (nextPage !== undefined && nextPage !== page) setPage(nextPage);
        if (nextLimit !== undefined && nextLimit !== limit) setLimit(nextLimit);
        if (nextSemester !== undefined && nextSemester !== semester) setSemester(nextSemester);
      } else {
        console.error('[useTeacherActivities] Load error:', result.error);
        setError(result.error || 'Không thể tải danh sách hoạt động');
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
  const approve = useCallback(async (id) => {
    try {
      const result = await teacherActivitiesApi.approveActivity(id);
      if (result.success) {
        await refresh();
      } else {
        setError(result.error || 'Không thể phê duyệt hoạt động');
      }
    } catch (err) {
      console.error('[useTeacherActivities] Approve error:', err);
      setError(err?.message || 'Không thể phê duyệt hoạt động');
    }
  }, [refresh]);

  // Business logic: Handle reject
  const reject = useCallback(async (id, reason) => {
    try {
      const result = await teacherActivitiesApi.rejectActivity(id, reason);
      if (result.success) {
        await refresh();
      } else {
        setError(result.error || 'Không thể từ chối hoạt động');
      }
    } catch (err) {
      console.error('[useTeacherActivities] Reject error:', err);
      setError(err?.message || 'Không thể từ chối hoạt động');
    }
  }, [refresh]);

  // Business logic: Fetch activity detail
  const fetchDetail = useCallback(async (id) => {
    try {
      const result = await teacherActivitiesApi.getActivity(id);
      if (result.success) {
        return mapActivityToUI(result.data);
      } else {
        console.error('[useTeacherActivities] Fetch detail error:', result.error);
        return null;
      }
    } catch (err) {
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

