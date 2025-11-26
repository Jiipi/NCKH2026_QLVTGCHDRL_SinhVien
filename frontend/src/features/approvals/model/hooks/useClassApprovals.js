import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import approvalsApi from '../../services/approvalsApi';

export function useClassApprovals(initialSemester) {
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  // Data states
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // UI and filter states
  const [semester, setSemester] = useState(initialSemester);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', from: '', to: '', mssv: '' });
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Data Fetching ---
  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await approvalsApi.getClassRegistrations({ semester });
    if (result.success) {
      setAllRegistrations(result.data);
    } else {
      setError('Không thể tải danh sách phê duyệt.');
      showError('Không thể tải danh sách phê duyệt.');
    }
    setLoading(false);
  }, [semester, showError]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  // --- Action Handlers ---
  const handleApprove = async (registration) => {
    const confirmed = await confirm({ title: 'Xác nhận', message: `Phê duyệt cho sinh viên ${registration.sinh_vien?.nguoi_dung?.ho_ten}?` });
    if (!confirmed) return;
    setProcessing(true);
    const result = await approvalsApi.approveRegistration(registration.id);
    if (result.success) {
      showSuccess('Phê duyệt thành công.');
      await loadRegistrations();
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  const handleReject = async (registration) => {
    const reason = prompt('Lý do từ chối (tùy chọn):') || 'Không đáp ứng yêu cầu';
    if (!reason) return; // User cancelled prompt
    setProcessing(true);
    const result = await approvalsApi.rejectRegistration(registration.id, reason);
    if (result.success) {
      showSuccess('Đã từ chối đăng ký.');
      await loadRegistrations();
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      showWarning('Vui lòng chọn ít nhất một đăng ký.');
      return;
    }
    const confirmed = await confirm({ title: 'Xác nhận', message: `Phê duyệt ${selectedIds.length} đăng ký đã chọn?` });
    if (!confirmed) return;

    setProcessing(true);
    const result = await approvalsApi.bulkApproveRegistrations(selectedIds);
    if (result.success) {
      showSuccess(`Đã phê duyệt ${result.data?.approved || selectedIds.length} đăng ký.`);
      setSelectedIds([]);
      await loadRegistrations();
    } else {
      showError(result.error);
    }
    setProcessing(false);
  };

  // --- Filtering Logic ---
  const filteredRegistrations = useMemo(() => {
    const statusMap = {
        pending: 'cho_duyet',
        approved: 'da_duyet',
        rejected: 'tu_choi',
        completed: 'da_tham_gia',
    };
    const currentStatus = statusMap[activeTab] || 'cho_duyet';

    return allRegistrations.filter(reg => {
      if (reg.trang_thai_dk !== currentStatus) return false;

      const student = reg.sinh_vien?.nguoi_dung;
      const activity = reg.hoat_dong;
      const mssv = reg.sinh_vien?.mssv || '';

      if (searchTerm && 
          !student?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !activity?.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !mssv.toLowerCase().includes(searchTerm.toLowerCase())
      ) return false;

      if (filters.mssv && !mssv.toLowerCase().includes(filters.mssv.toLowerCase())) return false;
      if (filters.type && activity?.loai_hd_id?.toString() !== filters.type) return false;
      if (filters.from && new Date(activity?.ngay_bd) < new Date(filters.from)) return false;
      if (filters.to && new Date(activity?.ngay_bd) > new Date(filters.to)) return false;

      return true;
    });
  }, [allRegistrations, activeTab, searchTerm, filters]);

  // --- Selection Logic ---
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleToggleSelectAll = () => {
    const pendingIds = filteredRegistrations.map(r => r.id);
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  return {
    // State
    loading, processing, error, semester, setSemester, activeTab, setActiveTab,
    searchTerm, setSearchTerm, filters, setFilters, selectedIds, setSelectedIds,
    // Data
    allRegistrations,
    filteredRegistrations,
    // Handlers
    handleApprove,
    handleReject,
    handleBulkApprove,
    handleToggleSelect,
    handleToggleSelectAll,
    refresh: loadRegistrations,
  };
}

