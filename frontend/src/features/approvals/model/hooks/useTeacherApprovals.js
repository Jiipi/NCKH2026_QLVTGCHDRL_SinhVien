/**
 * useTeacherApprovals Hook
 * Hook quản lý logic phê duyệt đăng ký cho Giảng viên
 * Xử lý cả phê duyệt hoạt động và phê duyệt đăng ký
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import http from '../../../../shared/api/http';
import { getCurrentSemesterValue } from '../../../../shared/lib/semester';

const STATUS_MAP = {
  pending: 'cho_duyet',
  approved: 'da_duyet',
  rejected: 'tu_choi',
  participated: 'da_tham_gia',
};

/**
 * Hook for managing teacher's registration approvals
 * @param {string} initialSemester - Initial semester value
 * @param {object} options - Additional options
 */
export function useTeacherApprovals(initialSemester, options = {}) {
  const { mode = 'registrations' } = options; // 'registrations' or 'activities'
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  // Data states
  const [registrations, setRegistrations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Stats
  const [counts, setCounts] = useState({
    cho_duyet: 0,
    da_duyet: 0,
    tu_choi: 0,
    da_tham_gia: 0
  });

  // UI and filter states
  const [semester, setSemester] = useState(initialSemester || getCurrentSemesterValue());
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    type: '', 
    from: '', 
    to: '', 
    mssv: '',
    activityId: ''
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // --- Data Fetching ---
  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const status = STATUS_MAP[activeTab];
      const params = {
        status,
        semester: semester || undefined,
        activityId: filters.activityId || undefined,
        page: pagination.page,
        limit: pagination.limit
      };

      // Clean empty params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const endpoint = mode === 'activities' 
        ? '/teacher/pending-activities' 
        : '/teacher/activity-registrations';
      
      const res = await http.get(endpoint, { params });
      const data = res?.data?.data || res?.data || {};
      
      setRegistrations(Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []));
      setPagination(prev => ({
        ...prev,
        total: parseInt(data.total || 0)
      }));
      
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách:', err);
      setError('Không thể tải danh sách.');
      setRegistrations([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [activeTab, semester, filters.activityId, pagination.page, pagination.limit, mode]);

  const loadActivities = useCallback(async () => {
    try {
      const res = await http.get('/teacher/activities', { params: { semester } });
      const list = res?.data?.data?.activities || res?.data?.data || res?.data || [];
      setActivities(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi khi tải hoạt động:', err);
      setActivities([]);
    }
  }, [semester]);

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  // Reset page khi thay đổi filter
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedIds([]);
  }, [activeTab, semester, filters.activityId]);

  // --- Action Handlers ---
  const handleApprove = useCallback(async (item) => {
    const name = mode === 'activities' 
      ? (item.ten_hd || 'hoạt động này')
      : (item.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên này');
    
    const confirmed = await confirm({ 
      title: 'Xác nhận phê duyệt', 
      message: `Bạn có chắc muốn phê duyệt ${name}?` 
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      const endpoint = mode === 'activities'
        ? `/teacher/activities/${item.id}/approve`
        : `/teacher/registrations/${item.id}/approve`;
      
      await http.post(endpoint);
      showSuccess('Phê duyệt thành công.');
      await loadRegistrations();
    } catch (err) {
      showError(err?.response?.data?.message || 'Không thể phê duyệt.');
    } finally {
      setProcessing(false);
    }
  }, [confirm, showSuccess, showError, loadRegistrations, mode]);

  const handleReject = useCallback(async (item) => {
    const reason = window.prompt('Nhập lý do từ chối:', 'Không đáp ứng yêu cầu');
    if (!reason || !reason.trim()) {
      showWarning('Vui lòng nhập lý do từ chối.');
      return;
    }

    setProcessing(true);
    try {
      const endpoint = mode === 'activities'
        ? `/teacher/activities/${item.id}/reject`
        : `/teacher/registrations/${item.id}/reject`;
      
      await http.post(endpoint, { reason: reason.trim() });
      showSuccess('Đã từ chối.');
      await loadRegistrations();
    } catch (err) {
      showError(err?.response?.data?.message || 'Không thể từ chối.');
    } finally {
      setProcessing(false);
    }
  }, [showSuccess, showError, showWarning, loadRegistrations, mode]);

  const handleBulkApprove = useCallback(async () => {
    if (selectedIds.length === 0) {
      showWarning('Vui lòng chọn ít nhất một mục.');
      return;
    }

    const confirmed = await confirm({ 
      title: 'Xác nhận phê duyệt hàng loạt', 
      message: `Bạn có chắc muốn phê duyệt ${selectedIds.length} mục đã chọn?` 
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      await http.post('/teacher/registrations/bulk-approve', { ids: selectedIds });
      showSuccess(`Đã phê duyệt ${selectedIds.length} mục.`);
      setSelectedIds([]);
      await loadRegistrations();
    } catch (err) {
      showError(err?.response?.data?.message || 'Lỗi khi phê duyệt hàng loạt.');
    } finally {
      setProcessing(false);
    }
  }, [selectedIds, confirm, showSuccess, showError, showWarning, loadRegistrations]);

  // --- Filtering Logic (client-side additional filtering) ---
  const filteredRegistrations = useMemo(() => {
    let filtered = registrations;

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(reg => {
        const studentName = (reg.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
        const mssv = (reg.sinh_vien?.mssv || reg.sinh_vien?.ma_sv || '').toLowerCase();
        const activityName = (reg.hoat_dong?.ten_hd || reg.ten_hd || '').toLowerCase();
        const activityCode = (reg.hoat_dong?.ma_hd || reg.ma_hd || '').toLowerCase();
        return studentName.includes(lowerSearch) || 
               mssv.includes(lowerSearch) || 
               activityName.includes(lowerSearch) ||
               activityCode.includes(lowerSearch);
      });
    }

    // MSSV filter
    if (filters.mssv) {
      const lowerMssv = filters.mssv.toLowerCase();
      filtered = filtered.filter(reg => {
        const mssv = (reg.sinh_vien?.mssv || reg.sinh_vien?.ma_sv || '').toLowerCase();
        return mssv.includes(lowerMssv);
      });
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(reg => {
        const typeId = reg.hoat_dong?.loai_hd_id || reg.loai_hd_id;
        return String(typeId) === String(filters.type);
      });
    }

    // Date filters
    if (filters.from) {
      const fromDate = new Date(filters.from);
      filtered = filtered.filter(reg => {
        const activityDate = (reg.hoat_dong?.ngay_bd || reg.ngay_bd) 
          ? new Date(reg.hoat_dong?.ngay_bd || reg.ngay_bd) 
          : null;
        return activityDate && activityDate >= fromDate;
      });
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      filtered = filtered.filter(reg => {
        const activityDate = (reg.hoat_dong?.ngay_bd || reg.ngay_bd) 
          ? new Date(reg.hoat_dong?.ngay_bd || reg.ngay_bd) 
          : null;
        return activityDate && activityDate <= toDate;
      });
    }

    // Sort filtered results
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest': {
          const ta = new Date(a.ngay_dang_ky || a.updated_at || a.createdAt || 0).getTime();
          const tb = new Date(b.ngay_dang_ky || b.updated_at || b.createdAt || 0).getTime();
          return ta - tb;
        }
        case 'name-az': {
          const nameA = (a.sinh_vien?.nguoi_dung?.ho_ten || a.ten_hd || '').toLowerCase();
          const nameB = (b.sinh_vien?.nguoi_dung?.ho_ten || b.ten_hd || '').toLowerCase();
          return nameA.localeCompare(nameB, 'vi');
        }
        case 'name-za': {
          const nameA = (a.sinh_vien?.nguoi_dung?.ho_ten || a.ten_hd || '').toLowerCase();
          const nameB = (b.sinh_vien?.nguoi_dung?.ho_ten || b.ten_hd || '').toLowerCase();
          return nameB.localeCompare(nameA, 'vi');
        }
        case 'newest':
        default: {
          const ta = new Date(a.ngay_dang_ky || a.updated_at || a.createdAt || 0).getTime();
          const tb = new Date(b.ngay_dang_ky || b.updated_at || b.createdAt || 0).getTime();
          return tb - ta;
        }
      }
    });
  }, [registrations, searchTerm, filters, sortBy]);

  // --- Selection Logic ---
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    const pendingIds = filteredRegistrations
      .filter(r => r.trang_thai_dk === 'cho_duyet' || r.trang_thai === 'cho_duyet')
      .map(r => r.id);
    
    if (selectedIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  }, [filteredRegistrations, selectedIds.length]);

  // --- Stats ---
  const stats = useMemo(() => ({
    total: (counts.cho_duyet || 0) + (counts.da_duyet || 0) + (counts.tu_choi || 0) + (counts.da_tham_gia || 0),
    pending: counts.cho_duyet || 0,
    approved: counts.da_duyet || 0,
    rejected: counts.tu_choi || 0,
    participated: counts.da_tham_gia || 0
  }), [counts]);

  // --- Pagination handlers ---
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // --- Filter clear ---
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({ type: '', from: '', to: '', mssv: '', activityId: '' });
    setActiveTab('pending');
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedIds([]);
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (filters.mssv) count++;
    if (filters.activityId) count++;
    return count;
  }, [filters]);

  return {
    // State
    loading,
    processing,
    error,
    semester,
    setSemester,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    sortBy,
    setSortBy,
    pagination,

    // Data
    registrations,
    filteredRegistrations,
    activities,
    stats,
    counts,

    // Handlers
    handleApprove,
    handleReject,
    handleBulkApprove,
    handleToggleSelect,
    handleToggleSelectAll,
    handlePageChange,
    handleLimitChange,
    clearAllFilters,
    getActiveFilterCount,
    refresh: loadRegistrations
  };
}

export default useTeacherApprovals;
