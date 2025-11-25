/**
 * Teacher Registrations Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho phê duyệt đăng ký giáo viên
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherRegistrationsApi } from '../../services/teacherRegistrationsApi';
import { mapRegistrationToUI, groupRegistrationsByStatus } from '../mappers/teacher.mappers';
import useSemesterData from '../../../../hooks/useSemesterData';
import { activityTypesApi } from '../../../activity-types/services/activityTypesApi';

const SEMESTER_SESSION_KEY = 'current_semester';

const getCurrentSemesterValue = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 7 && currentMonth <= 11) return `hoc_ky_1-${currentYear}`;
  else if (currentMonth === 12) return `hoc_ky_2-${currentYear}`;
  else if (currentMonth >= 1 && currentMonth <= 4) return `hoc_ky_2-${currentYear - 1}`;
  else return `hoc_ky_1-${currentYear}`;
};

const loadInitialSemester = () => {
  try {
    return sessionStorage.getItem(SEMESTER_SESSION_KEY) || getCurrentSemesterValue();
  } catch {
    return getCurrentSemesterValue();
  }
};

export default function useTeacherRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [statusViewMode, setStatusViewMode] = useState('pills'); // 'pills', 'dropdown', 'compact'
  const [displayViewMode, setDisplayViewMode] = useState('grid'); // 'grid', 'list'
  const [semester, setSemester] = useState(() => loadInitialSemester());
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
  const [activityTypes, setActivityTypes] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name-az', 'name-za', 'points-high', 'points-low'
  const [activityDetailId, setActivityDetailId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { options: semesterOptions, isWritable } = useSemesterData(semester);

  const updateSemester = useCallback((value) => {
    setSemester(value);
    try {
      if (value) {
        sessionStorage.setItem(SEMESTER_SESSION_KEY, value);
      } else {
        sessionStorage.removeItem(SEMESTER_SESSION_KEY);
      }
    } catch (_) {}
  }, []);

  // Load activity types
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const types = await activityTypesApi.list();
        if (mounted) setActivityTypes(types);
      } catch (err) {
        console.error('[useTeacherRegistrations] load activity types failed', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Business logic: Load registrations
  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await teacherRegistrationsApi.listRegistrations({
        status: 'all',
        semester
      });
      
      if (result.success) {
        // API service trả về { success: true, data: { items, total, counts, pagination } }
        const items = Array.isArray(result.data?.items) ? result.data.items : [];
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useTeacherRegistrations] Raw API response:', {
            success: result.success,
            itemsCount: items.length,
            firstItem: items[0],
            dataStructure: result.data
          });
        }
        
        // Deduplicate by registration ID
        const seen = new Set();
        const uniqueItems = items.filter(reg => {
          if (!reg.id) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[useTeacherRegistrations] Registration without ID:', reg);
            }
            return true;
          }
          if (seen.has(reg.id)) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[useTeacherRegistrations] Duplicate registration found:', reg.id);
            }
            return false;
          }
          seen.add(reg.id);
          return true;
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useTeacherRegistrations] Loaded registrations:', uniqueItems.length, 'items');
          if (uniqueItems.length > 0) {
            console.log('[useTeacherRegistrations] Sample registration:', uniqueItems[0]);
          }
        }
        setRegistrations(uniqueItems);
        setError('');
      } else {
        console.error('[useTeacherRegistrations] Load error:', result.error);
        setError(result.error || 'Không thể tải danh sách đăng ký');
        setRegistrations([]);
      }
    } catch (err) {
      console.error('[useTeacherRegistrations] Load error:', err);
      setError(err?.message || 'Không thể tải danh sách đăng ký');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  // Business logic: Transform registrations
  const mappedRegistrations = useMemo(() => {
    if (!registrations || registrations.length === 0) {
      return [];
    }
    return registrations.map(mapRegistrationToUI);
  }, [registrations]);

  // Business logic: Filter and sort registrations
  const filteredRegistrations = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useTeacherRegistrations] Filtering registrations:', {
        total: mappedRegistrations.length,
        viewMode,
        searchTerm,
        filters
      });
    }
    
    const filtered = mappedRegistrations.filter(reg => {
      const student = reg.sinh_vien?.nguoi_dung || reg.sinh_vien;
      const activity = reg.hoat_dong;
      
      // Search filter
      const matchesSearch = !searchTerm || 
        (student?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity?.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.sinh_vien?.mssv?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // View mode filter
      let matchesViewMode = false;
      switch (viewMode) {
        case 'pending':
          matchesViewMode = reg.trang_thai_dk === 'cho_duyet';
          break;
        case 'approved':
          matchesViewMode = reg.trang_thai_dk === 'da_duyet';
          break;
        case 'rejected':
          matchesViewMode = reg.trang_thai_dk === 'tu_choi';
          break;
        default:
          matchesViewMode = true;
      }

      // Advanced filters
      let matchesAdvancedFilters = true;
      
      // MSSV filter
      if (filters.mssv && !reg.sinh_vien?.mssv?.toLowerCase().includes(filters.mssv.toLowerCase())) {
        matchesAdvancedFilters = false;
      }

      // Activity type filter
      if (filters.type) {
        const activityTypeId = activity?.loai_hd_id?.toString() || activity?.loai_hd?.id?.toString() || '';
        const activityTypeName = activity?.loai_hd?.ten_loai_hd || '';
        if (activityTypeId !== filters.type && activityTypeName !== filters.type) {
          matchesAdvancedFilters = false;
        }
      }

      // Date range filters
      if (filters.from && activity?.ngay_bd) {
        const activityDate = new Date(activity.ngay_bd);
        const fromDate = new Date(filters.from);
        if (activityDate < fromDate) {
          matchesAdvancedFilters = false;
        }
      }

      if (filters.to && activity?.ngay_bd) {
        const activityDate = new Date(activity.ngay_bd);
        const toDate = new Date(filters.to);
        if (activityDate > toDate) {
          matchesAdvancedFilters = false;
        }
      }

      // Points filters
      if (filters.minPoints && (!activity?.diem_rl || activity.diem_rl < parseFloat(filters.minPoints))) {
        matchesAdvancedFilters = false;
      }

      if (filters.maxPoints && (!activity?.diem_rl || activity.diem_rl > parseFloat(filters.maxPoints))) {
        matchesAdvancedFilters = false;
      }
      
      const matches = matchesSearch && matchesViewMode && matchesAdvancedFilters;
      if (!matches && process.env.NODE_ENV === 'development') {
        console.log('[useTeacherRegistrations] Registration filtered out:', {
          id: reg.id,
          status: reg.trang_thai_dk,
          viewMode,
          matchesSearch,
          matchesViewMode,
          matchesAdvancedFilters,
          studentName: student?.ho_ten,
          activityName: activity?.ten_hd
        });
      }
      return matches;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useTeacherRegistrations] Filtered result:', filtered.length, 'out of', mappedRegistrations.length);
    }
    
    return filtered.sort((a, b) => {
      // Sorting logic
      switch (sortBy) {
        case 'oldest':
          const ta = new Date(a.ngay_duyet || a.updated_at || a.updatedAt || a.ngay_dang_ky || a.createdAt || a.tg_diem_danh || 0).getTime();
          const tb = new Date(b.ngay_duyet || b.updated_at || b.updatedAt || b.ngay_dang_ky || b.createdAt || b.tg_diem_danh || 0).getTime();
          return ta - tb;
        case 'name-az':
          const nameA = ((a.sinh_vien?.nguoi_dung?.ho_ten || a.sinh_vien?.ho_ten) || '').toLowerCase();
          const nameB = ((b.sinh_vien?.nguoi_dung?.ho_ten || b.sinh_vien?.ho_ten) || '').toLowerCase();
          return nameA.localeCompare(nameB, 'vi');
        case 'name-za':
          const nameA2 = ((a.sinh_vien?.nguoi_dung?.ho_ten || a.sinh_vien?.ho_ten) || '').toLowerCase();
          const nameB2 = ((b.sinh_vien?.nguoi_dung?.ho_ten || b.sinh_vien?.ho_ten) || '').toLowerCase();
          return nameB2.localeCompare(nameA2, 'vi');
        case 'points-high':
          return (b.hoat_dong?.diem_rl || 0) - (a.hoat_dong?.diem_rl || 0);
        case 'points-low':
          return (a.hoat_dong?.diem_rl || 0) - (b.hoat_dong?.diem_rl || 0);
        case 'newest':
        default:
          const ta2 = new Date(a.ngay_duyet || a.updated_at || a.updatedAt || a.ngay_dang_ky || a.createdAt || a.tg_diem_danh || 0).getTime();
          const tb2 = new Date(b.ngay_duyet || b.updated_at || b.updatedAt || b.ngay_dang_ky || b.createdAt || b.tg_diem_danh || 0).getTime();
          return tb2 - ta2;
      }
    });
  }, [mappedRegistrations, searchTerm, viewMode, filters, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const statsResult = {
      total: registrations.length,
      pending: registrations.filter(r => r.trang_thai_dk === 'cho_duyet').length,
      approved: registrations.filter(r => r.trang_thai_dk === 'da_duyet').length,
      rejected: registrations.filter(r => r.trang_thai_dk === 'tu_choi').length
    };
    if (process.env.NODE_ENV === 'development') {
      console.log('[useTeacherRegistrations] Stats:', statsResult);
      if (registrations.length > 0) {
        const statusBreakdown = registrations.reduce((acc, r) => {
          const status = r.trang_thai_dk || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        console.log('[useTeacherRegistrations] Status breakdown:', statusBreakdown);
      }
    }
    return statsResult;
  }, [registrations]);

  // Toggle select
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    const pendingRegistrations = filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet');
    if (selectedIds.length === pendingRegistrations.length && pendingRegistrations.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingRegistrations.map(r => r.id));
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (filters.minPoints) count++;
    if (filters.maxPoints) count++;
    if (filters.mssv) count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
    setSearchTerm('');
  };

  // Business logic: Handle approve single
  const handleApprove = async (registration) => {
    setProcessing(true);
    try {
      const result = await teacherRegistrationsApi.approveRegistration(registration.id);
      if (result.success) {
        await loadRegistrations();
      } else {
        setError(result.error || 'Không thể phê duyệt đăng ký');
      }
    } catch (err) {
      console.error('[useTeacherRegistrations] Approve error:', err);
      setError(err?.message || 'Không thể phê duyệt đăng ký');
    } finally {
      setProcessing(false);
    }
  };

  // Business logic: Handle reject single
  const handleReject = async (registration, reason) => {
    setProcessing(true);
    try {
      const result = await teacherRegistrationsApi.rejectRegistration(registration.id, reason);
      if (result.success) {
        await loadRegistrations();
      } else {
        setError(result.error || 'Không thể từ chối đăng ký');
      }
    } catch (err) {
      console.error('[useTeacherRegistrations] Reject error:', err);
      setError(err?.message || 'Không thể từ chối đăng ký');
    } finally {
      setProcessing(false);
    }
  };

  // Business logic: Handle bulk approve
  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    setProcessing(true);
    try {
      const result = await teacherRegistrationsApi.bulkApprove({ registrationIds: selectedIds });
      if (result.success) {
        await loadRegistrations();
        setSelectedIds([]);
      } else {
        setError(result.error || 'Không thể phê duyệt hàng loạt');
      }
    } catch (err) {
      console.error('[useTeacherRegistrations] Bulk approve error:', err);
      setError(err?.message || 'Không thể phê duyệt hàng loạt');
    } finally {
      setProcessing(false);
    }
  };

  return {
    // Data
    registrations: filteredRegistrations,
    loading,
    error,
    stats,
    
    // UI State
    searchTerm,
    viewMode,
    statusViewMode,
    displayViewMode,
    semester,
    semesterOptions,
    isWritable,
    selectedIds,
    processing,
    showFilters,
    filters,
    activityTypes,
    sortBy,
    activityDetailId,
    isDetailModalOpen,
    
    // Setters
    setSearchTerm,
    setViewMode: (v) => { setViewMode(v); setSelectedIds([]); },
    setStatusViewMode,
    setDisplayViewMode,
    setSemester: updateSemester,
    setSelectedIds,
    setShowFilters,
    setFilters,
    setSortBy,
    setActivityDetailId,
    setIsDetailModalOpen,
    
    // Actions
    handleToggleSelect,
    handleToggleSelectAll,
    handleApprove,
    handleReject,
    handleBulkApprove,
    loadRegistrations,
    getActiveFilterCount,
    clearAllFilters
  };
}
