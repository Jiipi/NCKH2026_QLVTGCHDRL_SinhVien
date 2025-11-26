/**
 * Teacher Activities Page Hook
 * Gom tất cả logic cho TeacherActivitiesPage theo pattern monitor
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import useTeacherActivities from './useTeacherActivities';
import { activityTypesApi } from '../../../activity-types/services/activityTypesApi';

const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_huy: 'Đã hủy',
  ket_thuc: 'Kết thúc'
};

const STATUS_COLORS = {
  cho_duyet: 'bg-amber-50 text-amber-700 border-amber-200',
  da_duyet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  tu_choi: 'bg-rose-50 text-rose-700 border-rose-200',
  da_huy: 'bg-gray-50 text-gray-700 border-gray-200',
  ket_thuc: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

export default function useTeacherActivitiesPage() {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState('activities');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Empty = show da_duyet and ket_thuc
  const [statusViewMode, setStatusViewMode] = useState('pills'); // 'pills' | 'dropdown' | 'compact'
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    from: '',
    to: '',
    minPoints: '',
    maxPoints: ''
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [activityTypes, setActivityTypes] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    activities,
    activitiesByStatus,
    loading,
    error,
    semester,
    setSemester,
    approve,
    reject,
    fetchDetail
  } = useTeacherActivities({ initialLimit: 'all' });

  const {
    options: semesterOptions,
    isWritable
  } = useSemesterData(semester);

  useEffect(() => {
    if (!semester && semesterOptions.length) {
      setSemester(semesterOptions[0].value);
    }
  }, [semester, semesterOptions, setSemester]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const types = await activityTypesApi.list();
        if (mounted) setActivityTypes(types);
      } catch (err) {
        console.error('[useTeacherActivitiesPage] load activity types failed', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, filters, sortBy, viewMode, semester]);

  const filteredActivities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    return activities
      .filter((activity) => {
        const matchesSearch =
          !term ||
          activity.ten_hd?.toLowerCase().includes(term) ||
          activity.mo_ta?.toLowerCase().includes(term) ||
          activity.dia_diem?.toLowerCase().includes(term);

        // Status filter: empty = show da_duyet and ket_thuc (default behavior from original)
        const matchesStatus = statusFilter
          ? activity.trang_thai === statusFilter
          : (activity.trang_thai === 'da_duyet' || activity.trang_thai === 'ket_thuc');

        const matchesType = !filters.type || String(activity.loai_hd_id) === String(filters.type);
        const matchesLocation = !filters.location || activity.dia_diem?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesFrom = !fromDate || (activity.ngay_bd && new Date(activity.ngay_bd) >= fromDate);
        const matchesTo = !toDate || (activity.ngay_bd && new Date(activity.ngay_bd) <= toDate);
        const matchesMinPoints = !filters.minPoints || Number(activity.diem_rl || 0) >= Number(filters.minPoints);
        const matchesMaxPoints = !filters.maxPoints || Number(activity.diem_rl || 0) <= Number(filters.maxPoints);

        return matchesSearch && matchesStatus && matchesType && matchesLocation && matchesFrom && matchesTo && matchesMinPoints && matchesMaxPoints;
      })
      .sort((a, b) => {
        const parseDate = (value) => new Date(value || a.ngay_cap_nhat || 0).getTime();
        switch (sortBy) {
          case 'oldest':
            const ta_old = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
            const tb_old = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
            return ta_old - tb_old;
          case 'name-az':
            return (a.ten_hd || '').localeCompare(b.ten_hd || '', 'vi');
          case 'name-za':
            return (b.ten_hd || '').localeCompare(a.ten_hd || '', 'vi');
          case 'points-high':
            return (b.diem_rl || 0) - (a.diem_rl || 0);
          case 'points-low':
            return (a.diem_rl || 0) - (b.diem_rl || 0);
          case 'newest':
          default:
            const ta = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
            const tb = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
            return tb - ta;
        }
      });
  }, [activities, searchTerm, statusFilter, filters, sortBy]);

  // Client-side pagination
  const effectiveTotal = filteredActivities.length;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  const pageItems = filteredActivities.slice(startIdx, endIdx);

  // Bỏ giới hạn hiển thị: luôn hiển thị toàn bộ hoạt động trên một trang
  useEffect(() => {
    if (!filteredActivities.length) {
      setPage(1);
      setLimit(0);
      return;
    }
    setLimit(prevLimit => (prevLimit === filteredActivities.length ? prevLimit : filteredActivities.length));
    setPage(1);
  }, [filteredActivities.length]);

  const heroStats = useMemo(() => {
    // ✅ TỔNG HOẠT ĐỘNG = approved + completed (thống nhất với admin/SV/LT)
    // Note: activitiesByStatus uses mapped keys: pending, approved, rejected, ongoing, completed
    const approvedCount = activitiesByStatus.approved?.length || 0;
    const completedCount = activitiesByStatus.completed?.length || 0;
    const totalApprovedActivities = approvedCount + completedCount;
    
    return {
      total: totalApprovedActivities,
      pending: activitiesByStatus.pending?.length || 0,
      approved: approvedCount,
      rejected: activitiesByStatus.rejected?.length || 0,
      types: activityTypes.length
    };
  }, [activitiesByStatus, activityTypes.length]);

  const fetchActivityDetails = useCallback(async (activityId) => {
    try {
      const result = await fetchDetail(activityId);
      if (result) {
        setSelectedActivity(result);
        setShowDetailModal(true);
      } else {
        // Fallback: use data from list
        const activity = activities.find(a => a.id === activityId);
        if (activity) {
          setSelectedActivity(activity);
          setShowDetailModal(true);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết hoạt động:', error);
      // Fallback: use data from list
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        setSelectedActivity(activity);
        setShowDetailModal(true);
      }
    }
  }, [fetchDetail, activities]);

  const handleApprove = useCallback(async (id) => {
    const confirmed = await confirm({
      title: 'Phê duyệt hoạt động',
      message: 'Bạn chắc chắn muốn phê duyệt hoạt động này?',
      confirmText: 'Phê duyệt',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;
    try {
      await approve(id);
      showSuccess('Phê duyệt hoạt động thành công');
    } catch (err) {
      console.error(err);
      showError('Không thể phê duyệt hoạt động');
    }
  }, [approve, confirm, showError, showSuccess]);

  const handleReject = useCallback(async (id) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason || !reason.trim()) {
      showWarning('Vui lòng nhập lý do từ chối');
      return;
    }
    const confirmed = await confirm({
      title: 'Xác nhận từ chối',
      message: `Từ chối hoạt động?\n\nLý do: ${reason}`,
      confirmText: 'Từ chối',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;
    try {
      await reject(id, reason.trim());
      showSuccess('Từ chối hoạt động thành công!');
    } catch (err) {
      console.error('Lỗi khi từ chối hoạt động:', err);
      showError(err.response?.data?.message || err.message || 'Không thể từ chối');
    }
  }, [reject, confirm, showError, showSuccess, showWarning]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.location) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (filters.minPoints) count++;
    if (filters.maxPoints) count++;
    return count;
  }, [filters]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      type: '',
      location: '',
      from: '',
      to: '',
      minPoints: '',
      maxPoints: ''
    });
  }, []);

  const getTypeColor = useCallback((activity) => {
    return activity?.loai_hd?.mau_sac || '#6366f1'; // Indigo fallback
  }, []);

  return {
    // Data
    activities: pageItems,
    filteredActivities,
    allActivities: activities, // Raw activities for stats
    loading,
    error,
    semester,
    semesterOptions,
    isWritable,
    activityTypes,
    selectedActivity,
    showDetailModal,
    
    // UI State
    activeTab,
    viewMode,
    searchTerm,
    statusFilter,
    statusViewMode,
    sortBy,
    showFilters,
    filters,
    page,
    limit,
    effectiveTotal,
    heroStats,
    
    // Setters
    setActiveTab,
    setViewMode,
    setSearchTerm,
    setStatusFilter,
    setStatusViewMode,
    setSortBy,
    setShowFilters,
    setFilters,
    setPage,
    setLimit,
    setSemester,
    setSelectedActivity,
    setShowDetailModal,
    
    // Actions
    fetchActivityDetails,
    handleApprove,
    handleReject,
    getActiveFilterCount,
    clearAllFilters,
    getTypeColor,
    
    // Constants
    STATUS_LABELS,
    STATUS_COLORS
  };
}

