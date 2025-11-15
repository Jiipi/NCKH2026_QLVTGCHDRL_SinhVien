import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import activitiesApi from '../services/activitiesApi';

export function useClassActivities(initialSemester) {
  const { showSuccess, showError, confirm } = useNotification();

  // --- State Management ---
  // Data states
  const [managedActivities, setManagedActivities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI and filter states
  const [activeTab, setActiveTab] = useState('cho_duyet'); // 'co_san', 'cho_duyet', 'da_duyet', etc.
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [semester, setSemester] = useState(initialSemester);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // --- Data Fetching Callbacks ---
  const loadManagedActivities = useCallback(async () => {
    const params = { semester, page: pagination.page, limit: pagination.limit };
    const result = await activitiesApi.getClassActivities(params);
    if (result.success) {
      setManagedActivities(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } else {
      setError('Không thể tải hoạt động của lớp.');
    }
  }, [semester, pagination.page, pagination.limit]);

  const loadAvailableActivities = useCallback(async () => {
    const params = { semester, page: pagination.page, limit: pagination.limit };
    // Using the generic listActivities and we will filter client-side for now
    // In a real scenario, the backend should provide an endpoint for this.
    const result = await activitiesApi.listActivities(params);
    if (result.success) {
        // Assuming backend provides `is_class_activity` flag
        const classAvailable = result.data.filter(a => a.is_class_activity === true);
        setAvailableActivities(classAvailable);
    } else {
      setError('Không thể tải hoạt động có sẵn.');
    }
  }, [semester, pagination.page, pagination.limit]);

  const loadDashboardStats = useCallback(async () => {
    const result = await activitiesApi.getClassDashboardStats(semester);
    if (result.success) {
      setDashboardStats(result.data.summary || {});
    }
  }, [semester]);

  const loadActivityTypes = useCallback(async () => {
    const result = await activitiesApi.getActivityTypes();
    if (result.success) {
      setActivityTypes(result.data);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadManagedActivities(),
      loadAvailableActivities(),
      loadDashboardStats(),
      loadActivityTypes(),
    ]);
    setLoading(false);
  }, [loadManagedActivities, loadAvailableActivities, loadDashboardStats, loadActivityTypes]);

  // --- Effects for Data Loading ---
  useEffect(() => {
    refreshAll();
  }, [semester, pagination.page, pagination.limit]); // Refresh when semester or page changes

  // --- CRUD and Action Handlers ---
  const handleDeleteActivity = async (activity) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa hoạt động "${activity.ten_hd}"?`,
    });
    if (!confirmed) return;

    const result = await activitiesApi.deleteActivity(activity.id);
    if (result.success) {
      showSuccess('Đã xóa hoạt động thành công.');
      refreshAll();
    } else {
      showError(result.error);
    }
  };
  
  const handleRegister = async (activityId, activityName) => {
    const confirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${activityName}"?`,
    });
    if (!confirmed) return;

    const result = await activitiesApi.registerForActivity(activityId);
    if (result.success) {
      showSuccess('Đăng ký thành công!');
      refreshAll();
    } else {
      showError(result.error);
    }
  };

  // --- Memoized Filtering Logic ---
  const filteredActivities = useMemo(() => {
    const sourceActivities = activeTab === 'co_san' ? availableActivities : managedActivities;
    
    return sourceActivities.filter(activity => {
        const matchesStatus = activeTab === 'co_san' ? activity.trang_thai === 'da_duyet' : activity.trang_thai === activeTab;
        if (!matchesStatus) return false;

        const matchesSearch = searchTerm ? activity.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        if (!matchesSearch) return false;

        if (filters.type && activity.loai_hd_id?.toString() !== filters.type) return false;
        if (filters.from && new Date(activity.ngay_bd) < new Date(filters.from)) return false;
        if (filters.to && new Date(activity.ngay_bd) > new Date(filters.to)) return false;

        return true;
    });
  }, [activeTab, availableActivities, managedActivities, searchTerm, filters]);

  return {
    // State
    loading, error, semester, setSemester, activeTab, setActiveTab, searchTerm, setSearchTerm, filters, setFilters,
    activityTypes, dashboardStats, pagination, setPagination,
    // Data
    managedActivities,
    availableActivities,
    filteredActivities,
    // Handlers
    handleDeleteActivity,
    handleRegister,
    refreshAll,
  };
}

