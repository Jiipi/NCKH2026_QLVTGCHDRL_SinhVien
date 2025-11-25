/**
 * Monitor Activity Oversight Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho quản lý hoạt động lớp
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { monitorActivityOversightApi } from '../../services/monitorActivityOversightApi';
import { mapActivityToUI } from '../mappers/monitor.mappers';
import useSemesterData from '../../../../hooks/useSemesterData';
import { useNotification } from '../../../../contexts/NotificationContext';

/**
 * Hook quản lý hoạt động lớp
 */
export function useMonitorActivityOversight() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  
  const [activities, setActivities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('cho_duyet');
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [displayViewMode, setDisplayViewMode] = useState('grid');
  const [statusViewMode, setStatusViewMode] = useState('pills');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [activityTypes, setActivityTypes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
  const [availablePagination, setAvailablePagination] = useState({ page: 1, limit: 100, total: 0 });
  const [dashboardStats, setDashboardStats] = useState({
    totalActivities: 0,
    approvedCount: 0,
    endedCount: 0
  });

  const [semester, setSemester] = useState(() => {
    try {
      return sessionStorage.getItem('current_semester') || '';
    } catch (_) {
      return '';
    }
  });

  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);

  const statusLabels = {
    'co_san': 'Hoạt động có sẵn',
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Bị từ chối',
    'da_huy': 'Đã hủy',
    'ket_thuc': 'Kết thúc'
  };

  const statusColors = {
    'co_san': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'cho_duyet': 'bg-amber-50 text-amber-700 border-amber-200',
    'da_duyet': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'tu_choi': 'bg-rose-50 text-rose-700 border-rose-200',
    'da_huy': 'bg-slate-50 text-slate-700 border-slate-200',
    'ket_thuc': 'bg-purple-50 text-purple-700 border-purple-200'
  };

  // Business logic: Load activities
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        semester: semester || undefined,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const result = await monitorActivityOversightApi.getAvailableActivities(params);
      if (result.success) {
        const responseData = result.data || {};
        const activitiesArray = responseData.items || [];
        const total = responseData.total || activitiesArray.length;
        
        setActivities(activitiesArray);
        setPagination(prev => ({ ...prev, total }));
        setError('');
      } else {
        setError(result.error || 'Không thể tải danh sách hoạt động');
        setActivities([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      console.error('Error loading class activities:', err);
      setError(err?.message || 'Không thể tải danh sách hoạt động');
      setActivities([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [semester, pagination.page, pagination.limit]);

  // Business logic: Load available activities
  const loadAvailableActivities = useCallback(async () => {
    try {
      const params = {
        semester: semester || undefined,
        page: availablePagination.page,
        limit: availablePagination.limit
      };
      
      const result = await monitorActivityOversightApi.getAvailableActivities(params);
      if (result.success) {
        const responseData = result.data || {};
        const activitiesArray = responseData.items || [];
        const total = responseData.total || activitiesArray.length;
        
        setAvailableActivities(activitiesArray);
        setAvailablePagination(prev => ({ ...prev, total }));
      } else {
        setAvailableActivities([]);
        setAvailablePagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      console.error('Error loading available activities:', err);
      setAvailableActivities([]);
      setAvailablePagination(prev => ({ ...prev, total: 0 }));
    }
  }, [semester, availablePagination.page, availablePagination.limit]);

  // Business logic: Load activity types
  const loadActivityTypes = useCallback(async () => {
    try {
      const result = await monitorActivityOversightApi.getActivityTypes();
      if (result.success) {
        setActivityTypes(result.data || []);
      } else {
        setActivityTypes([]);
      }
    } catch (err) {
      console.error('Error loading activity types:', err);
      setActivityTypes([]);
    }
  }, []);

  // Business logic: Load dashboard stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const result = await monitorActivityOversightApi.getDashboardStats(semester);
      if (result.success) {
        const summary = result.data || {};
        setDashboardStats({
          totalActivities: summary.totalActivities || 0,
          approvedCount: 0,
          endedCount: 0
        });
      } else {
        setDashboardStats({
          totalActivities: 0,
          approvedCount: 0,
          endedCount: 0
        });
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setDashboardStats({
        totalActivities: 0,
        approvedCount: 0,
        endedCount: 0
      });
    }
  }, [semester]);

  // Business logic: Edit activity
  const handleEditActivity = useCallback(async (activity) => {
    try {
      const result = await monitorActivityOversightApi.getDetail(activity.id);
      if (result.success) {
        setSelectedActivity(result.data);
        setShowEditModal(true);
        setEditMode(false);
      } else {
        showError('Không thể tải chi tiết hoạt động', 'Lỗi');
      }
    } catch (err) {
      console.error('Error loading activity details:', err);
      showError('Không thể tải chi tiết hoạt động', 'Lỗi');
    }
  }, [showError]);

  // Business logic: Save activity
  const handleSaveActivity = useCallback(async () => {
    if (!selectedActivity) return;
    
    try {
      const diem_rl = selectedActivity.diem_rl === '' ? 0 : parseFloat(selectedActivity.diem_rl) || 0;
      const sl_toi_da = selectedActivity.sl_toi_da === '' ? 0 : parseInt(selectedActivity.sl_toi_da) || 0;
      
      const updateData = {
        ten_hd: selectedActivity.ten_hd,
        mo_ta: selectedActivity.mo_ta,
        loai_hd_id: selectedActivity.loai_hd_id,
        diem_rl: diem_rl,
        dia_diem: selectedActivity.dia_diem,
        ngay_bd: selectedActivity.ngay_bd,
        ngay_kt: selectedActivity.ngay_kt,
        han_dk: selectedActivity.han_dk,
        sl_toi_da: sl_toi_da,
        don_vi_to_chuc: selectedActivity.don_vi_to_chuc,
        yeu_cau_tham_gia: selectedActivity.yeu_cau_tham_gia,
        trang_thai: selectedActivity.trang_thai,
        hinh_anh: selectedActivity.hinh_anh,
        tep_dinh_kem: selectedActivity.tep_dinh_kem
      };
      
      const result = await monitorActivityOversightApi.update(selectedActivity.id, updateData);
      if (result.success) {
        await loadActivities();
        showSuccess(`Đã cập nhật hoạt động "${selectedActivity.ten_hd}" thành công`, 'Cập nhật hoạt động');
        setEditMode(false);
        setShowEditModal(false);
        setSelectedActivity(null);
      } else {
        showError(result.error || 'Không thể cập nhật hoạt động', 'Lỗi cập nhật');
      }
    } catch (err) {
      console.error('Error updating activity:', err);
      showError(err?.response?.data?.message || 'Không thể cập nhật hoạt động', 'Lỗi cập nhật');
    }
  }, [selectedActivity, loadActivities, showSuccess, showError]);

  // Business logic: Delete activity
  const handleDeleteActivity = useCallback(async (activity) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa hoạt động',
      message: `Bạn có chắc chắn muốn xóa hoạt động "${activity.ten_hd}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });

    if (!confirmed) return;

    try {
      const result = await monitorActivityOversightApi.delete(activity.id);
      if (result.success) {
        await loadActivities();
        showSuccess(`Đã xóa hoạt động "${activity.ten_hd}" thành công`, 'Xóa hoạt động');
      } else {
        showError(result.error || 'Không thể xóa hoạt động', 'Lỗi xóa hoạt động');
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
      showError(err?.response?.data?.message || 'Không thể xóa hoạt động', 'Lỗi xóa hoạt động');
    }
  }, [loadActivities, showSuccess, showError, confirm]);

  // Business logic: Register to activity
  const handleRegister = useCallback(async (activityId, activityName) => {
    const confirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${activityName}"?`,
      confirmText: 'Đăng ký',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      const result = await monitorActivityOversightApi.register(activityId);
      if (result.success) {
        showSuccess(result.data?.message || 'Đăng ký thành công');
        await loadActivities();
        await loadAvailableActivities();
      } else {
        showError(result.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      const firstValidation = err?.response?.data?.errors?.[0]?.message;
      const errorMsg = firstValidation || err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
      showError(errorMsg);
    }
  }, [loadActivities, loadAvailableActivities, showSuccess, showError, confirm]);

  // Business logic: Create activity
  const handleCreateActivity = useCallback(() => {
    if (!isWritable) return;
    navigate('/monitor/activities/create');
  }, [isWritable, navigate]);

  // Business logic: View details
  const handleViewDetails = useCallback((activity) => {
    setSelectedActivity(activity.id);
    setShowDetailModal(true);
  }, []);

  // Business logic: Show QR
  const handleShowQR = useCallback((activity) => {
    setSelectedActivity(activity);
    setShowQRModal(true);
  }, []);

  // Business logic: Close edit modal
  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditMode(false);
    setSelectedActivity(null);
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
    setSearchTerm('');
  }, []);

  // Helper functions for activity status and filtering
  const parseDateSafe = useCallback((d) => { 
    try { 
      return d ? new Date(d) : null; 
    } catch(_) { 
      return null; 
    } 
  }, []);

  const hasEndedByTime = useCallback((a) => {
    const end = parseDateSafe(a?.ngay_kt);
    if (!end) return false;
    return Date.now() > (end.getTime() + 60 * 1000);
  }, [parseDateSafe]);

  const getDisplayStatus = useCallback((a) => {
    if (!a) return 'cho_duyet';
    if (a.trang_thai === 'da_duyet' && hasEndedByTime(a)) return 'ket_thuc';
    return a.trang_thai;
  }, [hasEndedByTime]);

  const isAvailable = useCallback((a) => {
    if (!a) return false;
    
    // ✅ Chỉ hiển thị hoạt động ĐÃ DUYỆT
    if (a.trang_thai !== 'da_duyet') return false;
    
    const now = new Date();
    const endDate = parseDateSafe(a.ngay_kt);
    
    // ✅ Loại bỏ hoạt động đã kết thúc
    if (endDate && endDate < now) return false;
    
    // ✅ Kiểm tra còn chỗ trống (nếu có giới hạn số lượng)
    const capacity = a.so_luong_toi_da ?? a.sl_toi_da ?? null;
    const registeredCount = a.registrationCount ?? a.so_dang_ky ?? a._count?.dang_ky_hd ?? 0;
    const isFull = capacity !== null ? Number(registeredCount) >= Number(capacity) : false;
    if (isFull) return false;
    
    // ✅ Cho phép đăng ký nếu chưa đăng ký hoặc đã bị từ chối trước đó
    const notRegisteredOrRejected = (!a.is_registered) || a.registration_status === 'tu_choi';
    return notRegisteredOrRejected;
  }, [parseDateSafe]);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  }, []);

  // Filter and sort activities with advanced filters
  const filteredActivities = useMemo(() => {
    return (statusFilter === 'co_san' ? activities : activities)
      .filter(activity => {
        const matchesSearch = activity.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             activity.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Tab "Có sẵn": chỉ hiển thị hoạt động đã duyệt (ẩn cho_duyet giống role sinh viên)
        // Tab khác: lọc theo trạng thái hiện tại
        const displayStatus = getDisplayStatus(activity);
        const matchesStatus = statusFilter === 'all' 
          || (statusFilter === 'co_san' ? true : displayStatus === statusFilter);
        
        // Advanced filters
        let matchesType = true;
        let matchesDateFrom = true;
        let matchesDateTo = true;

        if (filters.type) {
          const filterValue = String(filters.type).trim();
          const filterId = parseInt(filterValue, 10);

          if (isNaN(filterId)) {
            // Filter by name (case-insensitive) when value is not numeric
            const filterName = filterValue.toLowerCase();
            const activityTypeName = (activity.loai_hd?.ten_loai_hd || activity.loai_hd?.name || '').toLowerCase();
            matchesType = activityTypeName === filterName;
          } else {
            // Filter by numeric id
            let activityTypeId = null;
            if (activity.loai_hd_id !== undefined && activity.loai_hd_id !== null) {
              activityTypeId = activity.loai_hd_id;
            } else if (activity.loai_hd && typeof activity.loai_hd === 'object' && activity.loai_hd.id !== undefined) {
              activityTypeId = activity.loai_hd.id;
            } else if (activity.loai_hd !== undefined && activity.loai_hd !== null) {
              const parsed = parseInt(activity.loai_hd, 10);
              if (!isNaN(parsed)) activityTypeId = parsed;
            }

            const activityId = activityTypeId !== null ? parseInt(activityTypeId, 10) : null;
            matchesType = activityId !== null && activityId === filterId;
          }
        }

        if (filters.from) {
          const fromDate = new Date(filters.from);
          const activityDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
          matchesDateFrom = activityDate && activityDate >= fromDate;
        }

        if (filters.to) {
          const toDate = new Date(filters.to);
          toDate.setHours(23, 59, 59, 999);
          const activityDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
          matchesDateTo = activityDate && activityDate <= toDate;
        }

        return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => {
        const ta = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
        const tb = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
        return tb - ta; // ưu tiên thao tác mới nhất lên đầu
      });
  }, [activities, statusFilter, searchTerm, filters, getDisplayStatus]);

  // Derived counts
  const countByDisplayStatus = useCallback((st) => {
    return activities.reduce((n, a) => n + (getDisplayStatus(a) === st ? 1 : 0), 0);
  }, [activities, getDisplayStatus]);

  const tabCounts = useMemo(() => ({
    cho_duyet: countByDisplayStatus('cho_duyet'),
    da_duyet: countByDisplayStatus('da_duyet'),
    ket_thuc: countByDisplayStatus('ket_thuc'),
    tu_choi: countByDisplayStatus('tu_choi')
  }), [countByDisplayStatus]);

  const localApprovedCount = tabCounts.da_duyet;
  const localAvailableCount = pagination.total || activities.length;
  const localPendingCount = tabCounts.cho_duyet;
  const localEndedCount = tabCounts.ket_thuc;
  
  // ✅ Use dashboard stats for display (accurate count from backend)
  const approvedCount = dashboardStats.approvedCount || localApprovedCount;
  const availableCount = localAvailableCount;
  const pendingCount = localPendingCount;
  const endedCount = dashboardStats.endedCount || localEndedCount;
  const totalActivitiesCount = pagination.total || activities.length;

  // Effects
  useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester, semester]);

  useEffect(() => {
    if (semester) {
      try {
        sessionStorage.setItem('current_semester', semester);
      } catch (_) {}
    }
  }, [semester]);

  useEffect(() => {
    loadActivities();
    loadAvailableActivities();
    loadDashboardStats();
    loadActivityTypes();
  }, [semester, pagination.page, pagination.limit, availablePagination.page, availablePagination.limit, loadActivities, loadAvailableActivities, loadDashboardStats, loadActivityTypes]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setAvailablePagination(prev => ({ ...prev, page: 1 }));
  }, [semester, statusFilter, searchTerm, filters]);

  return {
    // Data
    activities,
    availableActivities,
    activityTypes,
    dashboardStats,
    
    // State
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedActivity,
    setSelectedActivity,
    showQRModal,
    setShowQRModal,
    showDetailModal,
    setShowDetailModal,
    showEditModal,
    setShowEditModal,
    editMode,
    setEditMode,
    displayViewMode,
    setDisplayViewMode,
    statusViewMode,
    setStatusViewMode,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    pagination,
    setPagination,
    availablePagination,
    setAvailablePagination,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    
    // Helpers
    statusLabels,
    statusColors,
    getActiveFilterCount,
    clearAllFilters,
    parseDateSafe,
    hasEndedByTime,
    getDisplayStatus,
    isAvailable,
    formatDate,
    filteredActivities,
    approvedCount,
    availableCount,
    pendingCount,
    endedCount,
    totalActivitiesCount,
    tabCounts,
    
    // Actions
    loadActivities,
    loadAvailableActivities,
    loadActivityTypes,
    loadDashboardStats,
    handleCreateActivity,
    handleEditActivity,
    handleSaveActivity,
    handleDeleteActivity,
    handleRegister,
    handleViewDetails,
    handleShowQR,
    handleCloseEditModal
  };
}
