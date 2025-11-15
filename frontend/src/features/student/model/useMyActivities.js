import React from 'react';
import http from '../../../shared/api/http';
import { useNotification } from '../../../contexts/NotificationContext';
import useSemesterData from '../../../hooks/useSemesterData';
import sessionStorageManager from '../../../shared/api/sessionStorageManager';
import { normalizeRole } from '../../../shared/lib/role';

export default function useMyActivities() {
  const { showSuccess, showError, confirm } = useNotification();
  const [tab, setTab] = React.useState('joined');
  const [data, setData] = React.useState({ pending: [], approved: [], joined: [], rejected: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedActivityId, setSelectedActivityId] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrActivityId, setQrActivityId] = React.useState(null);
  const [qrActivityName, setQrActivityName] = React.useState('');

  const [query, setQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({ type: '', from: '', to: '' });
  const [activityTypes, setActivityTypes] = React.useState([]);
  const [statusViewMode, setStatusViewMode] = React.useState('pills');
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0 });

  const [semester, setSemester] = React.useState(() => {
    try { return sessionStorage.getItem('current_semester') || ''; } catch { return ''; }
  });
  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);
  const normalizedRole = React.useMemo(() => {
    const r = sessionStorageManager.getRole() || '';
    return String(normalizeRole(r) || r).toUpperCase();
  }, []);
  const canShowQR = normalizedRole === 'SINH_VIEN' || normalizedRole === 'LOP_TRUONG' || normalizedRole === 'GIANG_VIEN' || normalizedRole === 'ADMIN';

  React.useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester]);

  React.useEffect(() => {
    if (semester) {
      try { sessionStorage.setItem('current_semester', semester); } catch {}
    }
  }, [semester]);

  const parseSemesterToLegacy = React.useCallback((value) => {
    const m = String(value || '').match(/^(hoc_ky_1|hoc_ky_2)-(\d{4})$/);
    if (!m) return { hoc_ky: '', nam_hoc: '' };
    const hoc_ky = m[1];
    const y = parseInt(m[2], 10);
    const nam_hoc = hoc_ky === 'hoc_ky_1' ? `${y}-${y + 1}` : `${y - 1}-${y}`;
    return { hoc_ky, nam_hoc };
  }, []);

  const loadMyActivities = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const legacy = parseSemesterToLegacy(semester);
      const params = {};
      if (semester) {
        params.semester = semester;
        if (legacy.hoc_ky) params.hoc_ky = legacy.hoc_ky;
        if (legacy.nam_hoc) params.nam_hoc = legacy.nam_hoc;
      }
      const res = await http.get('/core/dashboard/activities/me', { params });
      const payload = res.data?.data ?? res.data ?? [];
      const activities = Array.isArray(payload) ? payload : (payload.items || payload.data || []);
      const pending = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'cho_duyet');
      const approved = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'da_duyet');
      const joined = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'da_tham_gia');
      const rejected = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'tu_choi');
      setData({ pending, approved, joined, rejected });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ Load activities error:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu hoạt động');
    } finally {
      setLoading(false);
    }
  }, [semester, parseSemesterToLegacy]);

  React.useEffect(() => {
    loadMyActivities();
    loadActivityTypes();
  }, [loadMyActivities]);

  // Auto-refresh when attendance is updated elsewhere (same tab or other tabs)
  React.useEffect(() => {
    const onUpdated = () => {
      loadMyActivities();
    };
    const onStorage = (e) => {
      if (e?.key === 'ATTENDANCE_UPDATED_AT') {
        loadMyActivities();
      }
    };
    try { window.addEventListener('attendance:updated', onUpdated); } catch (_) {}
    try { window.addEventListener('storage', onStorage); } catch (_) {}
    return () => {
      try { window.removeEventListener('attendance:updated', onUpdated); } catch (_) {}
      try { window.removeEventListener('storage', onStorage); } catch (_) {}
    };
  }, [loadMyActivities]);

  function loadActivityTypes() {
    http.get('/core/activity-types')
      .then(res => {
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          setActivityTypes(Array.isArray(data) ? data : []);
        } else if (res.data?.data) {
          const data = res.data.data;
          setActivityTypes(Array.isArray(data) ? data : []);
        } else {
          setActivityTypes([]);
        }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.warn('Could not load activity types:', err);
        setActivityTypes([]);
      });
  }

  async function cancelRegistration(activityId, activityName) {
    const confirmed = await confirm({
      title: 'Xác nhận hủy đăng ký',
      message: `Bạn có chắc muốn hủy đăng ký hoạt động "${activityName}"?`,
      confirmText: 'Hủy đăng ký',
      cancelText: 'Không'
    });
    if (!confirmed) return;
    try {
      const res = await http.post(`/core/activities/${activityId}/cancel`);
      if (res.data?.success) {
        showSuccess('Hủy đăng ký thành công');
        loadMyActivities();
      } else {
        showSuccess(res.data?.message || 'Hủy đăng ký thành công');
        loadMyActivities();
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Hủy đăng ký thất bại';
      showError(errorMsg);
    }
  }

  function handleViewDetail(activityId) {
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  }

  function handleShowQR(activityId, activityName) {
    setQrActivityId(activityId);
    setQrActivityName(activityName);
    setQrModalOpen(true);
  }

  function handleCloseQRModal() {
    setQrModalOpen(false);
    setQrActivityId(null);
    setQrActivityName('');
  }

  function getActiveFilterCount() {
    let count = 0;
    if (filters.type) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    return count;
  }

  function clearAllFilters() {
    setFilters({ type: '', from: '', to: '' });
    setQuery('');
  }

  const currentItems = React.useMemo(() => {
    let items = (data[tab] || []).filter(activity => activity.is_class_activity);
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        const name = (activityData.ten_hd || activityData.name || '').toLowerCase();
        return name.includes(lowerQuery);
      });
    }
    if (filters.type) {
      items = items.filter(activity => {
        const activityData = activity.hoat_dong || activity;
        const activityType = typeof activityData.loai === 'string'
          ? activityData.loai
          : (activityData.loai?.name || activityData.loai_hd?.ten_loai_hd || '');
        return activityType === filters.type;
      });
    }
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
    setPagination(prev => ({ ...prev, total: items.length }));
    return items;
  }, [data, tab, query, filters]);

  const paginatedItems = React.useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return currentItems.slice(start, end);
  }, [currentItems, pagination.page, pagination.limit]);

  React.useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [query, filters, tab]);

  function handlePageChange(newPage) {
    setPagination(prev => ({ ...prev, page: newPage }));
  }

  const totalActivities = data.pending.length + data.approved.length + data.joined.length + data.rejected.length;

  return {
    // state
    tab, setTab,
    data,
    loading, error,
    selectedActivityId, isModalOpen,
    qrModalOpen, qrActivityId, qrActivityName,
    query, setQuery,
    viewMode, setViewMode,
    showFilters, setShowFilters,
    filters, setFilters,
    activityTypes,
    statusViewMode, setStatusViewMode,
    pagination, setPagination,
    semester, setSemester,
    semesterOptions, currentSemester, isWritable,
    normalizedRole, canShowQR,

    // derived
    currentItems,
    paginatedItems,
    totalActivities,

    // actions
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
