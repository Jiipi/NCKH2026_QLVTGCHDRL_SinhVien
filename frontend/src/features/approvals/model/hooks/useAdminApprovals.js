/**
 * useAdminApprovals Hook
 * Hook quản lý logic phê duyệt đăng ký cho admin
 * Với chức năng xem toàn bộ hệ thống hoặc theo lớp
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

const SCOPE_OPTIONS = [
  { value: 'all', label: 'Toàn hệ thống' },
  { value: 'class', label: 'Theo lớp' }
];

export function useAdminApprovals(initialSemester) {
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  // Data states
  const [registrations, setRegistrations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [classes, setClasses] = useState([]);
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
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected', 'participated'
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
  
  // Scope: 'all' = toàn hệ thống, 'class' = theo lớp
  const [scopeTab, setScopeTab] = useState('all');
  const [selectedClass, setSelectedClass] = useState('');

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
        classId: (scopeTab === 'class' && selectedClass) ? selectedClass : undefined,
        page: pagination.page,
        limit: pagination.limit
      };

      // Clean empty params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const res = await http.get('/admin/registrations', { params });
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
      console.error('Lỗi khi tải danh sách đăng ký:', err);
      setError('Không thể tải danh sách đăng ký.');
      setRegistrations([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [activeTab, semester, filters.activityId, scopeTab, selectedClass, pagination.page, pagination.limit]);

  const loadActivities = useCallback(async () => {
    try {
      const res = await http.get('/admin/activities', { params: { semester } });
      const list = res?.data?.data?.activities || res?.data?.data || res?.data || [];
      setActivities(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi khi tải hoạt động:', err);
      setActivities([]);
    }
  }, [semester]);

  const loadClasses = useCallback(async () => {
    try {
      // Use correct API endpoint for admin classes
      const res = await http.get('/admin/reports/classes');
      const list = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
      setClasses(list);
    } catch (err) {
      console.error('Lỗi khi tải lớp:', err);
      setClasses([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

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
  }, [activeTab, semester, scopeTab, selectedClass, filters.activityId]);

  // --- Action Handlers ---
  const handleApprove = useCallback(async (registration) => {
    const studentName = registration.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên này';
    const confirmed = await confirm({ 
      title: 'Xác nhận phê duyệt', 
      message: `Bạn có chắc muốn phê duyệt đăng ký của ${studentName}?` 
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      await http.post(`/admin/registrations/${registration.id}/approve`);
      showSuccess('Phê duyệt thành công.');
      await loadRegistrations();
    } catch (err) {
      showError(err?.response?.data?.message || 'Không thể phê duyệt đăng ký.');
    } finally {
      setProcessing(false);
    }
  }, [confirm, showSuccess, showError, loadRegistrations]);

  const handleReject = useCallback(async (registration) => {
    const reason = window.prompt('Nhập lý do từ chối:', 'Không đáp ứng yêu cầu');
    if (!reason || !reason.trim()) {
      showWarning('Vui lòng nhập lý do từ chối.');
      return;
    }

    setProcessing(true);
    try {
      await http.post(`/admin/registrations/${registration.id}/reject`, { reason: reason.trim() });
      showSuccess('Đã từ chối đăng ký.');
      await loadRegistrations();
    } catch (err) {
      showError(err?.response?.data?.message || 'Không thể từ chối đăng ký.');
    } finally {
      setProcessing(false);
    }
  }, [showSuccess, showError, showWarning, loadRegistrations]);

  const handleBulkApprove = useCallback(async () => {
    if (selectedIds.length === 0) {
      showWarning('Vui lòng chọn ít nhất một đăng ký.');
      return;
    }

    const confirmed = await confirm({ 
      title: 'Xác nhận phê duyệt hàng loạt', 
      message: `Bạn có chắc muốn phê duyệt ${selectedIds.length} đăng ký đã chọn?` 
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      await http.post('/admin/registrations/bulk', { ids: selectedIds, action: 'approve' });
      showSuccess(`Đã phê duyệt ${selectedIds.length} đăng ký.`);
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
        const activityName = (reg.hoat_dong?.ten_hd || '').toLowerCase();
        const activityCode = (reg.hoat_dong?.ma_hd || '').toLowerCase();
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
        const typeId = reg.hoat_dong?.loai_hd_id || reg.hoat_dong?.loai_hd?.id;
        return String(typeId) === String(filters.type);
      });
    }

    // Date filters
    if (filters.from) {
      const fromDate = new Date(filters.from);
      filtered = filtered.filter(reg => {
        const activityDate = reg.hoat_dong?.ngay_bd ? new Date(reg.hoat_dong.ngay_bd) : null;
        return activityDate && activityDate >= fromDate;
      });
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      filtered = filtered.filter(reg => {
        const activityDate = reg.hoat_dong?.ngay_bd ? new Date(reg.hoat_dong.ngay_bd) : null;
        return activityDate && activityDate <= toDate;
      });
    }

    // Sort filtered results
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest': {
          const ta = new Date(a.ngay_dang_ky || a.updated_at || a.updatedAt || a.createdAt || a.tg_diem_danh || 0).getTime();
          const tb = new Date(b.ngay_dang_ky || b.updated_at || b.updatedAt || b.createdAt || b.tg_diem_danh || 0).getTime();
          return ta - tb;
        }
        case 'name-az': {
          const nameA = (a.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          const nameB = (b.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          return nameA.localeCompare(nameB, 'vi');
        }
        case 'name-za': {
          const nameA = (a.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          const nameB = (b.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          return nameB.localeCompare(nameA, 'vi');
        }
        case 'newest':
        default: {
          const ta = new Date(a.ngay_dang_ky || a.updated_at || a.updatedAt || a.createdAt || a.tg_diem_danh || 0).getTime();
          const tb = new Date(b.ngay_dang_ky || b.updated_at || b.updatedAt || b.createdAt || b.tg_diem_danh || 0).getTime();
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
      .filter(r => r.trang_thai_dk === 'cho_duyet')
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
    setScopeTab('all');
    setSelectedClass('');
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
    if (scopeTab === 'class' && selectedClass) count++;
    return count;
  }, [filters, scopeTab, selectedClass]);

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
    scopeTab,
    setScopeTab,
    selectedClass,
    setSelectedClass,
    pagination,

    // Data
    registrations,
    filteredRegistrations,
    activities,
    classes,
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
    refresh: loadRegistrations,

    // Constants
    SCOPE_OPTIONS
  };
}
