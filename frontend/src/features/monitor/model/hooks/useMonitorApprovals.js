/**
 * Monitor Approvals Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho approvals lớp trưởng
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { monitorApprovalsApi } from '../../services/monitorApprovalsApi';
import { mapRegistrationToUI } from '../mappers/monitor.mappers';
import useSemesterData from '../../../../hooks/useSemesterData';
import { useNotification } from '../../../../contexts/NotificationContext';

/**
 * Hook quản lý approvals
 */
export function useMonitorApprovals() {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const typeCacheRef = useRef({});
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('pending');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activityDetailId, setActivityDetailId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [displayViewMode, setDisplayViewMode] = useState('grid');
  const [statusViewMode, setStatusViewMode] = useState('pills');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
  const [activityTypes, setActivityTypes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [scrollDown, setScrollDown] = useState(false);

  const getCurrentSemesterValue = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 7 && currentMonth <= 11) return `hoc_ky_1-${currentYear}`;
    else if (currentMonth === 12) return `hoc_ky_2-${currentYear}`;
    else if (currentMonth >= 1 && currentMonth <= 4) return `hoc_ky_2-${currentYear - 1}`;
    else return `hoc_ky_1-${currentYear}`;
  };
  const [semester, setSemester] = useState(getCurrentSemesterValue());
  const { options: semesterOptions, isWritable } = useSemesterData(semester);

  const statusLabels = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Từ chối',
    'da_tham_gia': 'Đã tham gia'
  };

  const statusColors = {
    'cho_duyet': 'bg-amber-50 text-amber-700 border-amber-200',
    'da_duyet': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'tu_choi': 'bg-rose-50 text-rose-700 border-rose-200',
    'da_tham_gia': 'bg-blue-50 text-blue-700 border-blue-200'
  };

  // Business logic: Load activity types
  const loadActivityTypes = useCallback(async () => {
    try {
      const result = await monitorApprovalsApi.getActivityTypes();
      if (result.success) {
        setActivityTypes(result.data || []);
      } else {
        setActivityTypes([]);
      }
    } catch (err) {
      console.error('Error loading activity types:', err);
      setActivityTypes([]);
    }
  }, []);

  // Business logic: Enrich activity types
  const enrichActivityTypes = useCallback(async (items) => {
    try {
      if (!Array.isArray(items) || items.length === 0) return items;
      const cache = typeCacheRef.current;
      const ids = Array.from(new Set(items.map(r => r?.hoat_dong?.id).filter(id => !!id)));
      const missingIds = ids.filter(id => !cache[id]);
      
      if (missingIds.length > 0) {
        const chunkSize = 5;
        for (let i = 0; i < missingIds.length; i += chunkSize) {
          const chunk = missingIds.slice(i, i + chunkSize);
          const results = await Promise.all(chunk.map(async (id) => {
            try {
              const result = await monitorApprovalsApi.getActivityDetail(id);
              if (result.success) {
                const data = result.data;
                const loai_hd_id = data?.loai_hd_id ?? data?.loai_hd?.id ?? null;
                const loai_hd = data?.loai_hd ?? null;
                return { id, loai_hd_id, loai_hd };
              }
              return { id, loai_hd_id: null, loai_hd: null };
            } catch (_) {
              return { id, loai_hd_id: null, loai_hd: null };
            }
          }));
          
          results.forEach(({ id, loai_hd_id, loai_hd }) => {
            cache[id] = { loai_hd_id, loai_hd };
          });
        }
      }
      
      return items.map(item => {
        const cached = cache[item?.hoat_dong?.id];
        if (cached) {
          return {
            ...item,
            hoat_dong: {
              ...item.hoat_dong,
              loai_hd_id: cached.loai_hd_id,
              loai_hd: cached.loai_hd
            }
          };
        }
        return item;
      });
    } catch (err) {
      console.error('Error enriching activity types:', err);
      return items;
    }
  }, []);

  // Business logic: Load registrations
  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await monitorApprovalsApi.getRegistrations({ status: 'all', semester });
      if (result.success) {
        const items = result.data.items || [];
        const enriched = await enrichActivityTypes(items);
        setRegistrations(enriched);
        setError('');
      } else {
        setError(result.error || 'Không thể tải danh sách đăng ký');
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Không thể tải danh sách đăng ký');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [semester, enrichActivityTypes]);

  // Business logic: Approve registration
  const handleApprove = useCallback(async (registration) => {
    try {
      setProcessing(true);
      if (!isWritable) return;
      
      const result = await monitorApprovalsApi.approve(registration.id);
      if (result.success) {
        await loadRegistrations();
        showSuccess(`Đã phê duyệt đăng ký cho ${registration.sinh_vien?.nguoi_dung?.ho_ten}`, 'Phê duyệt thành công');
      } else {
        showError(result.error || 'Không thể phê duyệt đăng ký');
      }
    } catch (err) {
      console.error('Error approving registration:', err);
      showError('Không thể phê duyệt đăng ký');
    } finally {
      setProcessing(false);
    }
  }, [isWritable, loadRegistrations, showSuccess, showError]);

  // Business logic: Reject registration
  const handleReject = useCallback(async (registration, reason) => {
    try {
      setProcessing(true);
      if (!isWritable) return;
      
      const result = await monitorApprovalsApi.reject(registration.id, reason);
      if (result.success) {
        await loadRegistrations();
        showSuccess(`Đã từ chối đăng ký của ${registration.sinh_vien?.nguoi_dung?.ho_ten}`, 'Từ chối thành công');
      } else {
        showError(result.error || 'Không thể từ chối đăng ký');
      }
    } catch (err) {
      console.error('Error rejecting registration:', err);
      showError('Không thể từ chối đăng ký');
    } finally {
      setProcessing(false);
    }
  }, [isWritable, loadRegistrations, showSuccess, showError]);

  // Business logic: Bulk approve
  const handleBulkApprove = useCallback(async () => {
    if (selectedIds.length === 0) return;
    if (!isWritable) return;
    
    const confirmed = await confirm(
      `Bạn có chắc muốn phê duyệt ${selectedIds.length} đăng ký?`,
      'Phê duyệt hàng loạt'
    );
    if (!confirmed) return;

    try {
      setProcessing(true);
      let approvedCount = 0;
      
      const result = await monitorApprovalsApi.bulkApprove(selectedIds);
      if (result.success) {
        approvedCount = result.data?.approved || selectedIds.length;
      } else {
        // Fallback: approve individually
        for (const id of selectedIds) {
          try {
            const individualResult = await monitorApprovalsApi.approve(id);
            if (individualResult.success) approvedCount++;
          } catch (_) {}
        }
      }
      
      await loadRegistrations();
      setSelectedIds([]);
      showSuccess(`Đã phê duyệt ${approvedCount}/${selectedIds.length} đăng ký`, 'Phê duyệt hàng loạt thành công');
    } catch (err) {
      console.error('Error bulk approving:', err);
      showError('Không thể phê duyệt hàng loạt');
    } finally {
      setProcessing(false);
    }
  }, [selectedIds, isWritable, loadRegistrations, showSuccess, showError, confirm]);

  // Business logic: Format date
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  }, []);

  // Business logic: Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (filters.minPoints) count++;
    if (filters.maxPoints) count++;
    if (filters.mssv) count++;
    return count;
  }, [filters]);

  // Business logic: Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
    setSearchTerm('');
  }, []);

  // Helper function: Role label
  const roleLabel = useCallback((role) => {
    switch (role) {
      case 'LOP_TRUONG': return 'Lớp trưởng';
      case 'GIANG_VIEN': return 'Giảng viên';
      case 'ADMIN': return 'Admin';
      default: return null;
    }
  }, []);

  // Business logic: Filter and sort registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const student = reg.sinh_vien?.nguoi_dung;
      const activity = reg.hoat_dong;
      const matchesSearch = (
        student?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity?.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.sinh_vien?.mssv?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      let matchesViewMode = false;
      switch (viewMode) {
        case 'pending': matchesViewMode = reg.trang_thai_dk === 'cho_duyet'; break;
        case 'approved': matchesViewMode = reg.trang_thai_dk === 'da_duyet'; break;
        case 'rejected': matchesViewMode = reg.trang_thai_dk === 'tu_choi'; break;
        case 'completed': matchesViewMode = reg.trang_thai_dk === 'da_tham_gia'; break;
        default: matchesViewMode = reg.trang_thai_dk === 'cho_duyet';
      }
      let matchesType = true, matchesDateFrom = true, matchesDateTo = true, matchesPointsMin = true, matchesPointsMax = true, matchesMSSV = true;
      if (filters.type) {
        const filterValue = filters.type; 
        const filterId = parseInt(filterValue);
        if (isNaN(filterId)) { 
          const activityTypeName = activity?.loai_hd?.ten_loai_hd || ''; 
          matchesType = activityTypeName.toLowerCase() === filterValue.toLowerCase(); 
        } else { 
          const activityTypeId = activity?.loai_hd_id || activity?.loai_hd?.id; 
          const activityId = activityTypeId ? parseInt(activityTypeId) : null; 
          matchesType = activityId !== null && activityId === filterId; 
        }
      }
      if (filters.from) { 
        const fromDate = new Date(filters.from); 
        const activityDate = activity?.ngay_bd ? new Date(activity.ngay_bd) : null; 
        matchesDateFrom = activityDate && activityDate >= fromDate; 
      }
      if (filters.to) { 
        const toDate = new Date(filters.to); 
        toDate.setHours(23,59,59,999); 
        const activityDate = activity?.ngay_bd ? new Date(activity.ngay_bd) : null; 
        matchesDateTo = activityDate && activityDate <= toDate; 
      }
      if (filters.minPoints) { 
        const minPoints = parseFloat(filters.minPoints); 
        if (!isNaN(minPoints)) { 
          const points = parseFloat(activity?.diem_rl) || 0; 
          matchesPointsMin = points >= minPoints; 
        } 
      }
      if (filters.maxPoints) { 
        const maxPoints = parseFloat(filters.maxPoints); 
        if (!isNaN(maxPoints)) { 
          const points = parseFloat(activity?.diem_rl) || 0; 
          matchesPointsMax = points <= maxPoints; 
        } 
      }
      if (filters.mssv) { 
        const mssv = reg.sinh_vien?.mssv || ''; 
        matchesMSSV = mssv.toLowerCase().includes(filters.mssv.toLowerCase()); 
      }
      return matchesSearch && matchesViewMode && matchesType && matchesDateFrom && matchesDateTo && matchesPointsMin && matchesPointsMax && matchesMSSV;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          const ta = new Date(a.ngay_duyet || a.updated_at || a.updatedAt || a.ngay_dang_ky || a.createdAt || a.tg_diem_danh || 0).getTime();
          const tb = new Date(b.ngay_duyet || b.updated_at || b.updatedAt || b.ngay_dang_ky || b.createdAt || b.tg_diem_danh || 0).getTime();
          return ta - tb;
        case 'name-az':
          const nameA = (a.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          const nameB = (b.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          return nameA.localeCompare(nameB, 'vi');
        case 'name-za':
          const nameA2 = (a.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          const nameB2 = (b.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase();
          return nameB2.localeCompare(nameA2, 'vi');
        case 'newest':
        default:
          const ta2 = new Date(a.ngay_duyet || a.updated_at || a.updatedAt || a.ngay_dang_ky || a.createdAt || a.tg_diem_danh || 0).getTime();
          const tb2 = new Date(b.ngay_duyet || b.updated_at || b.updatedAt || b.ngay_dang_ky || b.createdAt || b.tg_diem_danh || 0).getTime();
          return tb2 - ta2;
      }
    });
  }, [registrations, searchTerm, viewMode, filters, sortBy]);

  // Business logic: Paginate filtered results
  const paginatedRegistrations = useMemo(() => {
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    return filteredRegistrations.slice(startIdx, endIdx);
  }, [filteredRegistrations, page, limit]);

  // Business logic: Calculate stats
  const stats = useMemo(() => {
    return {
      total: registrations.length,
      pending: registrations.filter(r => r.trang_thai_dk === 'cho_duyet').length,
      approved: registrations.filter(r => r.trang_thai_dk === 'da_duyet').length,
      rejected: registrations.filter(r => r.trang_thai_dk === 'tu_choi').length,
      participated: registrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length
    };
  }, [registrations]);

  // Business logic: Toggle select all
  const handleToggleSelectAll = useCallback(() => {
    const pendingRegistrations = filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet');
    if (selectedIds.length === pendingRegistrations.length && pendingRegistrations.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingRegistrations.map(r => r.id));
    }
  }, [filteredRegistrations, selectedIds.length]);

  // Business logic: Toggle select
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  }, []);

  // Business logic: Approve with confirm
  const handleApproveWithConfirm = useCallback(async (registration) => {
    const confirmed = await confirm({
      title: 'Xác nhận phê duyệt',
      message: `Phê duyệt đăng ký của ${registration.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên'} tham gia hoạt động?`,
      confirmText: 'Phê duyệt',
      cancelText: 'Hủy'
    });
    if (confirmed) {
      await handleApprove(registration);
    }
  }, [confirm, handleApprove]);

  // Business logic: Reject with confirm
  const handleRejectWithConfirm = useCallback(async (registration) => {
    const reason = window.prompt('Lý do từ chối (tùy chọn):') || 'Không đáp ứng yêu cầu';
    const confirmed = await confirm({
      title: 'Xác nhận từ chối',
      message: `Từ chối đăng ký của ${registration.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên'}?\n\nLý do: ${reason}`,
      confirmText: 'Từ chối',
      cancelText: 'Hủy'
    });
    if (confirmed) {
      await handleReject(registration, reason);
    }
  }, [confirm, handleReject]);

  // Business logic: Bulk approve with confirm
  const handleBulkApproveWithConfirm = useCallback(async () => {
    if (selectedIds.length === 0) {
      showWarning('Vui lòng chọn ít nhất một đăng ký', 'Chưa chọn đăng ký');
      return;
    }
    await handleBulkApprove();
  }, [selectedIds.length, showWarning, handleBulkApprove]);

  // Effects
  useEffect(() => {
    loadRegistrations();
    loadActivityTypes();
    setPage(1);
  }, [semester, loadRegistrations, loadActivityTypes]);

  useEffect(() => {
    setPage(1);
  }, [viewMode, searchTerm, filters]);

  useEffect(() => {
    const onScroll = () => {
      const nearTop = window.scrollY < 100;
      const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 100);
      setScrollDown(nearTop && !nearBottom ? true : false);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollToggle = useCallback(() => {
    if (scrollDown) window.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [scrollDown]);

  return {
    // Data
    registrations,
    activityTypes,
    
    // State
    loading,
    processing,
    error,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    selectedDetail,
    setSelectedDetail,
    selectedIds,
    setSelectedIds,
    activityDetailId,
    setActivityDetailId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    displayViewMode,
    setDisplayViewMode,
    statusViewMode,
    setStatusViewMode,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    page,
    setPage,
    limit,
    setLimit,
    scrollDown,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    
    // Helpers
    statusLabels,
    statusColors,
    formatDate,
    getActiveFilterCount,
    clearAllFilters,
    handleScrollToggle,
    roleLabel,
    filteredRegistrations,
    paginatedRegistrations,
    stats,
    handleToggleSelectAll,
    handleToggleSelect,
    handleApproveWithConfirm,
    handleRejectWithConfirm,
    handleBulkApproveWithConfirm,
    
    // Actions
    loadRegistrations,
    handleApprove,
    handleReject,
    handleBulkApprove
  };
}

