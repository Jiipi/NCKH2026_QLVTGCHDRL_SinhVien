import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Edit, Trash2, Eye, Plus, Search, Filter, Users, Clock, MapPin, Award, AlertCircle, CheckCircle, XCircle, QrCode, X, Sparkles, TrendingUp, Activity as ActivityIcon, Save, SlidersHorizontal, RefreshCw, Grid3X3, List, Trophy } from 'lucide-react';
import { UserPlus } from 'lucide-react';
import http from '../../../shared/api/http';
import useSemesterData from '../../../hooks/useSemesterData';
import { useNotification } from '../../../contexts/NotificationContext';
import ActivityQRModal from '../../../components/ActivityQRModal';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import FileUpload from '../../../shared/ui/FileUpload';
import { getActivityImage } from '../../../shared/lib/activityImages';
import Pagination from '../../../shared/components/common/Pagination';

export default function MonitorActivityOversightPage() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const [activities, setActivities] = useState([]); // Hoạt động của lớp (do lớp tạo)
  const [availableActivities, setAvailableActivities] = useState([]); // Hoạt động có sẵn để đăng ký (như sinh viên)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('cho_duyet'); // Default: 'cho_duyet'
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [displayViewMode, setDisplayViewMode] = useState('grid'); // 'grid' or 'list'
  const [statusViewMode, setStatusViewMode] = useState('pills'); // 'pills' | 'dropdown' | 'compact'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [activityTypes, setActivityTypes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
  const [availablePagination, setAvailablePagination] = useState({ page: 1, limit: 100, total: 0 });

  // ✅ Add semester filter - sync with backend current semester
  const [semester, setSemester] = useState(() => {
    try {
      return sessionStorage.getItem('current_semester') || '';
    } catch (_) {
      return '';
    }
  });
  
  // ✅ Add dashboard stats state to get accurate total activities count
  const [dashboardStats, setDashboardStats] = useState({
    totalActivities: 0,
    approvedCount: 0,
    endedCount: 0
  });

  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);
  
  // Sync with backend-reported current semester
  useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester]);
  
  // Persist selection for other pages/tabs in the session
  useEffect(() => {
    if (semester) {
      try {
        sessionStorage.setItem('current_semester', semester);
      } catch (_) {}
    }
  }, [semester]);

  // Status mappings (matching Prisma TrangThaiHoatDong enum)
  const statusLabels = {
  'co_san': 'Hoạt động có sẵn',
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Bị từ chối',
    'da_huy': 'Đã hủy',
    'ket_thuc': 'Kết thúc'
  };

  const statusColors = {
  'co_san': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'cho_duyet': 'bg-amber-50 text-amber-700 border-amber-200',
    'da_duyet': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'tu_choi': 'bg-rose-50 text-rose-700 border-rose-200',
    'da_huy': 'bg-slate-50 text-slate-700 border-slate-200',
    'ket_thuc': 'bg-purple-50 text-purple-700 border-purple-200'
  };

  useEffect(() => {
    loadActivities();
    loadAvailableActivities(); // Load hoạt động có sẵn để đăng ký
    loadDashboardStats(); // ✅ Load dashboard stats for accurate counts
    loadActivityTypes();
  }, [semester, pagination.page, pagination.limit, availablePagination.page, availablePagination.limit]); // ✅ Add pagination dependencies

  // Reset về trang 1 khi thay đổi học kỳ, tab trạng thái hoặc bộ lọc/tìm kiếm
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setAvailablePagination(prev => ({ ...prev, page: 1 }));
  }, [semester, statusFilter, searchTerm, filters]);

  // Load hoạt động có sẵn để đăng ký (giống role sinh viên)
  const loadAvailableActivities = async () => {
    try {
      const params = { 
        semester: semester || undefined,
        page: availablePagination.page,
        limit: availablePagination.limit
      };
      
      const response = await http.get('/core/activities', { params });
      const responseData = response.data?.data || response.data || {};
      const items = responseData.items || responseData.data || responseData || [];
      const total = responseData.total || (Array.isArray(items) ? items.length : 0);
      const activitiesArray = Array.isArray(items) ? items : [];
      
      // ✅ REMOVED: Don't filter is_class_activity here - backend already filters by scope
      // Backend scope filter ensures only class activities are returned for LOP_TRUONG/SINH_VIEN
      // Filtering here would cause mismatch with total count from backend
      
      setAvailableActivities(activitiesArray);
      setAvailablePagination(prev => ({ ...prev, total }));
      console.log('📋 Loaded available activities for registration:', activitiesArray.length, '/', total);
      console.log('📋 Semester filter:', semester);
      console.log('📋 Semester breakdown:', {
        hoc_ky_1: activitiesArray.filter(a => a.hoc_ky === 'hoc_ky_1').length,
        hoc_ky_2: activitiesArray.filter(a => a.hoc_ky === 'hoc_ky_2').length,
        nam_hoc: [...new Set(activitiesArray.map(a => a.nam_hoc))].filter(Boolean)
      });
    } catch (err) {
      console.error('Error loading available activities:', err);
      setAvailableActivities([]);
      setAvailablePagination(prev => ({ ...prev, total: 0 }));
    }
  };

  // Load activity types for filter
  const loadActivityTypes = async () => {
    try {
      const response = await http.get('/core/activity-types');
      const payload = response.data?.data ?? response.data ?? [];
      const items = Array.isArray(payload?.items)
        ? payload.items
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []));
      setActivityTypes(items);
      
      // Debug: Log activity types structure
      console.log('🔍 Loaded activity types:', items.length, 'types');
      if (items.length > 0) {
        console.log('🔍 First type structure:', {
          type: items[0],
          id: items[0]?.id,
          ten_loai_hd: items[0]?.ten_loai_hd,
          name: items[0]?.name
        });
      }
    } catch (err) {
      console.error('Error loading activity types:', err);
      setActivityTypes([]);
    }
  };

  // ✅ Load dashboard stats to get accurate total activities count
  const loadDashboardStats = async () => {
    try {
      const response = await http.get('/core/monitor/dashboard', { params: { semester } });
      const data = response.data?.data || response.data || {};
      const summary = data.summary || {};
      
      setDashboardStats({
        totalActivities: summary.totalActivities || 0,
        // These two are not provided by backend summary; keep zero to fall back to local counts
        approvedCount: 0,
        endedCount: 0
      });
      
      console.log('📊 Monitor dashboard stats loaded:', summary);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      // Fallback to counting from activities if dashboard fails
      setDashboardStats({
        totalActivities: 0,
        approvedCount: 0,
        endedCount: 0
      });
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      // ✅ Add semester and pagination parameters
      const params = {
        semester: semester || undefined,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await http.get('/core/activities', { params });
      
      // Backend returns: { success: true, data: { items: [...], total, page, limit }, message: "..." }
      const responseData = response.data?.data || response.data || {};
      
      // Extract items array from response
      const activities = responseData.items || responseData.data || responseData || [];
      const total = responseData.total || (Array.isArray(activities) ? activities.length : 0);
      
      // Ensure it's an array
      const activitiesArray = Array.isArray(activities) ? activities : [];
      
      console.log('📊 Loaded activities:', activitiesArray.length, 'items, total:', total);
      console.log('📊 Semester filter:', semester);
      console.log('📊 Status breakdown:', {
        cho_duyet: activitiesArray.filter(a => a.trang_thai === 'cho_duyet').length,
        da_duyet: activitiesArray.filter(a => a.trang_thai === 'da_duyet').length,
        tu_choi: activitiesArray.filter(a => a.trang_thai === 'tu_choi').length,
        da_huy: activitiesArray.filter(a => a.trang_thai === 'da_huy').length,
        ket_thuc: activitiesArray.filter(a => a.trang_thai === 'ket_thuc').length
      });
      console.log('📊 Semester breakdown:', {
        hoc_ky_1: activitiesArray.filter(a => a.hoc_ky === 'hoc_ky_1').length,
        hoc_ky_2: activitiesArray.filter(a => a.hoc_ky === 'hoc_ky_2').length,
        nam_hoc: [...new Set(activitiesArray.map(a => a.nam_hoc))].filter(Boolean)
      });
      
      // Debug: Log first activity's type structure
      if (activitiesArray.length > 0) {
        const firstActivity = activitiesArray[0];
        console.log('🔍 First activity type structure:', {
          loai_hd_id: firstActivity.loai_hd_id,
          loai_hd: firstActivity.loai_hd,
          loai_hd_id_type: typeof firstActivity.loai_hd_id,
          loai_hd_type: typeof firstActivity.loai_hd,
          loai_hd_is_object: typeof firstActivity.loai_hd === 'object',
          loai_hd_id_from_object: firstActivity.loai_hd?.id
        });
      }
      
      setActivities(activitiesArray);
      setPagination(prev => ({ ...prev, total }));
      setError('');
    } catch (err) {
      console.error('Error loading class activities:', err);
      showError('Không thể tải danh sách hoạt động', 'Lỗi tải dữ liệu');
      setError('Không thể tải danh sách hoạt động');
      setActivities([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = () => {
    if (!isWritable) return;
    navigate('/monitor/activities/create');
  };

  const handleEditActivity = async (activity) => {
    try {
      // Fetch full activity details
      const response = await http.get(`/core/activities/${activity.id}`);
      const activityData = response.data?.data || response.data;
      setSelectedActivity(activityData);
      setShowEditModal(true);
      setEditMode(false); // Start in view mode
    } catch (err) {
      console.error('Error loading activity details:', err);
      showError('Không thể tải chi tiết hoạt động', 'Lỗi');
    }
  };

  const handleSaveActivity = async () => {
    try {
      console.log('💾 Saving activity:', selectedActivity);
      console.log('💾 hinh_anh:', selectedActivity.hinh_anh);
      console.log('💾 tep_dinh_kem:', selectedActivity.tep_dinh_kem);
      
      // ✅ Convert string values to numbers before sending to backend
      const diem_rl = selectedActivity.diem_rl === '' ? 0 : parseFloat(selectedActivity.diem_rl) || 0;
      const sl_toi_da = selectedActivity.sl_toi_da === '' ? 0 : parseInt(selectedActivity.sl_toi_da) || 0;
      
      // Send only the fields that backend expects
      const updateData = {
        ten_hd: selectedActivity.ten_hd,
        mo_ta: selectedActivity.mo_ta,
        loai_hd_id: selectedActivity.loai_hd_id,
        diem_rl: diem_rl, // ✅ Converted to number
        dia_diem: selectedActivity.dia_diem,
        ngay_bd: selectedActivity.ngay_bd,
        ngay_kt: selectedActivity.ngay_kt,
        han_dk: selectedActivity.han_dk,
        sl_toi_da: sl_toi_da, // ✅ Converted to number
        don_vi_to_chuc: selectedActivity.don_vi_to_chuc,
        yeu_cau_tham_gia: selectedActivity.yeu_cau_tham_gia,
        trang_thai: selectedActivity.trang_thai,
        hinh_anh: selectedActivity.hinh_anh,
        tep_dinh_kem: selectedActivity.tep_dinh_kem
      };
      
      console.log('💾 Update data:', updateData);
      
      const response = await http.put(`/core/activities/${selectedActivity.id}`, updateData);
      console.log('💾 Update response:', response);
      
      await loadActivities();
      showSuccess(`Đã cập nhật hoạt động "${selectedActivity.ten_hd}" thành công`, 'Cập nhật hoạt động');
      setEditMode(false);
      setShowEditModal(false);
      setSelectedActivity(null);
    } catch (err) {
      console.error('Error updating activity:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật hoạt động';
      showError(errorMessage, 'Lỗi cập nhật');
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditMode(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = async (activity) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa hoạt động',
      message: `Bạn có chắc chắn muốn xóa hoạt động "${activity.ten_hd}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });

    if (!confirmed) return;

    try {
      await http.delete(`/core/activities/${activity.id}`);
      await loadActivities();
      showSuccess(`Đã xóa hoạt động "${activity.ten_hd}" thành công`, 'Xóa hoạt động');
    } catch (err) {
      console.error('Error deleting activity:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa hoạt động';
      showError(errorMessage, 'Lỗi xóa hoạt động');
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity.id);
    setShowDetailModal(true);
  };

  const handleShowQR = (activity) => {
    setSelectedActivity(activity);
    setShowQRModal(true);
  };

  // Allow monitor to register to available class activities (same flow as student role)
  const handleRegister = async (activityId, activityName) => {
    const confirmed = await confirm({
      title: 'Xác nhận đăng ký',
      message: `Bạn có chắc muốn đăng ký tham gia "${activityName}"?`,
      confirmText: 'Đăng ký',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;
    try {
      const res = await http.post(`/core/activities/${activityId}/register`);
      if (res?.data?.success) {
        showSuccess('Đăng ký thành công');
      } else {
        showSuccess(res?.data?.message || 'Đăng ký thành công');
      }
      // Reload to refresh availability and counts
      await loadActivities();
      await loadAvailableActivities(); // Reload danh sách hoạt động có sẵn
    } catch (err) {
      const firstValidation = err?.response?.data?.errors?.[0]?.message;
      const errorMsg = firstValidation || err?.response?.data?.message || err?.message || 'Đăng ký thất bại';
      showError(errorMsg);
    }
  };

  // Helper functions for filters
  function getActiveFilterCount() {
    let count = 0;
    if (filters.type) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    return count;
  }

  function clearAllFilters() {
    setFilters({ type: '', from: '', to: '' });
    setSearchTerm('');
  }

  // Helpers for availability calculation - hoisted to component scope
  const parseDateSafe = (d) => { try { return d ? new Date(d) : null; } catch(_) { return null; } };
  const isClassActivity = (a) => a?.is_class_activity === true || a?.pham_vi === 'lop' || a?.lop_id != null;
  // Determine if an activity should be considered ended by time (end time + 1 minute)
  const hasEndedByTime = (a) => {
    const end = parseDateSafe(a?.ngay_kt);
    if (!end) return false;
    return Date.now() > (end.getTime() + 60 * 1000);
  };
  // Compute display status for filtering/badges/counts
  const getDisplayStatus = (a) => {
    if (!a) return 'cho_duyet';
    if (a.trang_thai === 'da_duyet' && hasEndedByTime(a)) return 'ket_thuc';
    return a.trang_thai;
  };
  
  // ✅ Tab "Có sẵn" hiển thị hoạt động CÓ SẴN ĐỂ ĐĂNG KÝ (giống logic sinh viên)
  // - Đã duyệt (da_duyet)
  // - Chưa kết thúc
  // - Còn chỗ trống (nếu có giới hạn)
  // - Chưa đăng ký hoặc đã bị từ chối
  const isAvailable = (a) => {
    if (!a) return false;
    
    // ✅ Chỉ hiển thị hoạt động ĐÃ DUYỆT
    if (a.trang_thai !== 'da_duyet') return false;
    
    const now = new Date();
    const endDate = parseDateSafe(a.ngay_kt);
    
    // ✅ Loại bỏ hoạt động đã kết thúc
    if (endDate && endDate < now) return false;
    
    // ✅ Kiểm tra còn chỗ trống (nếu có giới hạn số lượng)
    const capacity = a.so_luong_toi_da ?? a.sl_toi_da ?? null;
    const registeredCount = a.registrationCount ?? a.so_dang_ky ?? a._count?.dang_ky_hd ?? 0;
    const isFull = capacity !== null ? Number(registeredCount) >= Number(capacity) : false;
    if (isFull) return false;
    
    // ✅ Cho phép đăng ký nếu chưa đăng ký hoặc đã bị từ chối trước đó
    // Lớp trưởng có thể đăng ký lại nếu đã bị từ chối
    const notRegisteredOrRejected = (!a.is_registered) || a.registration_status === 'tu_choi';
    return notRegisteredOrRejected;
  };

  // Filter and sort activities with advanced filters
  // For consistency with Student view: show ALL class activities in "Có sẵn"
  const filteredActivities = (statusFilter === 'co_san' ? activities : activities)
    .filter(activity => {
      const matchesSearch = activity.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tab "Có sẵn": chỉ hiển thị hoạt động đã duyệt (ẩn cho_duyet giống role sinh viên)
      // Tab khác: lọc theo trạng thái hiện tại
      const displayStatus = getDisplayStatus(activity);
      const matchesStatus = statusFilter === 'all' 
        || (statusFilter === 'co_san' ? true : displayStatus === statusFilter);
      
      // Advanced filters
      let matchesType = true;
      let matchesDateFrom = true;
      let matchesDateTo = true;

      if (filters.type) {
        const filterValue = String(filters.type).trim();
        const filterId = parseInt(filterValue, 10);

        if (isNaN(filterId)) {
          // Filter by name (case-insensitive) when value is not numeric
          const filterName = filterValue.toLowerCase();
          const activityTypeName = (activity.loai_hd?.ten_loai_hd || activity.loai_hd?.name || '').toLowerCase();
          matchesType = activityTypeName === filterName;
        } else {
          // Filter by numeric id
          let activityTypeId = null;
          if (activity.loai_hd_id !== undefined && activity.loai_hd_id !== null) {
            activityTypeId = activity.loai_hd_id;
          } else if (activity.loai_hd && typeof activity.loai_hd === 'object' && activity.loai_hd.id !== undefined) {
            activityTypeId = activity.loai_hd.id;
          } else if (activity.loai_hd !== undefined && activity.loai_hd !== null) {
            const parsed = parseInt(activity.loai_hd, 10);
            if (!isNaN(parsed)) activityTypeId = parsed;
          }

          const activityId = activityTypeId !== null ? parseInt(activityTypeId, 10) : null;
          matchesType = activityId !== null && activityId === filterId;

          if (!matchesType && activityId !== null) {
            console.log('🔍 Filter mismatch:', {
              filterId,
              activityId,
              activityTypeId,
              loai_hd_id: activity.loai_hd_id,
              loai_hd: activity.loai_hd,
              activityName: activity.ten_hd
            });
          }
        }
      }

      if (filters.from) {
        const fromDate = new Date(filters.from);
        const activityDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
        matchesDateFrom = activityDate && activityDate >= fromDate;
      }

      if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);
        const activityDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
        matchesDateTo = activityDate && activityDate <= toDate;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
    })
    .sort((a, b) => {
      const ta = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
      const tb = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
      return tb - ta; // ưu tiên thao tác mới nhất lên đầu
    });

  // Derived counts within the selected semester (activities already filtered by semester from API)
  // ✅ DEPRECATED: Use dashboardStats instead for accurate counts
  // These counts are for local filtering only (status tabs)
  const countByDisplayStatus = (st) => activities.reduce((n, a) => n + (getDisplayStatus(a) === st ? 1 : 0), 0);
  const tabCounts = {
    cho_duyet: countByDisplayStatus('cho_duyet'),
    da_duyet: countByDisplayStatus('da_duyet'),
    ket_thuc: countByDisplayStatus('ket_thuc'),
    tu_choi: countByDisplayStatus('tu_choi')
  };
  const localApprovedCount = tabCounts.da_duyet;
  // For the "Có sẵn" tab, align count with total class activities
  const localAvailableCount = pagination.total || activities.length;
  const localPendingCount = tabCounts.cho_duyet;
  const localEndedCount = tabCounts.ket_thuc;
  
  // ✅ Use dashboard stats for display (accurate count from backend)
  const approvedCount = dashboardStats.approvedCount || localApprovedCount;
  const availableCount = localAvailableCount;
  const pendingCount = localPendingCount; // Keep local count for pending
  const endedCount = dashboardStats.endedCount || localEndedCount;
  // Use backend list total to match student role count exactly
  const totalActivitiesCount = pagination.total || activities.length;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const ActivityCard = ({ activity }) => {
    const now = new Date();
    const deadline = activity.han_dk ? new Date(activity.han_dk) : null;
    const startDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
    const endDate = activity.ngay_kt ? new Date(activity.ngay_kt) : null;
    const isPast = endDate ? (endDate < now) : false;
    const isUpcoming = startDate ? (startDate > now) : false;
    const isOngoing = startDate && endDate ? (startDate <= now && endDate >= now) : false;
    const isDeadlinePast = deadline ? deadline < now : false;
    const isAfterStart = startDate ? (now.getTime() >= startDate.getTime()) : false;
    const capacity = activity.so_luong_toi_da ?? activity.sl_toi_da ?? null;
    const registeredCount = activity.registrationCount ?? activity.so_dang_ky ?? activity._count?.dang_ky_hd ?? null;
    const isFull = capacity !== null && registeredCount !== null ? Number(registeredCount) >= Number(capacity) : false;
    const canRegister = activity.trang_thai === 'da_duyet' && !isPast && !isDeadlinePast 
      && (!activity.is_registered || activity.registration_status === 'tu_choi') && !isFull;
    const isRegistrationOpen = canRegister;
    
    // LIST MODE - Compact horizontal layout
    const displayStatus = getDisplayStatus(activity);
    if (displayViewMode === 'list') {
      return (
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
          
          <div className="relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
            <div className="flex items-stretch gap-4 p-4">
              {/* Compact Image */}
              <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img 
                  src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)} 
                  alt={activity.ten_hd}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[displayStatus]}`}>
                    {statusLabels[displayStatus]}
                  </span>
                </div>
                {activity.diem_rl && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                      <Award className="h-3 w-3" />
                      +{activity.diem_rl}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                    {activity.ten_hd}
                  </h3>
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {activity.loai_hd?.ten_loai_hd || 'Chưa phân loại'}
                      </span>
                    </div>
                    {activity.ngay_bd && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
                      </div>
                    )}
                    {activity.dia_diem && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                      </div>
                    )}
                    {activity.registrationCount !== undefined && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-gray-600">
                          {activity.registrationCount || 0} đăng ký
                          {activity.so_luong_toi_da && ` / ${activity.so_luong_toi_da} tối đa`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                {statusFilter === 'co_san' && isRegistrationOpen && (
                  <button
                    onClick={() => handleRegister(activity.id, activity.ten_hd)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[110px]"
                    title="Đăng ký hoạt động"
                  >
                    <UserPlus className="h-4 w-4" />
                    Đăng ký
                  </button>
                )}
                <button
                  onClick={() => handleViewDetails(activity)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </button>
                
                {/* Tab "Có sẵn" - KHÔNG hiển thị QR/Sửa/Xóa */}
                {statusFilter !== 'co_san' && displayStatus === 'da_duyet' && (
                  <button
                    onClick={() => handleShowQR(activity)}
                    disabled={!isWritable}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    title="QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                    QR
                  </button>
                )}
                
                {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
                  <button
                    onClick={() => handleEditActivity(activity)}
                    disabled={!isWritable}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-4 w-4" />
                    Sửa
                  </button>
                )}
                
                {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
                  <button
                    onClick={() => handleDeleteActivity(activity)}
                    disabled={!isWritable}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // GRID MODE - Compact vertical layout
    // ✅ Tab "Có sẵn" sử dụng thiết kế giống sinh viên với header gradient
    if (statusFilter === 'co_san') {
      return (
        <div className="group relative h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          
          <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full">
            {/* Header với gradient background - Giống sinh viên */}
            <div className={`relative h-24 overflow-hidden ${
              activity.loai_hd?.ten_loai_hd?.toLowerCase().includes('tình nguyện') || activity.loai_hd?.ten_loai_hd?.toLowerCase().includes('tinh nguyen')
                ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500'
                : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Status badge - Top left */}
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm text-emerald-700 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {displayStatus === 'da_duyet' ? 'Đã mở' : (statusLabels[displayStatus] || 'Đã mở')}
                </span>
              </div>
              
              {/* Points badge - Top right */}
              {activity.diem_rl && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white shadow-md text-xs font-bold">
                    <Award className="h-3 w-3" />
                    +{activity.diem_rl}
                  </span>
                </div>
              )}
              
              {/* Activity type - Center */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-white">
                  <div className="text-lg font-black mb-0.5 line-clamp-1">
                    {activity.loai_hd?.ten_loai_hd?.toUpperCase() || 'HOẠT ĐỘNG'}
                  </div>
                  <div className="text-xs font-medium text-white/90 line-clamp-1">
                    {activity.loai_hd?.ten_loai_hd === 'Tình nguyện' 
                      ? 'Hoạt động cộng đồng và từ thiện'
                      : activity.loai_hd?.ten_loai_hd === 'Hoạt động rèn luyện'
                      ? 'Phát triển kỹ năng toàn diện'
                      : 'Hoạt động rèn luyện'}
                  </div>
                </div>
              </div>
            </div>

            {/* Content - White background */}
            <div className="flex-1 p-4 space-y-3">
              {/* Activity Title */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1.5 leading-tight">
                  {activity.ten_hd}
                </h3>
                {activity.loai_hd?.ten_loai_hd && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                    <Calendar className="h-3 w-3" />
                    {activity.loai_hd.ten_loai_hd}
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="space-y-1.5">
                {activity.ngay_bd && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                      <p className="text-gray-500">
                        {new Date(activity.ngay_bd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
                
                {activity.dia_diem && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                  </div>
                )}
              </div>

              {/* Status & Time */}
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-semibold ${
                  isPast ? 'text-slate-500' : isOngoing ? 'text-emerald-600' : isUpcoming ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  • {isPast ? 'Đã kết thúc' : isOngoing ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Chưa xác định'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 pt-0 mt-auto flex gap-2">
              {canRegister && (
                <button
                  onClick={() => handleRegister(activity.id, activity.ten_hd)}
                  disabled={!isWritable}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  title={activity.registration_status === 'tu_choi' ? 'Đăng ký lại' : 'Đăng ký'}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {activity.registration_status === 'tu_choi' ? 'ĐK lại' : 'Đăng ký'}
                </button>
              )}
              <button
                onClick={() => handleViewDetails(activity)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 ${canRegister ? '' : 'flex-1'}`}
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // GRID MODE - Compact vertical layout cho các tab khác
    return (
      <div className={`group relative h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col ${
        isRegistrationOpen ? 'border-emerald-200 shadow-lg shadow-emerald-100' : ''
      }`}>
        {/* Activity Image - Compact */}
        <div className="relative w-full h-36 overflow-hidden">
          <img 
            src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)} 
            alt={activity.ten_hd}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Status Badge on Image - Compact */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[displayStatus]}`}>
              {statusLabels[displayStatus]}
            </span>
          </div>
          
          {/* Points Badge on Image - Compact */}
          {activity.diem_rl && (
            <div className="absolute bottom-2 right-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                <Award className="h-3 w-3" />
                +{activity.diem_rl}
              </span>
            </div>
          )}
          
          {/* Featured badge for open registration */}
          {isRegistrationOpen && (
            <div className="absolute bottom-2 left-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span className="text-xs font-bold">Mở ĐK</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 space-y-3 relative z-10">
          {/* Header - Compact */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
              {activity.ten_hd}
            </h3>
            
            {/* Category tag - Compact */}
            {activity.loai_hd?.ten_loai_hd && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <Calendar className="h-3 w-3" />
                {activity.loai_hd.ten_loai_hd}
              </span>
            )}
          </div>

          {/* Compact Meta Info */}
          <div className="space-y-1.5">
            {activity.ngay_bd && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 font-medium">
                  {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {activity.dia_diem && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 truncate">{activity.dia_diem}</span>
              </div>
            )}

            {activity.diem_rl && (
              <div className="flex items-center gap-1.5 text-xs">
                <Award className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-gray-900 font-medium">+{activity.diem_rl} điểm</span>
              </div>
            )}

            {activity.registrationCount !== undefined && (
              <div className="flex items-center gap-1.5 text-xs">
                <Users className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-600">
                  {activity.registrationCount || 0} đăng ký
                  {activity.so_luong_toi_da && ` / ${activity.so_luong_toi_da} tối đa`}
                </span>
              </div>
            )}
          </div>

          {/* Compact Actions */}
          <div className="p-3 pt-0 mt-auto flex gap-2">
            <button
              onClick={() => handleViewDetails(activity)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
            
            {/* Tab khác - Hiển thị QR/Sửa/Xóa */}
            {statusFilter !== 'co_san' && displayStatus === 'da_duyet' && (
              <button
                onClick={() => handleShowQR(activity)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!isWritable}
                title="QR Code"
              >
                <QrCode className="h-3.5 w-3.5" />
              </button>
            )}
            
            {/* Chỉ cho phép sửa khi trạng thái "Chờ duyệt" và KHÔNG phải tab "Có sẵn" */}
            {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
              <button
                onClick={() => handleEditActivity(activity)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!isWritable}
                title="Chỉnh sửa"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            )}
            
            {/* Chỉ cho phép xóa khi trạng thái "Chờ duyệt" và KHÔNG phải tab "Có sẵn" */}
            {statusFilter !== 'co_san' && displayStatus === 'cho_duyet' && (
              <button
                onClick={() => handleDeleteActivity(activity)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!isWritable}
                title="Xóa vĩnh viễn"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ultra Modern Header - Neo-brutalism + Glassmorphism Hybrid */}
      <div className="relative min-h-[280px]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

        {/* Main Content Container with Glassmorphism */}
        <div className="relative z-10 p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
            
            {/* Top Bar with Badge */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-blue-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-blue-400">
                    ⚡ QUẢN LÝ LỚP
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {totalActivitiesCount} HOẠT ĐỘNG
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreateActivity}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-200 font-semibold ${isWritable ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl hover:shadow-2xl hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!isWritable}
              >
                <Plus className="h-5 w-5" />
                Tạo hoạt động
              </button>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ạ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Đ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ộ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">G</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-blue-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.5)]">
                    LỚP HỌC
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-blue-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Tổ chức và quản lý các hoạt động của lớp, theo dõi sinh viên tham gia
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Total */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <ActivityIcon className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{totalActivitiesCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 2 - Pending */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{pendingCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>

              {/* Card 3 - Approved */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{approvedCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>

              {/* Card 4 - Completed */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-purple-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Award className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{endedCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">KẾT THÚC</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}} />
      </div>

      {/* Tìm kiếm và Bộ lọc */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Thanh tìm kiếm */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
              placeholder="Tìm kiếm hoạt động..."
            />
          </div>

          {/* Bộ lọc và Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Semester Filter */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Học kỳ:</span>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="border-none bg-transparent text-sm font-semibold text-gray-900 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  {semesterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

              {/* Advanced Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
                {getActiveFilterCount() > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full min-w-[20px] text-center">
                    {getActiveFilterCount()}
                  </span>
                )}
                <span className={`text-xs transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Clear filters button */}
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium border-2 border-red-200 hover:border-red-300"
                  title="Xóa tất cả bộ lọc"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm">Xóa lọc</span>
                </button>
              )}
            </div>
            
            {/* Right side: View mode toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                <button
                  onClick={() => setDisplayViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    displayViewMode === 'grid' 
                      ? 'bg-white shadow-md text-blue-600 border border-blue-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Hiển thị dạng lưới"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
                <button
                  onClick={() => setDisplayViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    displayViewMode === 'list' 
                      ? 'bg-white shadow-md text-blue-600 border border-blue-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Hiển thị dạng danh sách"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Bộ lọc nâng cao
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Loại hoạt động */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại hoạt động
                  </label>
                  <select
                    value={filters.type}
                    onChange={e => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  >
                    <option value="">Tất cả loại</option>
                    {Array.isArray(activityTypes) && activityTypes.map(type => {
                      const typeName = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || '');
                      // Always use ID as value for consistent filtering
                      const typeValue = typeof type === 'string' ? type : (type?.id?.toString() || type?.name || type?.ten_loai_hd || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (
                        <option key={typeKey} value={typeValue}>{typeName}</option>
                      );
                    })}
                  </select>
                </div>

                {/* Từ ngày */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={e => setFilters({ ...filters, from: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  />
                </div>

                {/* Đến ngày */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={e => setFilters({ ...filters, to: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Tabs - Multiple View Modes */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          {/* Header với View Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle view mode button */}
              <button
                onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title="Chuyển chế độ hiển thị"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          {/* Pills Mode (Default) */}
          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('co_san')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'co_san'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Có sẵn
                {availableCount > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {availableCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('cho_duyet')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'cho_duyet'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Chờ duyệt
                {tabCounts.cho_duyet > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.cho_duyet}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('da_duyet')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'da_duyet'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Đã duyệt
                {tabCounts.da_duyet > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.da_duyet}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('ket_thuc')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'ket_thuc'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Award className="h-4 w-4" />
                Kết thúc
                {tabCounts.ket_thuc > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.ket_thuc}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('tu_choi')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  statusFilter === 'tu_choi'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Bị từ chối
                {tabCounts.tu_choi > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {tabCounts.tu_choi}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Dropdown Mode */}
          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
              >
                <option value="co_san">Có sẵn ({availableCount})</option>
                <option value="cho_duyet">Chờ duyệt ({tabCounts.cho_duyet})</option>
                <option value="da_duyet">Đã duyệt ({tabCounts.da_duyet})</option>
                <option value="ket_thuc">Kết thúc ({tabCounts.ket_thuc})</option>
                {/* Label corrected to Kết thúc */}
                {/* Keeping option order and value same */}
                <option value="tu_choi">Bị từ chối ({tabCounts.tu_choi})</option>
              </select>
              {(() => {
                const configs = {
                  co_san: { icon: UserPlus, gradient: 'from-emerald-500 to-green-500', count: availableCount },
                  cho_duyet: { icon: Clock, gradient: 'from-amber-500 to-orange-500', count: tabCounts.cho_duyet },
                  da_duyet: { icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500', count: tabCounts.da_duyet },
                  ket_thuc: { icon: Award, gradient: 'from-violet-500 to-purple-500', count: tabCounts.ket_thuc },
                  tu_choi: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: tabCounts.tu_choi }
                };
                const currentConfig = configs[statusFilter] || configs.cho_duyet;
                const CurrentIcon = currentConfig?.icon || Clock;
                return (
                  <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentConfig?.gradient || 'from-gray-400 to-gray-500'} text-white rounded-xl shadow-md`}>
                    <CurrentIcon className="h-4 w-4" />
                    <span className="font-bold text-sm">{currentConfig?.count || 0}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Compact Mode - Horizontal bar with badges */}
          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <button
                onClick={() => setStatusFilter('co_san')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'co_san' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Có sẵn"
              >
                <UserPlus className={`h-5 w-5 ${statusFilter === 'co_san' ? 'text-emerald-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'co_san' ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {availableCount}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('cho_duyet')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'cho_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Chờ duyệt"
              >
                <Clock className={`h-5 w-5 ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.cho_duyet}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('da_duyet')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'da_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Đã duyệt"
              >
                <CheckCircle className={`h-5 w-5 ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.da_duyet}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('ket_thuc')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'ket_thuc' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Đã tham gia"
              >
                <Award className={`h-5 w-5 ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.ket_thuc}
                </span>
              </button>
              
              <button
                onClick={() => setStatusFilter('tu_choi')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  statusFilter === 'tu_choi' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Bị từ chối"
              >
                <XCircle className={`h-5 w-5 ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {tabCounts.tu_choi}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activities Grid/List */}
      {filteredActivities.length > 0 ? (
        <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filteredActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hoạt động' : 'Chưa có hoạt động nào'}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || statusFilter !== 'all' 
                ? 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác'
                : 'Bắt đầu bằng cách tạo hoạt động đầu tiên cho lớp của bạn'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={handleCreateActivity}
                disabled={!isWritable}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold text-lg ${isWritable ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Plus className="h-6 w-6" />
                Tạo hoạt động đầu tiên
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {showEditModal && selectedActivity && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={handleCloseEditModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f9fafb'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Chi tiết hoạt động
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!editMode ? (
                  <button 
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveActivity}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Lưu
                  </button>
                )}
                <button 
                  onClick={handleCloseEditModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên hoạt động */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hoạt động *
                  </label>
                  <input
                    type="text"
                    value={selectedActivity.ten_hd || ''}
                    onChange={(e) => editMode && setSelectedActivity({...selectedActivity, ten_hd: e.target.value})}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {/* Địa điểm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm *
                  </label>
                  <input
                    type="text"
                    value={selectedActivity.dia_diem || ''}
                    onChange={(e) => editMode && setSelectedActivity({...selectedActivity, dia_diem: e.target.value})}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {/* Điểm rèn luyện */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm rèn luyện *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedActivity.diem_rl ?? ''}
                    onChange={(e) => {
                      if (editMode) {
                        // ✅ Keep as string to allow continuous typing
                        // Will be converted to number when saving
                        setSelectedActivity({
                          ...selectedActivity, 
                          diem_rl: e.target.value
                        });
                      }
                    }}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {/* Ngày bắt đầu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="datetime-local"
                    value={selectedActivity.ngay_bd ? new Date(selectedActivity.ngay_bd).toISOString().slice(0, 16) : ''}
                    onChange={(e) => editMode && setSelectedActivity({...selectedActivity, ngay_bd: e.target.value})}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {/* Ngày kết thúc */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="datetime-local"
                    value={selectedActivity.ngay_kt ? new Date(selectedActivity.ngay_kt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => editMode && setSelectedActivity({...selectedActivity, ngay_kt: e.target.value})}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {/* Hạn đăng ký */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn đăng ký
                  </label>
                  <input
                    type="datetime-local"
                    value={selectedActivity.han_dk ? new Date(selectedActivity.han_dk).toISOString().slice(0, 16) : ''}
                    onChange={(e) => editMode && setSelectedActivity({...selectedActivity, han_dk: e.target.value})}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {/* Số lượng tối đa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng tối đa
                  </label>
                  <input
                    type="number"
                    value={selectedActivity.sl_toi_da ?? ''}
                    onChange={(e) => {
                      if (editMode) {
                        // ✅ Keep as string to allow continuous typing
                        // Will be converted to number when saving
                        setSelectedActivity({
                          ...selectedActivity, 
                          sl_toi_da: e.target.value
                        });
                      }
                    }}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={selectedActivity.trang_thai || 'cho_duyet'}
                    onChange={(e) => editMode && setSelectedActivity({...selectedActivity, trang_thai: e.target.value})}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  >
                    <option value="cho_duyet">Chờ duyệt</option>
                    <option value="da_duyet">Đã duyệt</option>
                    <option value="tu_choi">Từ chối</option>
                    <option value="da_huy">Đã hủy</option>
                    <option value="ket_thuc">Kết thúc</option>
                  </select>
                </div>

                {/* Mô tả */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={selectedActivity.mo_ta || ''}
                    onChange={(e) => editMode && setSelectedActivity({...selectedActivity, mo_ta: e.target.value})}
                    disabled={!editMode}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 resize-vertical"
                  />
                </div>

                {/* Hình ảnh hoạt động - Upload in Edit Mode */}
                {editMode && (
                  <div className="md:col-span-2">
                    <FileUpload
                      type="image"
                      multiple={true}
                      maxFiles={5}
                      label="Hình ảnh hoạt động (Ảnh đầu tiên là ảnh nền)"
                      value={selectedActivity.hinh_anh || []}
                      onChange={(urls) => setSelectedActivity({...selectedActivity, hinh_anh: urls})}
                      disabled={!editMode}
                    />
                    
                    {/* Hiển thị ảnh để chọn làm ảnh nền */}
                    {selectedActivity.hinh_anh && selectedActivity.hinh_anh.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Chọn ảnh nền (Click vào ảnh để đặt làm ảnh nền)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {selectedActivity.hinh_anh.map((url, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                // Di chuyển ảnh được chọn lên vị trí đầu tiên
                                const newImages = [url, ...selectedActivity.hinh_anh.filter(img => img !== url)];
                                setSelectedActivity({...selectedActivity, hinh_anh: newImages});
                              }}
                              className={`relative cursor-pointer group ${idx === 0 ? 'ring-4 ring-indigo-500' : ''}`}
                            >
                              <img 
                                src={url} 
                                alt={`Activity ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-all"
                              />
                              {idx === 0 && (
                                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                  Ảnh nền
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                  {idx === 0 ? 'Ảnh nền hiện tại' : 'Đặt làm ảnh nền'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Ảnh đầu tiên (có viền xanh) sẽ được hiển thị làm ảnh nền của hoạt động
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Hình ảnh hoạt động - Display in View Mode */}
                {!editMode && selectedActivity.hinh_anh && selectedActivity.hinh_anh.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh hoạt động
                    </label>
                    
                    {/* Ảnh nền chính - Hiển thị lớn */}
                    <div className="mb-4">
                      <div className="relative">
                        <img 
                          src={selectedActivity.hinh_anh[0]} 
                          alt="Ảnh nền hoạt động"
                          className="w-full h-64 object-cover rounded-xl border-4 border-indigo-200 shadow-lg"
                        />
                        <div className="absolute top-3 left-3 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-full font-semibold shadow-md">
                          📸 Ảnh nền
                        </div>
                      </div>
                    </div>
                    
                    {/* Các ảnh còn lại - Hiển thị nhỏ */}
                    {selectedActivity.hinh_anh.length > 1 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Ảnh chi tiết ({selectedActivity.hinh_anh.length - 1} ảnh)
                        </label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {selectedActivity.hinh_anh.slice(1).map((url, idx) => (
                            <img 
                              key={idx}
                              src={url} 
                              alt={`Activity detail ${idx + 2}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tệp đính kèm - Upload in Edit Mode */}
                {editMode && (
                  <div className="md:col-span-2">
                    <FileUpload
                      type="attachment"
                      multiple={true}
                      maxFiles={3}
                      label="Tệp đính kèm"
                      value={selectedActivity.tep_dinh_kem || []}
                      onChange={(urls) => setSelectedActivity({...selectedActivity, tep_dinh_kem: urls})}
                      disabled={!editMode}
                    />
                  </div>
                )}

                {/* Tệp đính kèm - Display in View Mode */}
                {!editMode && selectedActivity.tep_dinh_kem && selectedActivity.tep_dinh_kem.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tệp đính kèm
                    </label>
                    <div className="space-y-2">
                      {selectedActivity.tep_dinh_kem.map((url, idx) => {
                        const filename = url.split('/').pop();
                        // ✅ Fix: Prepend backend base URL for attachments
                        const baseURL = (typeof window !== 'undefined' && window.location)
                          ? window.location.origin.replace(/\/$/, '') + '/api'
                          : (process.env.REACT_APP_API_URL || 'http://dacn_backend_dev:3001/api');
                        const backendBase = baseURL.replace('/api', ''); // Remove /api to get base server URL
                        const downloadUrl = url.startsWith('http') ? url : `${backendBase}${url}`;
                        
                        return (
                          <a 
                            key={idx}
                            href={downloadUrl}
                            download={filename} // ✅ Add download attribute to force download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-indigo-600 hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-sm font-medium truncate">{filename}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <ActivityDetailModal
          activityId={selectedActivity}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedActivity && (
        <ActivityQRModal
          activityId={selectedActivity.id}
          activityName={selectedActivity.ten_hd}
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {/* Pagination Controls - Pattern từ trang sinh viên */}
      {filteredActivities.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 mt-6">
          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
            itemLabel="hoạt động"
            showLimitSelector={true}
          />
        </div>
      )}
    </div>
  );
}

