import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Eye, FileText, Sparkles, TrendingUp, Mail, Phone, Award, MapPin, BookOpen, Trophy, RefreshCw, Grid3X3, List, SlidersHorizontal, X, ArrowUp, ArrowDown } from 'lucide-react';
import http from '../../../shared/api/http';
import { useNotification } from '../../../contexts/NotificationContext';
import { getBestActivityImage } from '../../../shared/lib/activityImages';
import { getUserAvatar } from '../../../shared/lib/avatar';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import useSemesterData from '../../../hooks/useSemesterData';

export default function TeacherRegistrationApprovalsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [statusViewMode, setStatusViewMode] = useState('pills'); // 'pills', 'dropdown', 'compact'
  const [displayViewMode, setDisplayViewMode] = useState('grid'); // 'grid', 'list'
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // Track selected registration IDs
  const [activityDetailId, setActivityDetailId] = useState(null); // For modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // For modal
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
  const [activityTypes, setActivityTypes] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name-az', 'name-za'
  const { showSuccess, showError, showWarning, confirm } = useNotification();

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

  // Status mappings (matching Prisma enum TrangThaiDangKy)
  const statusLabels = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Từ chối'
  };

  const statusColors = {
    'cho_duyet': 'bg-amber-50 text-amber-700 border-amber-200',
    'da_duyet': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'tu_choi': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const roleLabel = (role) => {
    switch (role) {
      case 'LOP_TRUONG': return 'Lớp trưởng';
      case 'GIANG_VIEN': return 'Giảng viên';
      case 'ADMIN': return 'Admin';
      default: return null;
    }
  };

  useEffect(() => {
    loadRegistrations();
    loadActivityTypes();
  }, [semester]);

  const loadActivityTypes = async () => {
    try {
      const response = await http.get('/core/activity-types');
      const payload = response.data?.data ?? response.data ?? [];
      const items = Array.isArray(payload?.items)
        ? payload.items
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []));
      setActivityTypes(items);
    } catch (err) {
      console.error('Error loading activity types:', err);
      setActivityTypes([]);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return '—'; }
  };

  function getActiveFilterCount() {
    let count = 0;
    if (filters.type) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (filters.minPoints) count++;
    if (filters.maxPoints) count++;
    if (filters.mssv) count++;
    return count;
  }

  function clearAllFilters() {
    setFilters({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
    setSearchTerm('');
  }

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const res = await http.get('/teacher/registrations', {
        params: { status: 'all', semester } // Get all registrations with status filter
      });
      
      console.log('[Teacher] API Response:', res.data);
      
      // Parse response same as monitor
      const data = res.data?.data || res.data || [];
      let items = Array.isArray(data) ? data : [];
      
      console.log('[Teacher] Raw items before dedup:', items.length);
      
      // Deduplicate by registration ID to prevent duplicate display
      const seen = new Set();
      items = items.filter(reg => {
        if (!reg.id) return true; // Keep items without ID (shouldn't happen)
        if (seen.has(reg.id)) {
          console.warn('[Teacher] Duplicate registration found:', reg.id);
          return false; // Skip duplicate
        }
        seen.add(reg.id);
        return true;
      });
      
      console.log('[Teacher] Parsed registrations:', items.length, 'items (after deduplication)');
      console.log('[Teacher] Sample registration:', items[0]);
      
      // Log all registrations to check for actual duplicates
      if (items.length > 0) {
        console.log('[Teacher] All registrations:', items.map(r => ({
          id: r.id,
          student: r.sinh_vien?.nguoi_dung?.ho_ten,
          mssv: r.sinh_vien?.mssv,
          activity: r.hoat_dong?.ten_hd,
          activity_id: r.hd_id,
          status: r.trang_thai_dk
        })));
      }
      
      setRegistrations(items);
      setError('');
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Không thể tải danh sách đăng ký');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registration) => {
    const confirmed = await confirm({
      title: 'Xác nhận phê duyệt',
      message: `Phê duyệt đăng ký của ${registration.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên'} tham gia hoạt động?`,
      confirmText: 'Phê duyệt',
      cancelText: 'Hủy'
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await http.post(`/teacher/registrations/${registration.id}/approve`);
      await loadRegistrations();
      showSuccess(`Đã phê duyệt đăng ký cho ${registration.sinh_vien?.nguoi_dung?.ho_ten}`, 'Phê duyệt thành công');
    } catch (err) {
      console.error('Error approving:', err);
      showError(err.response?.data?.message || 'Không thể phê duyệt', 'Lỗi phê duyệt');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (registration) => {
    const reason = window.prompt('Lý do từ chối (tùy chọn):') || 'Không đáp ứng yêu cầu';

    const confirmed = await confirm({
      title: 'Xác nhận từ chối',
      message: `Từ chối đăng ký của ${registration.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên'}?\n\nLý do: ${reason}`,
      confirmText: 'Từ chối',
      cancelText: 'Hủy'
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await http.post(`/teacher/registrations/${registration.id}/reject`, { reason });
      await loadRegistrations();
      showSuccess(`Đã từ chối đăng ký của ${registration.sinh_vien?.nguoi_dung?.ho_ten}`, 'Từ chối thành công');
    } catch (err) {
      console.error('Error rejecting:', err);
      showError(err.response?.data?.message || 'Không thể từ chối', 'Lỗi từ chối');
    } finally {
      setProcessing(false);
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      showWarning('Vui lòng chọn ít nhất một đăng ký', 'Chưa chọn đăng ký');
      return;
    }

    const confirmed = await confirm({
      title: 'Xác nhận phê duyệt hàng loạt',
      message: `Bạn có chắc muốn phê duyệt ${selectedIds.length} đăng ký đã chọn?`,
      confirmText: 'Phê duyệt tất cả',
      cancelText: 'Hủy'
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      const res = await http.post('/teacher/registrations/bulk-approve', {
        registrationIds: selectedIds
      });
      
      await loadRegistrations();
      setSelectedIds([]); // Clear selection
      const approvedCount = res.data?.data?.approved || selectedIds.length;
      showSuccess(`Đã phê duyệt ${approvedCount} đăng ký thành công`, 'Phê duyệt hàng loạt thành công');
    } catch (err) {
      console.error('Error bulk approving:', err);
      showError(err.response?.data?.message || 'Không thể phê duyệt hàng loạt', 'Lỗi phê duyệt');
    } finally {
      setProcessing(false);
    }
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

  // Toggle individual selection
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const filteredRegistrations = registrations.filter(reg => {
    const student = reg.sinh_vien?.nguoi_dung;
    const activity = reg.hoat_dong;
    const matchesSearch = 
      student?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity?.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.sinh_vien?.mssv?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by view mode
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
    
    return matchesSearch && matchesViewMode && matchesAdvancedFilters;
  }).sort((a, b) => {
    // Sorting logic
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

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.trang_thai_dk === 'cho_duyet').length,
    approved: registrations.filter(r => r.trang_thai_dk === 'da_duyet').length,
    rejected: registrations.filter(r => r.trang_thai_dk === 'tu_choi').length
  };

  const RegistrationCard = ({ registration }) => {
    const student = registration.sinh_vien?.nguoi_dung;
    const activity = registration.hoat_dong;
    const isPending = registration.trang_thai_dk === 'cho_duyet';
    const activityImage = getBestActivityImage(activity);
    const isSelected = selectedIds.includes(registration.id);
    const approvedBy = registration.trang_thai_dk === 'da_duyet' ? (registration.approvedByRole === 'LOP_TRUONG' ? 'Lớp trưởng' : registration.approvedByRole === 'GIANG_VIEN' ? 'Giảng viên' : null) : null;
    const rejectedBy = registration.trang_thai_dk === 'tu_choi' ? (registration.rejectedByRole === 'LOP_TRUONG' ? 'Lớp trưởng' : registration.rejectedByRole === 'GIANG_VIEN' ? 'Giảng viên' : null) : null;

    if (displayViewMode === 'list') {
      return (
        <div className={`group relative ${isSelected ? 'ring-4 ring-indigo-500 ring-offset-2' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
          <div className={`relative bg-white border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'}`}>
            <div className="flex items-stretch gap-4 p-4">
              {/* Activity Image */}
              <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img src={activityImage} alt={activity?.ten_hd || 'Hoạt động'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
                    {statusLabels[registration.trang_thai_dk]}
                  </span>
                </div>
                
                {/* Points Badge */}
                {activity?.diem_rl && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                      <Award className="h-3 w-3" />+{activity.diem_rl}
                    </span>
                  </div>
                )}
                
                {/* Checkbox */}
                {isPending && (
                  <div className="absolute bottom-2 right-2 z-20">
                    <label className="flex items-center gap-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded px-2 py-1 shadow-lg hover:bg-white transition-all" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleToggleSelect(registration.id)} 
                        className="w-4 h-4 rounded border-2 cursor-pointer accent-indigo-600" 
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                    {activity?.ten_hd || 'Hoạt động'}
                  </h3>
                  
                  {/* Student Info */}
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const avatar = getUserAvatar(student);
                      return avatar.hasValidAvatar ? (
                        <img 
                          src={avatar.src} 
                          alt={avatar.alt} 
                          className="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-white" 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.style.display = 'none'; 
                            e.target.nextElementSibling.style.display = 'flex'; 
                          }} 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-white">
                          {avatar.fallback}
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{student?.ho_ten || 'Không rõ tên'}</p>
                      <p className="text-xs text-gray-600 truncate">MSSV: {registration.sinh_vien?.mssv}</p>
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">{activity?.loai_hd?.ten_loai_hd || 'Chưa phân loại'}</span>
                    </div>
                    {activity?.ngay_bd && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
                      </div>
                    )}
                    {activity?.dia_diem && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                      </div>
                    )}
                    {!isPending && approvedBy && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-gray-600 truncate">Người duyệt: {approvedBy}</span>
                      </div>
                    )}
                    {!isPending && rejectedBy && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <XCircle className="h-3.5 w-3.5 text-rose-500" />
                        <span className="text-gray-600 truncate">Người từ chối: {rejectedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                {isPending && registration.canProcess !== false ? (
                  <>
                    <button 
                      onClick={() => handleApprove(registration)} 
                      disabled={processing} 
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />Duyệt
                    </button>
                    <button 
                      onClick={() => handleReject(registration)} 
                      disabled={processing} 
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4" />Từ chối
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { setActivityDetailId(activity?.id); setIsDetailModalOpen(true); }} 
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <Eye className="h-4 w-4" />Chi tiết
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid View
    return (
      <div className={`group relative h-full ${isSelected ? 'ring-4 ring-indigo-500 ring-offset-2' : ''}`}>
        <div className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : ''}`}>
          {/* Image Header */}
          <div className="relative w-full h-36 overflow-hidden">
            <img 
              src={activityImage} 
              alt={activity?.ten_hd || 'Hoạt động'} 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
                {statusLabels[registration.trang_thai_dk]}
              </span>
            </div>
            
            {/* Points Badge */}
            {activity?.diem_rl && (
              <div className="absolute bottom-2 right-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                  <Award className="h-3 w-3" />+{activity.diem_rl}
                </span>
              </div>
            )}
            
            {/* Checkbox */}
            {isPending && (
              <div className="absolute bottom-2 left-2 z-20">
                <label className="flex items-center gap-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded px-2 py-1 shadow-lg hover:bg-white transition-all" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => handleToggleSelect(registration.id)} 
                    className="w-4 h-4 rounded border-2 cursor-pointer accent-indigo-600" 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </label>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-3 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
                {activity?.ten_hd || 'Hoạt động'}
              </h3>
              {activity?.loai_hd?.ten_loai_hd && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                  <Calendar className="h-3 w-3" />{activity.loai_hd.ten_loai_hd}
                </span>
              )}
            </div>

            {/* Student Card */}
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              {(() => {
                const avatar = getUserAvatar(student);
                return avatar.hasValidAvatar ? (
                  <img 
                    src={avatar.src} 
                    alt={avatar.alt} 
                    className="w-10 h-10 rounded-lg object-cover shadow-sm ring-1 ring-white" 
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.style.display = 'none'; 
                      e.target.nextElementSibling.style.display = 'flex'; 
                    }} 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-white">
                    {avatar.fallback}
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{student?.ho_ten || 'Không rõ tên'}</p>
                <p className="text-xs text-gray-600 truncate">MSSV: {registration.sinh_vien?.mssv}</p>
              </div>
            </div>

            {/* Activity Info */}
            <div className="space-y-1.5">
              {activity?.ngay_bd && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span>
                </div>
              )}
              {activity?.dia_diem && (
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                </div>
              )}
              {!isPending && approvedBy && (
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-600 truncate">Người duyệt: {approvedBy}</span>
                </div>
              )}
              {!isPending && rejectedBy && (
                <div className="flex items-center gap-1.5 text-xs">
                  <XCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                  <span className="text-gray-600 truncate">Người từ chối: {rejectedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 pt-0 mt-auto flex gap-2">
            {isPending && registration.canProcess !== false ? (
              <>
                <button 
                  onClick={() => handleApprove(registration)} 
                  disabled={processing} 
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-3.5 w-3.5" />Duyệt
                </button>
                <button 
                  onClick={() => handleReject(registration)} 
                  disabled={processing} 
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-3.5 w-3.5" />Từ chối
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setActivityDetailId(activity?.id); setIsDetailModalOpen(true); }} 
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Eye className="h-3.5 w-3.5" />Chi tiết
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
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600"></div>
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
                  <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-indigo-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-indigo-400">
                    ✓ PHÊ DUYỆT
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    {stats.total} ĐĂNG KÝ
                  </div>
                </div>
              </div>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">P</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ê</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">D</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Y</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ệ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-indigo-300 drop-shadow-[0_0_30px_rgba(165,180,252,0.5)]">
                    ĐĂNG KÝ
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-indigo-300/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Quản lý và phê duyệt đăng ký tham gia hoạt động của sinh viên
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 - Pending */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.pending}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>

              {/* Card 2 - Approved */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-emerald-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.approved}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>

              {/* Card 3 - Rejected */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-rose-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <XCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.rejected}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỪ CHỐI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
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
        `}</style>
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
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
              placeholder="Tìm kiếm sinh viên, MSSV, email, hoạt động..."
            />
          </div>

          {/* Bộ lọc và Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Semester Filter */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                <Calendar className="h-4 w-4 text-indigo-600" />
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
                  <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full min-w-[20px] text-center">
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
            
            {/* Right side: Sort dropdown + View mode toggle */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-medium text-gray-700"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="name-az">Tên A → Z</option>
                  <option value="name-za">Tên Z → A</option>
                </select>
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                <button
                  onClick={() => setDisplayViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    displayViewMode === 'grid' 
                      ? 'bg-white shadow-md text-indigo-600 border border-indigo-200' 
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
                      ? 'bg-white shadow-md text-indigo-600 border border-indigo-200' 
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
                  <Filter className="h-5 w-5 text-indigo-600" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại hoạt động
                  </label>
                  <select
                    value={filters.type}
                    onChange={e => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  >
                    <option value="">Tất cả loại</option>
                    {Array.isArray(activityTypes) && activityTypes.map(type => {
                      const typeName = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || '');
                      const typeValue = typeof type === 'string' ? type : (type?.id?.toString() || type?.name || type?.ten_loai_hd || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (
                        <option key={typeKey} value={typeValue}>{typeName}</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MSSV
                  </label>
                  <input
                    type="text"
                    value={filters.mssv}
                    onChange={e => setFilters({ ...filters, mssv: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                    placeholder="Nhập MSSV"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={e => setFilters({ ...filters, from: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={e => setFilters({ ...filters, to: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm RL tối thiểu
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={filters.minPoints}
                    onChange={e => setFilters({ ...filters, minPoints: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm RL tối đa
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={filters.maxPoints}
                    onChange={e => setFilters({ ...filters, maxPoints: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Filter Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title="Chuyển chế độ hiển thị"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setViewMode('pending'); setSelectedIds([]); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Clock className="h-4 w-4" />Chờ duyệt{stats.pending > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.pending}</span>)}</button>
              <button onClick={() => { setViewMode('approved'); setSelectedIds([]); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><CheckCircle className="h-4 w-4" />Đã duyệt{stats.approved > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.approved}</span>)}</button>
              <button onClick={() => { setViewMode('rejected'); setSelectedIds([]); }} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><XCircle className="h-4 w-4" />Từ chối{stats.rejected > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.rejected}</span>)}</button>
            </div>
          )}
          
          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select value={viewMode} onChange={e => { setViewMode(e.target.value); setSelectedIds([]); }} className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm">
                <option value="pending">Chờ duyệt ({stats.pending})</option>
                <option value="approved">Đã duyệt ({stats.approved})</option>
                <option value="rejected">Từ chối ({stats.rejected})</option>
              </select>
              {(() => { const configs = { pending: { icon: Clock, gradient: 'from-yellow-500 to-orange-500', count: stats.pending }, approved: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', count: stats.approved }, completed: { icon: Trophy, gradient: 'from-blue-600 to-indigo-600', count: stats.participated }, rejected: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: stats.rejected } }; const currentConfig = configs[viewMode] || configs.pending; const CurrentIcon = currentConfig?.icon || Filter; return (<div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentConfig?.gradient || 'from-gray-400 to-gray-500'} text-white rounded-xl shadow-md`}><CurrentIcon className="h-4 w-4" /><span className="font-bold text-sm">{currentConfig?.count || 0}</span></div>); })()}
            </div>
          )}
          
          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <button onClick={() => { setViewMode('pending'); setSelectedIds([]); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Chờ duyệt"><Clock className={`h-5 w-5 ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} /><span className={`text-xs font-bold ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.pending}</span></button>
              <button onClick={() => { setViewMode('approved'); setSelectedIds([]); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Đã duyệt"><CheckCircle className={`h-5 w-5 ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} /><span className={`text-xs font-bold ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.approved}</span></button>
              <button onClick={() => { setViewMode('rejected'); setSelectedIds([]); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Từ chối"><XCircle className={`h-5 w-5 ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} /><span className={`text-xs font-bold ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.rejected}</span></button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {viewMode === 'pending' && filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 rounded-lg px-3 py-2 transition-all">
                <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length} onChange={handleToggleSelectAll} className="w-5 h-5 rounded border-2 cursor-pointer accent-indigo-600" />
                <span className="font-semibold text-gray-700">Chọn tất cả ({filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length})</span>
              </label>
              {selectedIds.length > 0 && (<span className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-bold shadow-md animate-pulse">✓ Đã chọn: {selectedIds.length}</span>)}
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <button onClick={() => setSelectedIds([])} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Bỏ chọn</button>
                  <button onClick={handleBulkApprove} disabled={processing} className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><CheckCircle className="w-5 h-5" />{processing ? 'Đang xử lý...' : `Phê duyệt ${selectedIds.length} đăng ký`}</button>
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">← Chọn các đăng ký để phê duyệt hàng loạt</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {viewMode === 'pending' && filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 rounded-lg px-3 py-2 transition-all">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}
                  onChange={handleToggleSelectAll}
                  className="w-5 h-5 rounded border-2 cursor-pointer accent-indigo-600"
                />
                <span className="font-semibold text-gray-700">Chọn tất cả ({filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length})</span>
              </label>
              {selectedIds.length > 0 && (
                <span className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-bold shadow-md">
                  ✓ Đã chọn: {selectedIds.length}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Bỏ chọn
                  </button>
                  <button
                    onClick={handleBulkApprove}
                    disabled={processing}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {processing ? 'Đang xử lý...' : `Phê duyệt ${selectedIds.length} đăng ký`}
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  ← Chọn các đăng ký để phê duyệt hàng loạt
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registrations Grid/List */}
      {filteredRegistrations.length > 0 ? (
        <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filteredRegistrations.map(reg => (
            <RegistrationCard key={reg.id} registration={reg} />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {viewMode === 'pending' && <Clock className="h-12 w-12 text-amber-600" />}
              {viewMode === 'approved' && <CheckCircle className="h-12 w-12 text-emerald-600" />}
              {viewMode === 'rejected' && <XCircle className="h-12 w-12 text-rose-600" />}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{searchTerm ? 'Không tìm thấy đăng ký' : viewMode === 'pending' ? 'Không có đăng ký chờ duyệt' : viewMode === 'approved' ? 'Không có đăng ký đã duyệt' : 'Không có đăng ký bị từ chối'}</h3>
            <p className="text-gray-600 text-lg">{searchTerm ? 'Thử tìm kiếm với từ khóa khác' : viewMode === 'pending' ? 'Tất cả đăng ký đã được xử lý' : viewMode === 'approved' ? 'Chưa có đăng ký nào được phê duyệt' : 'Chưa có đăng ký nào bị từ chối'}</p>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activityId={activityDetailId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActivityDetailId(null);
        }}
      />
    </div>
  );
}
