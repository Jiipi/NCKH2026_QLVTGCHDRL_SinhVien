import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import activitiesApi from '../services/activitiesApi';

export function useTeacherActivities(initialSemester) {
  const { showSuccess, showError, confirm } = useNotification();

  // Data states
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // For approve/reject actions
  const [error, setError] = useState('');

  // UI and filter states
  const [semester, setSemester] = useState(initialSemester);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // --- Data Fetching ---
  const fetchActivities = useCallback(async (pageToFetch = pagination.page) => {
    setLoading(true);
    setError('');
    const params = {
      page: pageToFetch,
      limit: pagination.limit,
      semester: semester || undefined,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
    };
    const result = await activitiesApi.listActivities(params);
    if (result.success) {
      setActivities(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } else {
      setError('Không thể tải danh sách hoạt động.');
      showError('Không thể tải danh sách hoạt động.');
    }
    setLoading(false);
  }, [semester, pagination.limit, searchTerm, statusFilter, typeFilter, showError]);

  useEffect(() => {
    fetchActivities(1); // Fetch page 1 when filters change
  }, [semester, searchTerm, statusFilter, typeFilter, pagination.limit]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchActivities(newPage);
  };

  // --- Action Handlers ---
  const handleApprove = async (activityId) => {
    const isConfirmed = await confirm({ title: 'Xác nhận', message: 'Bạn có chắc chắn muốn phê duyệt hoạt động này?' });
    if (!isConfirmed) return;

    setProcessing(true);
    const result = await activitiesApi.approveActivity(activityId);
    if (result.success) {
      showSuccess('Phê duyệt hoạt động thành công!');
      fetchActivities(); // Refresh list
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  const handleReject = async (activityId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason || !reason.trim()) return;

    setProcessing(true);
    const result = await activitiesApi.rejectActivity(activityId, reason.trim());
    if (result.success) {
      showSuccess('Từ chối hoạt động thành công!');
      fetchActivities(); // Refresh list
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  return {
    // State
    activities,
    loading,
    processing,
    error,
    pagination,
    // Filters & Handlers
    semester, setSemester,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    // Actions
    handleApprove,
    handleReject,
    handlePageChange,
    refresh: fetchActivities,
  };
}

