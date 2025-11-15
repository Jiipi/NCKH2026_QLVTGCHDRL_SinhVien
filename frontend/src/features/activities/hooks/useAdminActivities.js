import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import activitiesApi from '../services/activitiesApi';

export function useAdminActivities() {
  const { showSuccess, showError, confirm } = useNotification();

  // Data states
  const [activities, setActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Filter and pagination states
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    typeId: '',
    semester: (() => {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      if (m >= 7 && m <= 11) return `hoc_ky_1-${y}`;
      if (m === 12) return `hoc_ky_2-${y}`;
      return `hoc_ky_1-${y - 1}`;
    })(),
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });

  // --- Data Fetching ---
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      typeId: filters.typeId || undefined,
      semester: filters.semester || undefined,
    };
    const result = await activitiesApi.listAdminActivities(params);
    if (result.success) {
      setActivities(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } else {
      setError('Không thể tải danh sách hoạt động.');
      showError('Lỗi tải dữ liệu hoạt động.');
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, filters, showError]);

  const fetchActivityTypes = useCallback(async () => {
    const result = await activitiesApi.getActivityTypes();
    if (result.success) {
      setActivityTypes(result.data);
    } else {
      showError('Không thể tải danh sách loại hoạt động.');
    }
  }, [showError]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivityTypes();
  }, [fetchActivityTypes]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePaginationChange = (key, value) => {
    setPagination(prev => ({ ...prev, [key]: value }));
  };

  // --- Action Handlers ---
  const handleDelete = async (activityId) => {
    const isConfirmed = await confirm({ title: 'Xác nhận xóa', message: 'Bạn có chắc chắn muốn xóa hoạt động này?' });
    if (!isConfirmed) return;

    setProcessing(true);
    const result = await activitiesApi.deleteAdminActivity(activityId);
    if (result.success) {
      showSuccess('Đã xóa hoạt động thành công.');
      fetchActivities(); // Refresh list
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  const handleApprove = async (activityId) => {
    setProcessing(true);
    const result = await activitiesApi.approveAdminActivity(activityId);
    if (result.success) {
      showSuccess('Đã duyệt hoạt động.');
      fetchActivities();
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  const handleReject = async (activityId) => {
    const reason = prompt('Nhập lý do từ chối:', 'Không phù hợp yêu cầu');
    if (reason === null) return;

    setProcessing(true);
    const result = await activitiesApi.rejectAdminActivity(activityId, reason);
    if (result.success) {
      showSuccess('Đã từ chối hoạt động.');
      fetchActivities();
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  return {
    activities, activityTypes,
    loading, processing, error,
    filters, pagination,
    handleFilterChange, handlePaginationChange,
    handleDelete, handleApprove, handleReject,
    refresh: fetchActivities,
  };
}

