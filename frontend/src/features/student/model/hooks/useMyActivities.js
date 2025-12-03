/**
 * My Activities Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho danh sách hoạt động của sinh viên
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { studentActivitiesApi } from '../../services/studentActivitiesApi';
import { groupActivitiesByStatus } from '../mappers/student.mappers';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import sessionStorageManager from '../../../../shared/api/sessionStorageManager';
import { normalizeRole } from '../../../../shared/lib/role';
import activitiesApi from '../../../activities/services/activitiesApi';
import { useDataChangeListener, useAutoRefresh } from '../../../../shared/lib/dataRefresh';

/**
 * Hook quản lý danh sách hoạt động của sinh viên
 */
export default function useMyActivities() {
  const { showSuccess, showError, confirm } = useNotification();
  
  // UI State
  const [tab, setTab] = useState('joined');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrActivityId, setQrActivityId] = useState(null);
  const [qrActivityName, setQrActivityName] = useState('');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [statusViewMode, setStatusViewMode] = useState('pills');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Data State
  const [data, setData] = useState({ pending: [], approved: [], joined: [], rejected: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityTypes, setActivityTypes] = useState([]);

  // Semester
  const [semester, setSemester] = useState(() => {
    try {
      return sessionStorage.getItem('current_semester') || '';
    } catch {
      return '';
    }
  });
  
  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);

  // Business logic: Check permissions
  const normalizedRole = useMemo(() => {
    const r = sessionStorageManager.getRole() || '';
    return String(normalizeRole(r) || r).toUpperCase();
  }, []);
  
  const canShowQR = useMemo(() => {
    return normalizedRole === 'SINH_VIEN' || 
           normalizedRole === 'LOP_TRUONG' || 
           normalizedRole === 'GIANG_VIEN' || 
           normalizedRole === 'ADMIN';
  }, [normalizedRole]);

  // Initialize semester when options are loaded
  useEffect(() => {
    // If semester is empty or not in options, set to currentSemester or first option
    if (semesterOptions.length > 0) {
      const semesterInOptions = semesterOptions.some(opt => opt.value === semester);
      if (!semester || !semesterInOptions) {
        // Prefer currentSemester if available and in options
        const currentInOptions = currentSemester && semesterOptions.some(opt => opt.value === currentSemester);
        const newSemester = currentInOptions ? currentSemester : semesterOptions[0]?.value;
        if (newSemester && newSemester !== semester) {
          setSemester(newSemester);
        }
      }
    }
  }, [semesterOptions, currentSemester, semester]);

  useEffect(() => {
    if (semester) {
      try {
        sessionStorage.setItem('current_semester', semester);
      } catch {}
    }
  }, [semester]);

  // Business logic: Load my activities
  const loadMyActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await studentActivitiesApi.getMyActivities(semester);
      
      if (result.success) {
        // Group activities by status
        const grouped = groupActivitiesByStatus(result.data);
        setData(grouped);
      } else {
        setError(result.error || 'Lỗi tải dữ liệu hoạt động');
        setData({ pending: [], approved: [], joined: [], rejected: [] });
      }
    } catch (err) {
      console.error('❌ Load activities error:', err);
      setError(err?.message || 'Lỗi tải dữ liệu hoạt động');
      setData({ pending: [], approved: [], joined: [], rejected: [] });
    } finally {
      setLoading(false);
    }
  }, [semester]);

  // Load activity types (sử dụng API service layer)
  const loadActivityTypes = useCallback(async () => {
    try {
      const result = await activitiesApi.getActivityTypes();
      if (result.success) {
        setActivityTypes(result.data || []);
      } else {
        console.warn('Could not load activity types:', result.error);
        setActivityTypes([]);
      }
    } catch (err) {
      console.warn('Could not load activity types:', err);
      setActivityTypes([]);
    }
  }, []);

  useEffect(() => {
    loadMyActivities();
    loadActivityTypes();
  }, [loadMyActivities, loadActivityTypes]);

  // Auto-reload when data changes from other components (same tab)
  useDataChangeListener(['ACTIVITIES', 'APPROVALS', 'REGISTRATIONS'], loadMyActivities, { debounceMs: 500 });

  // Auto-refresh for cross-user sync (when teacher/monitor approves)
  // Polls every 30 seconds and on window focus/visibility
  useAutoRefresh(loadMyActivities, { 
    intervalMs: 30000, 
    enabled: true,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  // Auto-refresh when attendance is updated
  useEffect(() => {
    const onUpdated = () => {
      loadMyActivities();
    };
    const onStorage = (e) => {
      if (e?.key === 'ATTENDANCE_UPDATED_AT') {
        loadMyActivities();
      }
    };
    
    try {
      window.addEventListener('attendance:updated', onUpdated);
      window.addEventListener('storage', onStorage);
    } catch (_) {}
    
    return () => {
      try {
        window.removeEventListener('attendance:updated', onUpdated);
        window.removeEventListener('storage', onStorage);
      } catch (_) {}
    };
  }, [loadMyActivities]);

  // Business logic: Cancel registration
  const cancelRegistration = useCallback(async (activityId, activityName) => {
    const confirmed = await confirm({
      title: 'Xác nhận hủy đăng ký',
      message: `Bạn có chắc muốn hủy đăng ký hoạt động "${activityName}"?`,
      confirmText: 'Hủy đăng ký',
      cancelText: 'Không'
    });
    
    if (!confirmed) return;
    
    try {
      const result = await studentActivitiesApi.cancelRegistration(activityId);
      
      if (result.success) {
        showSuccess('Hủy đăng ký thành công');
        loadMyActivities(); // Immediate local refresh
        // Note: API layer handles emitRegistrationsChange for cross-component sync
      } else {
        showError(result.error || 'Hủy đăng ký thất bại');
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Hủy đăng ký thất bại';
      showError(errorMsg);
    }
  }, [confirm, showSuccess, showError, loadMyActivities]);

  // UI Handlers
  const handleViewDetail = useCallback((activityId) => {
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  }, []);

  const handleShowQR = useCallback((activityId, activityName) => {
    setQrActivityId(activityId);
    setQrActivityName(activityName);
    setQrModalOpen(true);
  }, []);

  const handleCloseQRModal = useCallback(() => {
    setQrModalOpen(false);
    setQrActivityId(null);
    setQrActivityName('');
  }, []);

  // Business logic: Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    return count;
  }, [filters]);

  // Business logic: Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({ type: '', from: '', to: '' });
    setQuery('');
  }, []);

  // Business logic: Filter, search & sort activities
  const currentItems = useMemo(() => {
    let items = data[tab] || [];
    
    // Search filter
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        const name = (activityData.ten_hd || activityData.name || '').toLowerCase();
        return name.includes(lowerQuery);
      });
    }
    
    // Type filter
    if (filters.type) {
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        // Support both ID and name comparison
        const activityTypeId = String(activityData.loai_hd_id || activityData.loai_hd?.id || '');
        const activityTypeName = activityData.loai?.name || activityData.loai_hd?.ten_loai_hd || '';
        const filterValue = String(filters.type);
        return activityTypeId === filterValue || activityTypeName === filterValue;
      });
    }
    
    // Date filters
    if (filters.from) {
      const fromDate = new Date(filters.from);
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        const startDate = activityData.ngay_bd ? new Date(activityData.ngay_bd) : null;
        return startDate && startDate >= fromDate;
      });
    }
    
    if (filters.to) {
      const toDate = new Date(filters.to);
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        const startDate = activityData.ngay_bd ? new Date(activityData.ngay_bd) : null;
        return startDate && startDate <= toDate;
      });
    }

    // Sort theo sortBy - dùng spread để tránh mutate array gốc
    const sorted = [...items].sort((a, b) => {
      const aData = a.hoat_dong || a;
      const bData = b.hoat_dong || b;
      
      // Ưu tiên ngày đăng ký (cho "Hoạt động của tôi") hoặc ngày tạo/cập nhật
      const dateA = new Date(a.ngay_dang_ky || aData.ngay_cap_nhat || aData.ngay_tao || aData.ngay_bd || 0).getTime();
      const dateB = new Date(b.ngay_dang_ky || bData.ngay_cap_nhat || bData.ngay_tao || bData.ngay_bd || 0).getTime();

      switch (sortBy) {
        case 'oldest':
          return dateA - dateB;
        case 'name-az': {
          const nameA = (aData.ten_hd || '').toLowerCase();
          const nameB = (bData.ten_hd || '').toLowerCase();
          return nameA.localeCompare(nameB, 'vi');
        }
        case 'name-za': {
          const nameA = (aData.ten_hd || '').toLowerCase();
          const nameB = (bData.ten_hd || '').toLowerCase();
          return nameB.localeCompare(nameA, 'vi');
        }
        case 'newest':
        default:
          return dateB - dateA;
      }
    });

    setPagination(prev => ({ ...prev, total: sorted.length }));
    return sorted;
  }, [data, tab, query, filters, sortBy]);

  // Business logic: Pagination
  const paginatedItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return currentItems.slice(start, end);
  }, [currentItems, pagination.page, pagination.limit]);

  // Bỏ giới hạn hiển thị: luôn hiển thị tất cả hoạt động trên một trang
  useEffect(() => {
    setPagination(prev => {
      if (!currentItems.length) {
        return { ...prev, limit: 0, total: 0, page: 1 };
      }
      if (prev.limit === currentItems.length) return prev;
      return {
        ...prev,
        limit: currentItems.length,
        total: currentItems.length,
        page: 1
      };
    });
  }, [currentItems.length]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [query, filters, tab]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const totalActivities = data.pending.length + data.approved.length + data.joined.length + data.rejected.length;

  return {
    // State
    tab,
    setTab,
    data,
    loading,
    error,
    selectedActivityId,
    isModalOpen,
    qrModalOpen,
    qrActivityId,
    qrActivityName,
    query,
    setQuery,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    activityTypes,
    statusViewMode,
    setStatusViewMode,
    pagination,
    setPagination,
    semester,
    setSemester,
    semesterOptions,
    currentSemester,
    isWritable,
    normalizedRole,
    canShowQR,

    // Derived data
    currentItems,
    paginatedItems,
    totalActivities,

    // Actions
    loadMyActivities,
    cancelRegistration,
    handleViewDetail,
    handleCloseModal,
    handleShowQR,
    handleCloseQRModal,
    getActiveFilterCount,
    clearAllFilters,
    handlePageChange
  };
}

