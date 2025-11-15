import React from 'react';
import http from '../../../shared/api/http';
import { useNotification } from '../../../contexts/NotificationContext';
import useSemesterData from '../../../hooks/useSemesterData';

const ACTIVITY_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'open', label: '🟢 Đang mở đăng ký' },
  { value: 'soon', label: '🔵 Đang diễn ra' },
  { value: 'closed', label: '⚫ Đã kết thúc' }
];

function getCurrentSemesterValue() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 7 && currentMonth <= 11) return `hoc_ky_1-${currentYear}`;
  if (currentMonth === 12) return `hoc_ky_2-${currentYear}`;
  if (currentMonth >= 1 && currentMonth <= 4) return `hoc_ky_2-${currentYear - 1}`;
  return `hoc_ky_1-${currentYear}`;
}

export default function useStudentActivitiesList() {
  const { showSuccess, showError, confirm } = useNotification();
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ type: '', status: '', from: '', to: '' });
  const [items, setItems] = React.useState([]);
  const [activityTypes, setActivityTypes] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0 });
  const [role, setRole] = React.useState('');
  const [selectedActivityId, setSelectedActivityId] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [scopeTab] = React.useState('in-class');
  const [filteredItems, setFilteredItems] = React.useState([]);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const activitiesGridRef = React.useRef(null);

  const [semester, setSemester] = React.useState(getCurrentSemesterValue());
  const { options: semesterOptions, isWritable } = useSemesterData(semester);

  React.useEffect(() => {
    loadActivities();
    loadActivityTypes();
    http.get('/core/profile')
      .then(res => {
        const p = res.data?.data || res.data || {};
        const r = String(p?.role || p?.vai_tro?.ten_vt || '').toLowerCase();
        setRole(r);
      })
      .catch(() => setRole(''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  React.useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, semester]);

  React.useEffect(() => {
    const filtered = items.filter(activity => activity.is_class_activity === true);
    setFilteredItems(filtered);
    // eslint-disable-next-line no-console
    console.log('📊 Filtered activities:', {
      total: items.length,
      inClass: items.filter(a => a.is_class_activity).length,
      outClass: items.filter(a => !a.is_class_activity).length,
      currentTab: scopeTab,
      filteredCount: filtered.length
    });
  }, [items, scopeTab]);

  function loadActivityTypes() {
    http.get('/core/activity-types')
      .then(res => {
        let data = [];
        if (res.data?.success && res.data?.data) {
          const responseData = res.data.data;
          data = Array.isArray(responseData.items) ? responseData.items : (Array.isArray(responseData) ? responseData : []);
        } else if (res.data?.data) {
          const responseData = res.data.data;
          data = Array.isArray(responseData.items) ? responseData.items : (Array.isArray(responseData) ? responseData : []);
        }
        setActivityTypes(data);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.warn('Could not load activity types:', err);
        setActivityTypes([]);
      });
  }

  function loadActivities() {
    setLoading(true);
    setError('');
    setIsTransitioning(true);

    const params = {
      q: query || undefined,
      type: filters.type || undefined,
      status: filters.status || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      page: pagination.page,
      limit: pagination.limit,
      sort: 'ngay_cap_nhat',
      order: 'desc',
      semester: semester || undefined
    };

    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') delete params[key];
    });

    http.get('/activities', { params })
      .then(res => {
        const responseData = res.data?.data;
        let list = [];
        if (responseData && Array.isArray(responseData.items)) {
          list = responseData.items;
          setPagination(prev => ({ ...prev, total: responseData.total || 0 }));
        } else {
          list = Array.isArray(responseData) ? responseData : [];
          setPagination(prev => ({ ...prev, total: list.length }));
        }
        if (filters.type) {
          // eslint-disable-next-line no-console
          console.log('🔍 Filtered by type:', filters.type);
          // eslint-disable-next-line no-console
          console.log('📋 Activities returned:', list.map(a => ({ id: a.id, ten_hd: a.ten_hd, loai_hd_id: a.loai_hd_id, loai_hd: a.loai_hd, has_loai_hd: !!a.loai_hd })));
        }
        setItems(list);
      })
      .catch(err => {
        setItems([]);
        setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu hoạt động');
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setIsTransitioning(false), 300);
      });
  }

  function onSearch(e) {
    if (e && e.preventDefault) e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadActivities();
  }

  function onFilterChange(newFilters) {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }

  function getActiveFilterCount() {
    let count = 0;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    return count;
  }

  function clearAllFilters() {
    setFilters({ type: '', status: '', from: '', to: '' });
    setQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }

  async function handleRegister(activityId, activityName) {
    const confirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${activityName}"?`,
      confirmText: 'Đăng ký',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;
    http.post(`/activities/${activityId}/register`)
      .then(res => {
        if (res.data?.success) {
          showSuccess('Đăng ký thành công');
          loadActivities();
        } else {
          showSuccess(res.data?.message || 'Đăng ký thành công');
        }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('❌ Register Error Full:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          errors: err.response?.data?.errors
        });
        const firstValidation = err?.response?.data?.errors?.[0]?.message;
        const errorMsg = firstValidation || err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
        showError(errorMsg);
      });
  }

  function handleViewDetail(activityId) {
    if (!activityId || isModalOpen) return;
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  }

  function handlePageChange(newPage) {
    setPagination(prev => ({ ...prev, page: newPage }));
  }

  return {
    // data/state
    query, setQuery,
    filters, setFilters,
    activityTypes,
    loading, error,
    viewMode, setViewMode,
    showFilters, setShowFilters,
    pagination, setPagination,
    role,
    selectedActivityId,
    isModalOpen,
    scopeTab,
    filteredItems,
    isTransitioning,
    activitiesGridRef,
    semester, setSemester,
    semesterOptions, isWritable,

    // actions
    onSearch,
    onFilterChange,
    getActiveFilterCount,
    clearAllFilters,
    handleRegister,
    handleViewDetail,
    handleCloseModal,
    handlePageChange,
    reload: loadActivities,

    // constants
    ACTIVITY_STATUS_OPTIONS
  };
}
