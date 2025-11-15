import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, UserX, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Eye, FileText, Sparkles, TrendingUp, Mail, Phone, Award, MapPin, BookOpen, Trophy, ArrowUp, ArrowDown, SlidersHorizontal, RefreshCw, Grid3X3, List, X } from 'lucide-react';
import http from '../../shared/api/http';
import { useNotification } from '../../contexts/NotificationContext';
import { getActivityImage, getBestActivityImage } from '../../shared/lib/activityImages';
import { getUserAvatar } from '../../shared/lib/avatar';
import ActivityDetailModal from '../../entities/activity/ui/ActivityDetailModal';
import useSemesterData from '../../hooks/useSemesterData';
import Pagination from '../../shared/components/common/Pagination';

export default function ClassApprovalsModern() {
  const typeCacheRef = useRef({}); // cache activityId -> { loai_hd_id, loai_hd }
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'approved', 'rejected', 'completed'
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // Track selected registration IDs
  const [activityDetailId, setActivityDetailId] = useState(null); // For modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // For modal
  const [displayViewMode, setDisplayViewMode] = useState('grid'); // 'grid' or 'list'
  const [statusViewMode, setStatusViewMode] = useState('pills'); // 'pills' | 'dropdown' | 'compact'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
  const [activityTypes, setActivityTypes] = useState([]);
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  // Pagination state (align with teacher approvals)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Semester state (align with MonitorMyActivities)
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
  const [scrollDown, setScrollDown] = useState(false);

  // Status mappings (matching Prisma enum TrangThaiDangKy)
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
    setPage(1); // reset page when semester changes
  }, [semester]);

  // Reset về trang 1 khi thay đổi chế độ xem, tìm kiếm, hoặc bộ lọc
  useEffect(() => {
    setPage(1);
  }, [viewMode, searchTerm, filters]);

  // Load activity types for filter
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

  // Helper functions for filters
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

  const handleScrollToggle = () => {
    if (scrollDown) window.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const res = await http.get('/core/monitor/registrations', {
        params: { status: 'all', semester }
      });

      // Normalize response: support both array and { items: [] }
      const payload = res.data?.data ?? res.data ?? [];
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
      console.log('[ClassApprovalsModern] Loaded registrations (core):', { total: items.length, semester });

      // Enrich registrations with activity type info if missing
      const enriched = await enrichActivityTypes(items);
      setRegistrations(enriched);
      setError('');
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Không thể tải danh sách đăng ký');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  // Enrich activity types for registrations to enable type filtering and tags
  const enrichActivityTypes = async (items) => {
    try {
      if (!Array.isArray(items) || items.length === 0) return items;
      const cache = typeCacheRef.current;

      // Collect unique activity IDs that are missing type info and not yet cached
      const ids = Array.from(new Set(
        items
          .map(r => r?.hoat_dong?.id)
          .filter(id => !!id)
      ));

      const missingIds = ids.filter(id => {
        const r = items.find(it => it?.hoat_dong?.id === id);
        const hasType = r?.hoat_dong?.loai_hd || r?.hoat_dong?.loai_hd_id;
        return !hasType && !cache[id];
      });

      // Fetch details for missing IDs in small chunks
      const chunkSize = 8;
      for (let i = 0; i < missingIds.length; i += chunkSize) {
        const chunk = missingIds.slice(i, i + chunkSize);
        const results = await Promise.all(chunk.map(async (id) => {
          try {
            const res = await http.get(`/core/activities/${id}`);
            const data = res?.data?.data ?? res?.data ?? {};
            const loai_hd_id = data?.loai_hd_id ?? data?.loai_hd?.id ?? null;
            const loai_hd = data?.loai_hd ?? null;
            return { id, loai_hd_id, loai_hd };
          } catch (_) {
            return { id };
          }
        }));

        results.forEach(r => {
          if (r && r.id) {
            cache[r.id] = {
              ...(cache[r.id] || {}),
              ...(r.loai_hd_id ? { loai_hd_id: r.loai_hd_id } : {}),
              ...(r.loai_hd ? { loai_hd: r.loai_hd } : {})
            };
          }
        });
      }

      // Merge cache back into items
      const merged = items.map(reg => {
        const act = reg?.hoat_dong;
        if (!act || act?.loai_hd || act?.loai_hd_id) return reg;
        const patch = cache[act.id];
        return patch ? { ...reg, hoat_dong: { ...act, ...patch } } : reg;
      });

      return merged;
    } catch (e) {
      console.warn('[ClassApprovalsModern] enrichActivityTypes failed, returning original items');
      return items;
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
      if (!isWritable) return;
      await http.put(`/core/monitor/registrations/${registration.id}/approve`);
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
      if (!isWritable) return;
      await http.put(`/core/monitor/registrations/${registration.id}/reject`, { reason });
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
      if (!isWritable) return;
      // Prefer core bulk endpoint; fallback to sequential approves if unavailable
      let approvedCount = 0;
      try {
        const res = await http.post('/core/registrations/bulk-approve', {
          ids: selectedIds
        });
        approvedCount = res.data?.data?.approved || res.data?.approved || selectedIds.length;
      } catch (bulkErr) {
        // Fallback: sequential approves via monitor endpoint
        for (const id of selectedIds) {
          try { await http.put(`/core/monitor/registrations/${id}/approve`); approvedCount++; } catch (_) {}
        }
      }
      
      await loadRegistrations();
      setSelectedIds([]); // Clear selection
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
      case 'completed':
        matchesViewMode = reg.trang_thai_dk === 'da_tham_gia';
        break;
      default:
        // Default to pending if viewMode is invalid
        matchesViewMode = reg.trang_thai_dk === 'cho_duyet';
    }
    
    // Advanced filters
    let matchesType = true;
    let matchesDateFrom = true;
    let matchesDateTo = true;
    let matchesPointsMin = true;
    let matchesPointsMax = true;
    let matchesMSSV = true;

    // Filter by type (using ID)
    if (filters.type) {
      const filterValue = filters.type;
      const filterId = parseInt(filterValue);
      
      if (isNaN(filterId)) {
        // Filter by name
        const activityTypeName = activity?.loai_hd?.ten_loai_hd || '';
        matchesType = activityTypeName.toLowerCase() === filterValue.toLowerCase();
      } else {
        // Filter by ID
        const activityTypeId = activity?.loai_hd_id || activity?.loai_hd?.id;
        const activityId = activityTypeId ? parseInt(activityTypeId) : null;
        matchesType = activityId !== null && activityId === filterId;
      }
    }

    // Filter by date range (activity start date)
    if (filters.from) {
      const fromDate = new Date(filters.from);
      const activityDate = activity?.ngay_bd ? new Date(activity.ngay_bd) : null;
      matchesDateFrom = activityDate && activityDate >= fromDate;
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      const activityDate = activity?.ngay_bd ? new Date(activity.ngay_bd) : null;
      matchesDateTo = activityDate && activityDate <= toDate;
    }

    // Filter by points range
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

    // Filter by MSSV
    if (filters.mssv) {
      const mssv = reg.sinh_vien?.mssv || '';
      matchesMSSV = mssv.toLowerCase().includes(filters.mssv.toLowerCase());
    }
    
    return matchesSearch && matchesViewMode && matchesType && matchesDateFrom && matchesDateTo && matchesPointsMin && matchesPointsMax && matchesMSSV;
  }).sort((a, b) => {
    const ta = new Date(a.ngay_duyet || a.updated_at || a.updatedAt || a.ngay_dang_ky || a.createdAt || a.tg_diem_danh || 0).getTime();
    const tb = new Date(b.ngay_duyet || b.updated_at || b.updatedAt || b.ngay_dang_ky || b.createdAt || b.tg_diem_danh || 0).getTime();
    return tb - ta; // newest action first
  });

  // Client-side pagination similar to teacher page
  const effectiveTotal = filteredRegistrations.length;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  const pageItems = filteredRegistrations.slice(startIdx, endIdx);

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.trang_thai_dk === 'cho_duyet').length,
    approved: registrations.filter(r => r.trang_thai_dk === 'da_duyet').length,
    rejected: registrations.filter(r => r.trang_thai_dk === 'tu_choi').length,
    participated: registrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length
  };

  const RegistrationCard = ({ registration }) => {
    const student = registration.sinh_vien?.nguoi_dung;
    const activity = registration.hoat_dong;
    const isPending = registration.trang_thai_dk === 'cho_duyet';
    const activityImage = getBestActivityImage(activity);
    const isSelected = selectedIds.includes(registration.id);
    const approvedBy = registration.trang_thai_dk === 'da_duyet' ? roleLabel(registration.approvedByRole) : null;
    const rejectedBy = registration.trang_thai_dk === 'tu_choi' ? roleLabel(registration.rejectedByRole) : null;

    // LIST MODE - Compact horizontal layout (matching ClassActivities style)
    if (displayViewMode === 'list') {
    return (
        <div className={`group relative ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
          
          <div className={`relative bg-white border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${
            isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'
          }`}>
            <div className="flex items-stretch gap-4 p-4">
              {/* Compact Image */}
              <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img 
                  src={activityImage} 
                  alt={activity?.ten_hd || 'Hoạt động'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
                    {statusLabels[registration.trang_thai_dk]}
                  </span>
        </div>
                {activity?.diem_rl && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                      <Award className="h-3 w-3" />
                      +{activity.diem_rl}
                    </span>
                  </div>
                )}
                {/* Checkbox for pending items */}
          {isPending && (
                  <div className="absolute bottom-2 right-2 z-20">
                    <label className="flex items-center gap-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded px-2 py-1 shadow-lg hover:bg-white transition-all" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(registration.id)}
                        className="w-4 h-4 rounded border-2 cursor-pointer accent-blue-600"
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
            </div>
          )}
              </div>
              
              {/* Content */}
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
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {activity?.loai_hd?.ten_loai_hd || 'Chưa phân loại'}
                      </span>
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
                    {/* Approver/rejector info */}
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
                {isPending && registration.canProcess !== false && (
                  <>
                    <button
                      onClick={() => handleApprove(registration)}
                      disabled={processing}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(registration)}
                      disabled={processing}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4" />
                      Từ chối
                    </button>
                  </>
                )}
                {!isPending && (
                  <button
                    onClick={() => {
                      setActivityDetailId(activity?.id);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </button>
                )}
                {isPending && registration.canProcess === false && (
                  <button
                    onClick={() => {
                      setActivityDetailId(activity?.id);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // GRID MODE - Compact vertical layout (matching ClassActivities style)
    return (
      <div className={`group relative h-full ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}>
        <div className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full ${
          isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : ''
        }`}>
          {/* Activity Image - Compact */}
          <div className="relative w-full h-36 overflow-hidden">
          <img 
            src={activityImage} 
            alt={activity?.ten_hd || 'Hoạt động'}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
            {/* Status Badge on Image - Compact */}
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[registration.trang_thai_dk]}`}>
                {statusLabels[registration.trang_thai_dk]}
              </span>
              </div>
            
            {/* Points Badge on Image - Compact */}
            {activity?.diem_rl && (
              <div className="absolute bottom-2 right-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                  <Award className="h-3 w-3" />
                  +{activity.diem_rl}
              </span>
            </div>
          )}
          
            {/* Checkbox for pending items */}
            {isPending && (
              <div className="absolute bottom-2 left-2 z-20">
                <label className="flex items-center gap-1 cursor-pointer bg-white/95 backdrop-blur-sm rounded px-2 py-1 shadow-lg hover:bg-white transition-all" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(registration.id)}
                    className="w-4 h-4 rounded border-2 cursor-pointer accent-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
          </div>
            )}
        </div>
        
          {/* Content - Compact */}
          <div className="flex-1 p-4 space-y-3 relative z-10">
            {/* Header - Compact */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
                {activity?.ten_hd || 'Hoạt động'}
              </h3>
              
              {/* Category tag - Compact */}
              {activity?.loai_hd?.ten_loai_hd && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                  <Calendar className="h-3 w-3" />
                  {activity.loai_hd.ten_loai_hd}
            </span>
              )}
          </div>

            {/* Student Info - Compact */}
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

            {/* Compact Meta Info */}
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
            {/* Approver/rejector info */}
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

          {/* Compact Actions */}
          <div className="p-3 pt-0 mt-auto flex gap-2">
          {isPending && registration.canProcess !== false && (
              <>
              <button
                onClick={() => handleApprove(registration)}
                disabled={processing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Duyệt
              </button>
              <button
                onClick={() => handleReject(registration)}
                disabled={processing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <XCircle className="h-3.5 w-3.5" />
                Từ chối
              </button>
              </>
          )}
          {!isPending && (
              <button
                onClick={() => {
                  setActivityDetailId(activity?.id);
                  setIsDetailModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </button>
          )}
          {isPending && registration.canProcess === false && (
              <button
                onClick={() => {
                  setActivityDetailId(activity?.id);
                  setIsDetailModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
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

  // Calculate stats
  const totalRegistrations = filteredRegistrations.length;
  const pendingCount = filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length;
  const approvedCount = filteredRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length;
  const completedCount = filteredRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length;

  return (
    <div className="space-y-6">
      {/* Ultra Modern Header - Neo-brutalism + Glassmorphism Hybrid */}
      <div className="relative min-h-[280px]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"></div>
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
                  <div className="absolute inset-0 bg-green-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-green-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-green-400">
                    ✓ PHÊ DUYỆT
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {totalRegistrations} ĐĂNG KÝ
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
                  <span className="relative z-10 text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]">
                    ĐĂNG KÝ
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-green-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Quản lý và phê duyệt đăng ký tham gia hoạt động của sinh viên
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 - Pending */}
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
                <div className="relative bg-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Trophy className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{completedCount}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ THAM GIA</p>
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

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên, MSSV, email, hoạt động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      const typeValue = typeof type === 'string' ? type : (type?.id?.toString() || type?.name || type?.ten_loai_hd || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (
                        <option key={typeKey} value={typeValue}>{typeName}</option>
                      );
                    })}
                  </select>
                </div>

                {/* MSSV */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MSSV
                  </label>
                  <input
                    type="text"
                    value={filters.mssv}
                    onChange={e => setFilters({ ...filters, mssv: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Nhập MSSV"
                  />
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

                {/* Điểm RL tối thiểu */}
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
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Điểm RL tối đa */}
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
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Tabs - Multiple View Modes */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        
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
              onClick={() => { setViewMode('pending'); setSelectedIds([]); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              Chờ duyệt
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {stats.pending}
                </span>
              )}
            </button>
            
            <button
              onClick={() => { setViewMode('approved'); setSelectedIds([]); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'approved'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Đã duyệt
              {stats.approved > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {stats.approved}
                </span>
              )}
            </button>
            
            <button
              onClick={() => { setViewMode('completed'); setSelectedIds([]); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'completed'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Đã tham gia
              {stats.participated > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {stats.participated}
                </span>
              )}
            </button>
            
            <button
              onClick={() => { setViewMode('rejected'); setSelectedIds([]); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <XCircle className="h-4 w-4" />
              Từ chối
              {stats.rejected > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {stats.rejected}
                </span>
              )}
            </button>
          </div>
          )}

          {/* Dropdown Mode */}
          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select
                value={viewMode}
                onChange={e => { setViewMode(e.target.value); setSelectedIds([]); }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
              >
                <option value="pending">Chờ duyệt ({stats.pending})</option>
                <option value="approved">Đã duyệt ({stats.approved})</option>
                <option value="completed">Đã tham gia ({stats.participated})</option>
                <option value="rejected">Từ chối ({stats.rejected})</option>
              </select>
              {(() => {
                const configs = {
                  pending: { icon: Clock, gradient: 'from-yellow-500 to-orange-500', count: stats.pending },
                  approved: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', count: stats.approved },
                  completed: { icon: Trophy, gradient: 'from-blue-600 to-indigo-600', count: stats.participated },
                  rejected: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: stats.rejected }
                };
                const currentConfig = configs[viewMode] || configs.pending;
                const CurrentIcon = currentConfig?.icon || Filter;
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
                onClick={() => { setViewMode('pending'); setSelectedIds([]); }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Chờ duyệt"
              >
                <Clock className={`h-5 w-5 ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {stats.pending}
                </span>
              </button>
              
              <button
                onClick={() => { setViewMode('approved'); setSelectedIds([]); }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Đã duyệt"
              >
                <CheckCircle className={`h-5 w-5 ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {stats.approved}
                </span>
              </button>
              
              <button
                onClick={() => { setViewMode('completed'); setSelectedIds([]); }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'completed' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Đã tham gia"
              >
                <Trophy className={`h-5 w-5 ${viewMode === 'completed' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'completed' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {stats.participated}
                </span>
              </button>
              
              <button
                onClick={() => { setViewMode('rejected'); setSelectedIds([]); }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Từ chối"
              >
                <XCircle className={`h-5 w-5 ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {stats.rejected}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar - Only show for pending view */}
        {viewMode === 'pending' && filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 rounded-lg px-3 py-2 transition-all">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}
                    onChange={handleToggleSelectAll}
                    className="w-5 h-5 rounded border-2 cursor-pointer accent-blue-600"
                  />
                  <span className="font-semibold text-gray-700">Chọn tất cả ({filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length})</span>
                </label>
                {selectedIds.length > 0 && (
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold shadow-md animate-pulse">
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
                  disabled={processing || !isWritable}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      <div>
        {effectiveTotal > 0 ? (
          <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
            {pageItems.map(reg => (
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
                {viewMode === 'completed' && <Trophy className="h-12 w-12 text-blue-600" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'Không tìm thấy đăng ký' : 
                 viewMode === 'pending' ? 'Không có đăng ký chờ duyệt' :
                 viewMode === 'approved' ? 'Không có đăng ký đã duyệt' :
                 viewMode === 'rejected' ? 'Không có đăng ký bị từ chối' :
                 viewMode === 'completed' ? 'Không có đăng ký hoàn thành' :
                 'Chưa có đăng ký nào'}
              </h3>
              <p className="text-gray-600 text-lg">
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : viewMode === 'pending' ? 'Tất cả đăng ký đã được xử lý'
                  : viewMode === 'approved' ? 'Chưa có đăng ký nào được phê duyệt'
                  : viewMode === 'rejected' ? 'Chưa có đăng ký nào bị từ chối'
                  : viewMode === 'completed' ? 'Chưa có đăng ký nào hoàn thành'
                  : 'Chưa có sinh viên nào đăng ký hoạt động'}
              </p>
            </div>
          </div>
        )}

        {/* Pagination - Pattern từ trang sinh viên */}
        {effectiveTotal > 0 && (
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 mt-6">
            <Pagination
              pagination={{ page, limit, total: effectiveTotal }}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
              itemLabel="đăng ký"
              showLimitSelector={true}
            />
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activityId={activityDetailId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActivityDetailId(null);
        }}
      />

      {/* Scroll toggle now handled by global footer */}
    </div>
  );
}