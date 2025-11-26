/**
 * Student Activities List Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho danh sách hoạt động sinh viên
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import activitiesApi from '../../../activities/services/activitiesApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import useSemesterData from '../../../../shared/hooks/useSemesterData';

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

/**
 * Hook quản lý danh sách hoạt động cho sinh viên
 */
export default function useStudentActivitiesList() {
  const { showSuccess, showError, confirm } = useNotification();
  
  // UI State
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '', from: '', to: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scopeTab] = useState('in-class');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activitiesGridRef = useRef(null);

  // Data State - allItems chứa tất cả hoạt động từ API (không phân trang)
  const [allItems, setAllItems] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [role, setRole] = useState('');

  // Semester
  const [semester, setSemester] = useState(getCurrentSemesterValue());
  const { options: semesterOptions, isWritable } = useSemesterData(semester);

  // Business logic: Load ALL activities (không phân trang từ API)
  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      limit: 'all', // Lấy tất cả, không phân trang từ API
      sort: 'ngay_bd',
      order: 'asc',
      semester: semester || undefined,
    };

    // Remove empty params
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    const result = await activitiesApi.listActivities(params);

    if (result.success) {
      setAllItems(result.data || []);
      setPagination(prev => ({ ...prev, page: 1, total: result.data?.length || 0 }));
    } else {
      setAllItems([]);
      setError(result.error || 'Lỗi tải dữ liệu hoạt động.');
      setPagination(prev => ({ ...prev, total: 0 }));
    }

    setLoading(false);
  }, [semester]);

  // Business logic: Load activity types
  const loadActivityTypes = useCallback(async () => {
    const result = await activitiesApi.getActivityTypes();
    if (result.success) {
      setActivityTypes(result.data);
    }
  }, []);

  // Load role (tạm thời để trống, có thể thêm vào API service nếu cần)
  // Note: Role thường được lấy từ auth context hoặc session storage
  // Không nên gọi API chỉ để lấy role trong hook này
  useEffect(() => {
    // Role sẽ được lấy từ session storage hoặc auth context
    // Nếu cần, có thể thêm vào studentProfileApi
    setRole(''); // Tạm thời để trống
  }, []);

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    loadActivityTypes();
  }, [loadActivityTypes]);

  // Business logic: Handle register
  const handleRegister = useCallback(async (activityId, activityName) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${activityName}"?`,
    });

    if (!isConfirmed) return;

    const result = await activitiesApi.registerForActivity(activityId);

    if (result.success) {
      showSuccess('Đăng ký thành công!');
      loadActivities();
    } else {
      showError(result.error || 'Đăng ký thất bại.');
    }
  }, [confirm, showSuccess, showError, loadActivities]);

  // Business logic: Filter and sort items (client-side)
  const sortedItems = useMemo(() => {
    let filtered = [...allItems];

    // Filter by scope (in-class)
    if (scopeTab === 'in-class') {
      filtered = filtered.filter(item => item.is_class_activity !== false);
    }

    // Search filter
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(item => {
        const name = (item.ten_hd || item.name || '').toLowerCase();
        return name.includes(lowerQuery);
      });
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(item => {
        const type = typeof item.loai === 'string'
          ? item.loai
          : (item.loai?.name || item.loai_hd?.ten_loai_hd || '');
        return type === filters.type;
      });
    }

    // Status filter
    if (filters.status) {
      const now = new Date();
      filtered = filtered.filter(item => {
        const startDate = item.ngay_bd ? new Date(item.ngay_bd) : null;
        const endDate = item.ngay_kt ? new Date(item.ngay_kt) : null;
        const deadline = item.han_dk ? new Date(item.han_dk) : null;

        switch (filters.status) {
          case 'open':
            return item.trang_thai === 'da_duyet' && 
                   (!deadline || deadline > now) && 
                   (!startDate || startDate > now);
          case 'soon':
            return startDate && endDate && startDate <= now && endDate >= now;
          case 'closed':
            return endDate && endDate < now;
          default:
            return true;
        }
      });
    }

    // Date filters
    if (filters.from) {
      const fromDate = new Date(filters.from);
      filtered = filtered.filter(item => {
        const startDate = item.ngay_bd ? new Date(item.ngay_bd) : null;
        return startDate && startDate >= fromDate;
      });
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      filtered = filtered.filter(item => {
        const startDate = item.ngay_bd ? new Date(item.ngay_bd) : null;
        return startDate && startDate <= toDate;
      });
    }

    // Sort by start date
    filtered.sort((a, b) => {
      const dateA = new Date(a.ngay_bd || 0);
      const dateB = new Date(b.ngay_bd || 0);
      return dateA - dateB;
    });

    return filtered;
  }, [allItems, scopeTab, query, filters]);

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
      page: Math.min(prev.page, Math.max(1, Math.ceil(sortedItems.length / prev.limit)))
    }));
  }, [sortedItems.length]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [query, filters, semester]);

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
    // Client-side filtering - just reset page, no need to reload
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const onFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    return count;
  }, [filters]);

  const clearAllFilters = useCallback(() => {
    setFilters({ type: '', status: '', from: '', to: '' });
    setQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  return {
    // State
    query,
    setQuery,
    filters,
    setFilters,
    activityTypes,
    loading,
    error,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    pagination,
    setPagination,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    role,
    selectedActivityId,
    isModalOpen,
    scopeTab,
    filteredItems,
    isTransitioning,
    setIsTransitioning,
    activitiesGridRef,

    // Actions
    onSearch,
    onFilterChange,
    getActiveFilterCount,
    clearAllFilters,
    handleRegister,
    handleViewDetail,
    handleCloseModal,
    handlePageChange,
    reload: loadActivities,

    // Constants
    ACTIVITY_STATUS_OPTIONS
  };
}

