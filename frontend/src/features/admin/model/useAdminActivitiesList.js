/**
 * Admin Activities List Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho danh sách hoạt động admin
 * Dựa trên useStudentActivitiesList với thêm quyền admin
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import adminActivitiesApi from '../services/adminActivitiesApi';
import http from '../../../shared/api/http';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import useSemesterData, { useGlobalSemesterSync, setGlobalSemester, getGlobalSemester } from '../../../shared/hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../../shared/lib/semester';

const ACTIVITY_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'cho_duyet', label: '🟡 Chờ duyệt' },
  { value: 'da_duyet', label: '🟢 Đã duyệt' },
  { value: 'tu_choi', label: '🔴 Từ chối' },
  { value: 'da_huy', label: '⚫ Đã hủy' },
  { value: 'ket_thuc', label: '🟣 Kết thúc' }
];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'Toàn hệ thống' },
  { value: 'class', label: 'Theo lớp' }
];

// Option "Tất cả học kỳ" để xem toàn bộ hoạt động trong hệ thống
const ALL_SEMESTERS_OPTION = { value: '', label: '📊 Tất cả học kỳ' };

/**
 * Get initial semester from global storage or calculate current
 */
function loadInitialSemester() {
  const globalSemester = getGlobalSemester();
  if (globalSemester) return globalSemester;
  return getCurrentSemesterValue();
}

/**
 * Hook quản lý danh sách hoạt động cho admin
 */
export default function useAdminActivitiesList() {
  const { showSuccess, showError, confirm } = useNotification();
  
  // UI State
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '', from: '', to: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scopeTab, setScopeTab] = useState('all'); // 'all' | 'class'
  const [selectedClass, setSelectedClass] = useState('');
  
  // Semester with global sync - Admin có thể chọn "Tất cả học kỳ" (value = '')
  const [systemSemesterState, setSystemSemesterState] = useState('');
  const [classSemesterState, setClassSemesterState] = useState(() => loadInitialSemester());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activitiesGridRef = useRef(null);

  // Data State - allItems chứa tất cả hoạt động từ API (không phân trang)
  const [allItems, setAllItems] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const selectedSemester = scopeTab === 'class' ? classSemesterState : systemSemesterState;
  const { options: baseSemesterOptions, isWritable, currentSemester, loading: semesterLoading } = useSemesterData(
    selectedSemester || undefined
  );

  // Sync với global semester changes khi ở tab "Theo lớp"
  useGlobalSemesterSync(classSemesterState, setClassSemesterState);

  const fallbackClassSemester = useMemo(
    () => currentSemester || baseSemesterOptions[0]?.value || getCurrentSemesterValue(),
    [currentSemester, baseSemesterOptions]
  );

  useEffect(() => {
    if (scopeTab === 'class' && (!classSemesterState || classSemesterState === '')) {
      setClassSemesterState(fallbackClassSemester);
    }
  }, [scopeTab, classSemesterState, fallbackClassSemester]);

  // Thêm option "Tất cả học kỳ" cho tab hệ thống, loại bỏ ở tab theo lớp
  const semesterOptions = useMemo(() => {
    if (scopeTab === 'class') {
      return baseSemesterOptions;
    }
    return [ALL_SEMESTERS_OPTION, ...baseSemesterOptions];
  }, [baseSemesterOptions, scopeTab]);

  const handleSemesterSelect = useCallback(
    (value) => {
      if (scopeTab === 'class') {
        setClassSemesterState(value || fallbackClassSemester);
        // Broadcast globally để các form khác sync
        setGlobalSemester(value || fallbackClassSemester);
      } else {
        setSystemSemesterState(value ?? '');
        // Không broadcast "Tất cả học kỳ" cho các form khác vì nó chỉ dành cho Admin
        if (value) {
          setGlobalSemester(value);
        }
      }
    },
    [scopeTab, fallbackClassSemester]
  );

  // Không tự động đổi semester khi admin đã chọn "Tất cả học kỳ" (semester === '')

  // Load classes for filter
  const loadClasses = useCallback(async () => {
    try {
      // Sử dụng API endpoint mới /core/classes (thay vì /admin/classes đã deprecated)
      const res = await http.get('/core/classes');
      const payload = res.data?.data;
      const items = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : Array.isArray(res.data)
              ? res.data
              : [];
      setClasses(items);
    } catch (err) {
      console.warn('Không thể tải danh sách lớp', err);
      setClasses([]);
    }
  }, []);

  // Business logic: Load ALL activities (không phân trang từ API)
  // Lấy tất cả hoạt động theo bộ lọc, sau đó phân trang client-side
  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Gửi limit: 'all' để backend trả về tất cả hoạt động theo bộ lọc
      const params = {
        limit: 'all', // Lấy tất cả, không phân trang từ API
        search: query || undefined,
        status: filters.status || undefined,
        type: filters.type || undefined, // Backend expects 'type', not 'typeId'
        from: filters.from || undefined,
        to: filters.to || undefined,
        // Khi chọn tab "Theo lớp" + chọn lớp, gửi lop_id để backend filter theo lớp
        lop_id: scopeTab === 'class' && selectedClass ? selectedClass : undefined,
      };

      // Tab "Toàn hệ thống":
      // - Nếu chọn "Tất cả học kỳ" (systemSemesterState = '') thì không gửi semesterValue → lấy tất cả
      // - Nếu chọn học kỳ cụ thể thì gửi semesterValue để filter
      // Tab "Theo lớp":
      // - Luôn có học kỳ (classSemesterState), gửi semesterValue
      // - Hiển thị hoạt động đã duyệt trong học kỳ đó (giống view sinh viên)
      // - selectedClass chỉ để UI reference, không filter theo lớp (hoạt động chung cho tất cả)
      if (scopeTab === 'class') {
        // Tab theo lớp: bắt buộc có học kỳ
        params.semesterValue = classSemesterState || undefined;
        // Không ép status = 'da_duyet' tại FE nữa.
        // Mặc định (khi không chọn trạng thái) backend sẽ tự lọc da_duyet + ket_thuc cho đúng tổng hoạt động.
      } else {
        // Tab toàn hệ thống: semester có thể rỗng (Tất cả học kỳ)
        if (systemSemesterState) {
          params.semesterValue = systemSemesterState;
        }
        // Không gửi semesterValue nếu = '' để lấy tất cả hoạt động
      }

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      console.log('[AdminActivities] Loading ALL with params:', params);
      const resp = await adminActivitiesApi.listActivities(params);
      
      const envelope = resp?.data;
      const responseData = envelope?.data || envelope || {};
      
      const list = responseData?.items || responseData?.activities || (Array.isArray(responseData) ? responseData : []);
      console.log('[AdminActivities] Loaded', list?.length, 'total items');

      setAllItems(Array.isArray(list) ? list : []);
      // Reset về trang 1 khi load mới
      setPagination(prev => ({
        ...prev,
        page: 1,
        total: list?.length || 0
      }));
    } catch (err) {
      console.error('[AdminActivities] API Error:', err);
      setAllItems([]);
      setError(err.response?.data?.message || err.message || 'Lỗi tải dữ liệu hoạt động.');
      setPagination(prev => ({ ...prev, total: 0 }));
    }

    setLoading(false);
  }, [query, filters, scopeTab, systemSemesterState, classSemesterState, selectedClass]);

  // Business logic: Load activity types
  const loadActivityTypes = useCallback(async () => {
    try {
      const data = await adminActivitiesApi.getActivityTypes();
      const arr = data.activityTypes || data.items || data || [];
      setActivityTypes(Array.isArray(arr) ? arr : []);
    } catch (err) {
      setActivityTypes([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadClasses();
    loadActivityTypes();
  }, [loadClasses, loadActivityTypes]);

  // Load activities - semester có thể là '' (Tất cả học kỳ) hoặc giá trị cụ thể
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Admin Actions
  const handleApprove = useCallback(async (activityId, activityName) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận duyệt',
      message: `Bạn có chắc muốn duyệt hoạt động "${activityName}"?`,
    });

    if (!isConfirmed) return;

    try {
      await adminActivitiesApi.approveActivity(activityId);
      showSuccess('Đã duyệt hoạt động thành công!');
      loadActivities();
    } catch (err) {
      showError(err.message || 'Không thể duyệt hoạt động.');
    }
  }, [confirm, showSuccess, showError, loadActivities]);

  const handleReject = useCallback(async (activityId, activityName) => {
    const reason = window.prompt('Nhập lý do từ chối:', 'Không phù hợp yêu cầu');
    if (reason === null) return;

    try {
      await adminActivitiesApi.rejectActivity(activityId, reason);
      showSuccess('Đã từ chối hoạt động!');
      loadActivities();
    } catch (err) {
      showError(err.message || 'Không thể từ chối hoạt động.');
    }
  }, [showSuccess, showError, loadActivities]);

  const handleDelete = useCallback(async (activityId, activityName) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa hoạt động "${activityName}"? Hành động này không thể hoàn tác.`,
    });

    if (!isConfirmed) return;

    try {
      await adminActivitiesApi.deleteActivity(activityId);
      showSuccess('Đã xóa hoạt động!');
      loadActivities();
    } catch (err) {
      showError(err.message || 'Không thể xóa hoạt động.');
    }
  }, [confirm, showSuccess, showError, loadActivities]);

  // Business logic: Sort all items (đã có từ API, không cần filter thêm vì API đã filter)
  const sortedItems = useMemo(() => {
    return [...allItems].sort((a, b) => {
      switch (sortBy) {
        case 'oldest': {
          const dateA = new Date(a.ngay_tao || a.ngay_bd || 0).getTime();
          const dateB = new Date(b.ngay_tao || b.ngay_bd || 0).getTime();
          return dateA - dateB;
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
          const dateA = new Date(a.ngay_tao || a.ngay_bd || 0).getTime();
          const dateB = new Date(b.ngay_tao || b.ngay_bd || 0).getTime();
          return dateB - dateA;
        }
      }
    });
  }, [allItems, sortBy]);

  // Phân trang client-side: lấy items cho trang hiện tại
  const filteredItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, pagination.page, pagination.limit]);

  // Cập nhật total khi sortedItems thay đổi
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: sortedItems.length,
      // Điều chỉnh page nếu vượt quá số trang
      page: Math.min(prev.page, Math.max(1, Math.ceil(sortedItems.length / prev.limit)))
    }));
  }, [sortedItems.length]);

  // Reset page when filters change (đã xử lý trong loadActivities)

  // UI Handlers
  const handleViewDetail = useCallback((activityId) => {
    if (!activityId || isModalOpen) return;
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  }, [isModalOpen]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  }, []);

  const onSearch = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadActivities();
  }, [loadActivities]);

  const onFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (scopeTab === 'class' && selectedClass) count++;
    return count;
  }, [filters, scopeTab, selectedClass]);

  const clearAllFilters = useCallback(() => {
    setFilters({ type: '', status: '', from: '', to: '' });
    setQuery('');
    setScopeTab('all');
    setSelectedClass('');
    setSystemSemesterState('');
    setClassSemesterState(fallbackClassSemester);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [fallbackClassSemester]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  return {
    // State
    query,
    setQuery,
    filters,
    setFilters,
    activityTypes,
    classes,
    loading,
    error,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    pagination,
    setPagination,
    sortBy,
    setSortBy,
    semester: selectedSemester,
    setSemester: handleSemesterSelect,
    semesterOptions,
    semesterLoading,
    isWritable,
    selectedActivityId,
    isModalOpen,
    scopeTab,
    setScopeTab,
    selectedClass,
    setSelectedClass,
    filteredItems,        // Items cho trang hiện tại (đã phân trang)
    allItems: sortedItems, // Tất cả items (để tính stats)
    isTransitioning,
    setIsTransitioning,
    activitiesGridRef,

    // Actions
    onSearch,
    onFilterChange,
    getActiveFilterCount,
    clearAllFilters,
    handleApprove,
    handleReject,
    handleDelete,
    handleViewDetail,
    handleCloseModal,
    handlePageChange,
    handleLimitChange,
    reload: loadActivities,

    // Constants
    ACTIVITY_STATUS_OPTIONS,
    SCOPE_OPTIONS
  };
}
