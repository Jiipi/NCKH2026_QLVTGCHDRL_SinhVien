/**
 * Teacher Approvals Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho phê duyệt hoạt động giáo viên
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { teacherApprovalApi } from '../../services/teacherApprovalApi';
import { mapActivityToUI, groupActivitiesByStatus } from '../mappers/teacher.mappers';
import { useDataChangeListener, useAutoRefresh } from '../../../../shared/lib/dataRefresh';

/**
 * Hook quản lý phê duyệt hoạt động (pending & history)
 */
export default function useTeacherApprovals({ initialSemester }) {
  const [semester, setSemester] = useState(initialSemester || '');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // cho history hoặc filter trong pending
  const [activitiesData, setActivitiesData] = useState([]);
  const [statsData, setStatsData] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business logic: Load approvals
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'pending') {
        const result = await teacherApprovalApi.getPending({ semester, search });
        if (result.success) {
          setActivitiesData(result.data.items || []);
          setStatsData(result.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
        } else {
          console.error('[useTeacherApprovals] Load pending error:', result.error);
          setError(result.error || 'Không thể tải danh sách hoạt động');
          setActivitiesData([]);
        }
      } else {
        const result = await teacherApprovalApi.getHistory({ semester, search, status: statusFilter });
        if (result.success) {
          setActivitiesData(result.data || []);
        } else {
          console.error('[useTeacherApprovals] Load history error:', result.error);
          setError(result.error || 'Không thể tải lịch sử phê duyệt');
          setActivitiesData([]);
        }
      }
    } catch (err) {
      console.error('[useTeacherApprovals] Load error:', err);
      setError(err?.message || 'Không thể tải danh sách hoạt động');
      setActivitiesData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, semester, search, statusFilter]);

  const refresh = useCallback(() => load(), [load]);

  // Auto-reload when approvals data changes from other components (same tab)
  useEffect(() => {
    load();
  }, [load]);

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

  // Business logic: Extract stats
  const stats = useMemo(() => statsData, [statsData]);

  // Business logic: Handle approve
  const approveActivity = useCallback(async (id) => {
    try {
      const result = await teacherApprovalApi.approve(id);
      if (result.success) {
        // API already emits event for other components, just refresh locally
        await refresh();
      } else {
        setError(result.error || 'Không thể phê duyệt hoạt động');
      }
    } catch (err) {
      console.error('[useTeacherApprovals] Approve error:', err);
      setError(err?.message || 'Không thể phê duyệt hoạt động');
    }
  }, [refresh]);

  // Business logic: Handle reject
  const rejectActivity = useCallback(async (id, reason) => {
    try {
      const result = await teacherApprovalApi.reject(id, reason);
      if (result.success) {
        // API already emits event for other components, just refresh locally
        await refresh();
      } else {
        setError(result.error || 'Không thể từ chối hoạt động');
      }
    } catch (err) {
      console.error('[useTeacherApprovals] Reject error:', err);
      setError(err?.message || 'Không thể từ chối hoạt động');
    }
  }, [refresh]);

  return {
    // State
    semester,
    setSemester,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    
    // Data
    activities,
    activitiesByStatus,
    stats,
    
    // State
    loading,
    error,
    
    // Actions
    load,
    refresh,
    approveActivity,
    rejectActivity
  };
}

