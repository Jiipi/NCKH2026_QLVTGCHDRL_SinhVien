import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import teacherApprovalApi from '../../services/teacherApprovalApi';
import { getCurrentSemesterValue } from '../../../../shared/lib/semester';
import { useDataChangeListener, useAutoRefresh } from '../../../../shared/lib/dataRefresh';

const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối'
};

const STATUS_COLORS = {
  cho_duyet: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  da_duyet: 'bg-green-100 text-green-800 border-green-200',
  tu_choi: 'bg-red-100 text-red-800 border-red-200'
};

export default function useTeacherActivityApprovalPage() {
  const { showSuccess } = useNotification();
  const [viewMode, setViewMode] = useState('pending');
  const [statusViewMode, setStatusViewMode] = useState('pills');
  const [displayViewMode, setDisplayViewMode] = useState('grid');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState(() => getCurrentSemesterValue(true));
  const [sortBy, setSortBy] = useState('newest');
  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', activityId: null, title: '', message: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ isOpen: false, activity: null });
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 });

  // Sync semester with currentSemester from API when available
  useEffect(() => {
    if (currentSemester && semesterOptions.length > 0) {
      const currentInOptions = semesterOptions.some(opt => opt.value === currentSemester);
      if (currentInOptions && semester !== currentSemester) {
        setSemester(currentSemester);
      }
    }
  }, [currentSemester, semesterOptions, semester]);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await teacherApprovalApi.getHistory({ semester, search: searchTerm });
      if (result.success) {
        const list = Array.isArray(result.data) ? result.data : [];
        setActivities(list);
        const total = list.length;
        const pending = list.filter(a => a.trang_thai === 'cho_duyet').length;
        const approved = list.filter(a => a.trang_thai === 'da_duyet').length;
        const rejected = list.filter(a => a.trang_thai === 'tu_choi').length;
        setStats({ total, pending, approved, rejected });
        setPagination(prev => {
          const maxPage = Math.max(1, Math.ceil(Math.max(total, 1) / prev.limit));
          return { ...prev, total, page: Math.min(prev.page, maxPage) };
        });
      } else {
        setActivities([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
        setError(result.error || 'Không thể tải danh sách hoạt động');
      }
    } catch (err) {
      console.error('Error loading activities:', err);
      setActivities([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      setError('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
  }, [semester, searchTerm]);

  // Only load after semester is synced with backend
  const [semesterReady, setSemesterReady] = useState(false);
  
  useEffect(() => {
    // Wait for semester options to load, then check if current semester matches
    if (semesterOptions.length > 0) {
      // If currentSemester is available and semester matches, or no currentSemester yet
      if (!currentSemester || semester === currentSemester) {
        setSemesterReady(true);
      }
    }
  }, [semesterOptions.length, currentSemester, semester]);

  useEffect(() => {
    if (semesterReady) {
      loadActivities();
    }
  }, [loadActivities, semesterReady]);

  // Auto-reload when approvals data changes from other components (same tab)
  useDataChangeListener(['ACTIVITIES', 'APPROVALS', 'REGISTRATIONS'], loadActivities, { debounceMs: 500 });

  // Auto-refresh for cross-user/cross-role sync (when LOP_TRUONG creates new activity)
  // Polls every 30 seconds and on window focus/visibility
  useAutoRefresh(loadActivities, { 
    intervalMs: 30000, 
    enabled: semesterReady,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  const filteredActivities = useMemo(() => {
    const base = activities
      .filter(activity => {
        let matchesViewMode = false;
        switch (viewMode) {
          case 'pending':
            matchesViewMode = activity.trang_thai === 'cho_duyet';
            break;
          case 'approved':
            matchesViewMode = activity.trang_thai === 'da_duyet';
            break;
          case 'rejected':
            matchesViewMode = activity.trang_thai === 'tu_choi';
            break;
          default:
            matchesViewMode = activity.trang_thai === 'cho_duyet';
        }
        const matchesSearch = activity.ten_hd.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesViewMode && matchesSearch;
      });

    return [...base].sort((a, b) => {
      switch (sortBy) {
        case 'oldest': {
          const ta = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
          const tb = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
          return ta - tb;
        }
        case 'name-az': {
          const na = (a.ten_hd || '').toLowerCase();
          const nb = (b.ten_hd || '').toLowerCase();
          return na.localeCompare(nb, 'vi');
        }
        case 'name-za': {
          const na = (a.ten_hd || '').toLowerCase();
          const nb = (b.ten_hd || '').toLowerCase();
          return nb.localeCompare(na, 'vi');
        }
        case 'newest':
        default: {
          const ta = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
          const tb = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
          return tb - ta;
        }
      }
    });
  }, [activities, viewMode, searchTerm, sortBy]);

  useEffect(() => {
    setPagination(prev => {
      const total = filteredActivities.length;
      const maxPage = Math.max(1, Math.ceil(Math.max(total, 1) / prev.limit));
      const nextPage = Math.min(prev.page, maxPage);
      if (prev.total === total && nextPage === prev.page) return prev;
      return { ...prev, total, page: nextPage };
    });
  }, [filteredActivities.length, pagination.limit]);

  const paginatedActivities = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredActivities.slice(start, start + pagination.limit);
  }, [filteredActivities, pagination.page, pagination.limit]);

  // Bỏ giới hạn hiển thị: luôn hiển thị toàn bộ danh sách hoạt động cho phê duyệt
  useEffect(() => {
    setPagination(prev => {
      const total = filteredActivities.length;
      if (!total) {
        return { ...prev, limit: 0, total: 0, page: 1 };
      }
      if (prev.limit === total && prev.total === total) return prev;
      return { ...prev, limit: total, total, page: 1 };
    });
  }, [filteredActivities.length]);

  const handleApproveClick = (activityId) => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      activityId,
      title: 'Xác nhận phê duyệt',
      message: 'Bạn có chắc chắn muốn phê duyệt hoạt động này không?'
    });
  };

  const handleRejectClick = (activityId) => {
    setRejectReason('');
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      activityId,
      title: 'Xác nhận từ chối',
      message: 'Vui lòng nhập lý do từ chối hoạt động này:'
    });
  };

  const handleConfirmAction = useCallback(async () => {
    const { type, activityId } = confirmModal;
    if (!activityId) return;
    try {
      if (type === 'approve') {
        const result = await teacherApprovalApi.approve(activityId);
        if (!result.success) {
          setToast({ isOpen: true, message: result.error || 'Không thể phê duyệt hoạt động', type: 'error' });
          return;
        }
        showSuccess('Phê duyệt hoạt động thành công!');
      } else if (type === 'reject') {
        if (!rejectReason.trim()) {
          setToast({ isOpen: true, message: 'Vui lòng nhập lý do từ chối', type: 'warning' });
          return;
        }
        const result = await teacherApprovalApi.reject(activityId, rejectReason.trim());
        if (!result.success) {
          setToast({ isOpen: true, message: result.error || 'Không thể từ chối hoạt động', type: 'error' });
          return;
        }
        showSuccess('Từ chối hoạt động thành công!');
      }
      setConfirmModal({ isOpen: false, type: '', activityId: null, title: '', message: '' });
      setRejectReason('');
      // Small delay to ensure backend has committed changes, then reload
      setTimeout(() => loadActivities(), 100);
    } catch (err) {
      console.error('Error processing activity:', err);
      setToast({ isOpen: true, message: 'Không thể xử lý hoạt động. Vui lòng thử lại.', type: 'error' });
    }
  }, [confirmModal, rejectReason, loadActivities, showSuccess]);

  const handleViewDetail = (activity) => {
    setDetailModal({ isOpen: true, activity });
  };

  const handleCloseDetail = () => {
    setDetailModal({ isOpen: false, activity: null });
  };

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('[useTeacherActivityApprovalPage] Failed to format date', error);
      return '—';
    }
  }, []);

  return {
    // data
    stats,
    activities: paginatedActivities,
    filteredActivities,
    loading,
    error,

    // states
    viewMode,
    statusViewMode,
    displayViewMode,
    searchTerm,
    semester,
    pagination,
    confirmModal,
    rejectReason,
    toast,
    detailModal,

    // setters / actions
    setViewMode,
    setStatusViewMode,
    setDisplayViewMode,
    setSearchTerm,
    setSemester,
    setPagination,
    sortBy,
    setSortBy,
    setConfirmModal,
    setRejectReason,
    setToast,
    handleApproveClick,
    handleRejectClick,
    handleConfirmAction,
    handleViewDetail,
    handleCloseDetail,
    reloadActivities: loadActivities,
    semesterOptions,
    isWritable,
    statusLabels: STATUS_LABELS,
    statusColors: STATUS_COLORS,
    formatDate
  };
}

