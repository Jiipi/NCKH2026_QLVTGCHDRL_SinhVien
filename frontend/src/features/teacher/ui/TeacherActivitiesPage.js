import React, { useState, useEffect } from 'react';
import { 
  Activity, Search, Eye, Calendar, MapPin, Users, Award, 
  CheckCircle, XCircle, Filter, LayoutGrid, List, Tag, Grid3X3, 
  Clock, Sparkles, Plus, SlidersHorizontal, RefreshCw, X
} from 'lucide-react';
import http from '../../../shared/api/http';
import useSemesterData from '../../../hooks/useSemesterData';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import { getBestActivityImage } from '../../../shared/lib/activityImages';
import ActivityTypesManagementPage from '../../activity-types/pages/ActivityTypesManagementPage';
import { useNotification } from '../../../contexts/NotificationContext';

const TeacherActivities = () => {
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' | 'types'
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'list' | 'grid'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [activityTypes, setActivityTypes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [statusViewMode, setStatusViewMode] = useState('pills'); // 'pills' | 'dropdown' | 'compact'
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    from: '',
    to: '',
    minPoints: '',
    maxPoints: ''
  });
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  // Semester filter state (reuse logic consistent with monitor pages)
  const getCurrentSemesterValue = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 7 && currentMonth <= 11) return `hoc_ky_1-${currentYear}`;
    else if (currentMonth === 12) return `hoc_ky_2-${currentYear}`;
    else if (currentMonth >= 1 && currentMonth <= 4) return `hoc_ky_2-${currentYear - 1}`;
    else return `hoc_ky_1-${currentYear}`;
  };
  const [semester, setSemester] = useState(getCurrentSemesterValue());

  const { options: semesterOptions, isWritable, status: semesterStatus } = useSemesterData(semester);

  useEffect(() => {
    // Initial load / when semester or pagination changes
    fetchActivities();
    loadActivityTypes();
  }, [semester, page, limit]);

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

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // ✅ Gửi semester để backend lọc đúng học kỳ
      const response = await http.get('/activities', {
        params: { 
          page,
          limit,
          semester: semester || undefined
        }
      });
      
      // Parse response data the same way as ClassActivities
      const responseData = response.data?.data || response.data || {};
      const items = responseData.items || responseData.data || responseData || [];
      const itemsArray = Array.isArray(items) ? items : [];
      setActivities(itemsArray);
      const pagination = response.data?.data?.pagination || {};
      const nextTotal = typeof pagination.total === 'number' ? pagination.total : itemsArray.length;
      setTotal(nextTotal);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hoạt động:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityDetails = async (activityId) => {
    try {
      const response = await http.get(`/activities/${activityId}`);
      const activityData = response.data?.data || response.data;
      setSelectedActivity(activityData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết hoạt động:', error);
      // Fallback: sử dụng dữ liệu từ danh sách
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        setSelectedActivity(activity);
        setShowDetailModal(true);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'cho_duyet': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'da_duyet': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'tu_choi': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'da_huy': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'ket_thuc': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'cho_duyet': return 'Chờ duyệt';
      case 'da_duyet': return 'Đã duyệt';
      case 'tu_choi': return 'Từ chối';
      case 'da_huy': return 'Đã hủy';
      case 'ket_thuc': return 'Kết thúc';
      default: return 'Chưa xác định';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const needle = searchTerm.toLowerCase();
    const matchesSearch = !needle ||
      activity.ten_hd?.toLowerCase().includes(needle) ||
      activity.mo_ta?.toLowerCase().includes(needle) ||
      activity.dia_diem?.toLowerCase().includes(needle);
    
    // Status filter
    const matchesStatus = statusFilter 
      ? activity.trang_thai === statusFilter 
      : (activity.trang_thai === 'da_duyet' || activity.trang_thai === 'ket_thuc');
    
    // Advanced filters
    const matchesType = !filters.type || activity.loai_hd_id?.toString() === filters.type;
    const matchesLocation = !filters.location || activity.dia_diem?.toLowerCase().includes(filters.location.toLowerCase());
    const matchesFrom = !filters.from || new Date(activity.ngay_bd) >= new Date(filters.from);
    const matchesTo = !filters.to || new Date(activity.ngay_bd) <= new Date(filters.to);
    const matchesMinPoints = !filters.minPoints || (activity.diem_rl || 0) >= parseFloat(filters.minPoints);
    const matchesMaxPoints = !filters.maxPoints || (activity.diem_rl || 0) <= parseFloat(filters.maxPoints);
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation && 
           matchesFrom && matchesTo && matchesMinPoints && matchesMaxPoints;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        const ta_old = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
        const tb_old = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
        return ta_old - tb_old;
      case 'name-az':
        return (a.ten_hd || '').localeCompare(b.ten_hd || '', 'vi');
      case 'name-za':
        return (b.ten_hd || '').localeCompare(a.ten_hd || '', 'vi');
      case 'points-high':
        return (b.diem_rl || 0) - (a.diem_rl || 0);
      case 'points-low':
        return (a.diem_rl || 0) - (b.diem_rl || 0);
      case 'newest':
      default:
        const ta = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
        const tb = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
        return tb - ta;
    }
  });

  const getTypeColor = (activity) => {
    return activity?.loai_hd?.mau_sac || '#6366f1'; // Indigo fallback
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.location) count++;
    if (filters.from) count++;
    if (filters.to) count++;
    if (filters.minPoints) count++;
    if (filters.maxPoints) count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      type: '',
      location: '',
      from: '',
      to: '',
      minPoints: '',
      maxPoints: ''
    });
  };

  // Fallback client-side pagination to ensure render <= limit items
  const effectiveTotal = total && total > 0 ? total : filteredActivities.length;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  const pageItems = filteredActivities.slice(startIdx, endIdx);

  const handleApproveActivity = async (activityId) => {
    const confirmed = await confirm({
      title: 'Xác nhận phê duyệt',
      message: 'Bạn có chắc chắn muốn phê duyệt hoạt động này?',
      confirmText: 'Phê duyệt',
      cancelText: 'Hủy'
    });

    if (!confirmed) return;
    
    try {
      await http.post(`/teacher/activities/${activityId}/approve`);
      showSuccess('Phê duyệt hoạt động thành công!');
      await fetchActivities();
    } catch (error) {
      console.error('Lỗi khi phê duyệt hoạt động:', error);
      showError(error.response?.data?.message || error.message || 'Không thể phê duyệt');
    }
  };

  const handleRejectActivity = async (activityId) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason || !reason.trim()) {
      showWarning('Vui lòng nhập lý do từ chối');
      return;
    }

    const confirmed = await confirm({
      title: 'Xác nhận từ chối',
      message: `Từ chối hoạt động?\n\nLý do: ${reason}`,
      confirmText: 'Từ chối',
      cancelText: 'Hủy'
    });

    if (!confirmed) return;
    
    try {
      await http.post(`/teacher/activities/${activityId}/reject`, { reason: reason.trim() });
      showSuccess('Từ chối hoạt động thành công!');
      await fetchActivities();
    } catch (error) {
      console.error('Lỗi khi từ chối hoạt động:', error);
      showError(error.response?.data?.message || error.message || 'Không thể từ chối');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
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
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full"></div>

        {/* Main Content Container with Glassmorphism */}
        <div className="relative z-10 p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
            
            {/* Top Bar with Badge */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-indigo-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-indigo-400">
                    ⚡ QUẢN LÝ
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    {activeTab === 'activities' ? `${activities.length} HOẠT ĐỘNG` : `${activityTypes.length} LOẠI`}
                  </div>
                </div>
              </div>
              {activeTab === 'types' && (
                <button
                  onClick={() => {
                    // Trigger modal in ActivityTypesManagementPage
                    const event = new CustomEvent('openActivityTypeModal');
                    window.dispatchEvent(event);
                  }}
                  className="group flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-white/50 hover:scale-105 font-bold"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  Thêm mới
                </button>
              )}
            </div>

            {/* Main Title Section */}
            <div className="mb-6">
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">D</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">A</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">M</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ụ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">C</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-pink-300 drop-shadow-[0_0_30px_rgba(249,168,212,0.5)]">
                    HOẠT ĐỘNG
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-pink-300/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed">
                Xem và quản lý tất cả các hoạt động rèn luyện
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                  activeTab === 'activities'
                    ? 'bg-pink-400 text-black scale-105 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <Activity className="h-5 w-5" />
                Danh sách hoạt động
              </button>
              <button
                onClick={() => setActiveTab('types')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                  activeTab === 'types'
                    ? 'bg-purple-400 text-black scale-105 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <Tag className="h-5 w-5" />
                Loại hoạt động
              </button>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 - Activities Stats */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative border-4 border-black bg-white p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 hover:bg-pink-100">
                  <Activity className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{activities.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 2 - Types Stats */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative border-4 border-black bg-white p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 hover:bg-purple-100">
                  <Tag className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{activityTypes.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">LOẠI HOẠT ĐỘNG</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          .animate-bounce {
            animation: bounce-slow 3s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'types' ? (
        <ActivityTypesManagementPage />
      ) : (
        <>
          {/* Filters */}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300"
                  placeholder="Tìm kiếm theo tên hoạt động, địa điểm..."
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
                      <option value="name-az">Tên A-Z</option>
                      <option value="name-za">Tên Z-A</option>
                      <option value="points-high">Điểm cao nhất</option>
                      <option value="points-low">Điểm thấp nhất</option>
                    </select>
                  </div>

                  <div className="w-px h-8 bg-gray-200"></div>

                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        viewMode === 'grid'
                          ? 'bg-white shadow-md text-indigo-600 border border-indigo-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Hiển thị dạng lưới"
                    >
                      <Grid3X3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Lưới</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        viewMode === 'list'
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
                        {activityTypes.map(type => (
                          <option key={type.id} value={type.id?.toString()}>
                            {type.ten_loai_hd}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        value={filters.location}
                        onChange={e => setFilters({ ...filters, location: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                        placeholder="Nhập địa điểm"
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
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      !statusFilter
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                    {!statusFilter && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{activities.length}</span>}
                  </button>
                  <button
                    onClick={() => setStatusFilter('cho_duyet')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      statusFilter === 'cho_duyet'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Chờ duyệt
                    {statusFilter === 'cho_duyet' && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{filteredActivities.length}</span>}
                  </button>
                  <button
                    onClick={() => setStatusFilter('da_duyet')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      statusFilter === 'da_duyet'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Đã duyệt
                    {statusFilter === 'da_duyet' && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{filteredActivities.length}</span>}
                  </button>
                  <button
                    onClick={() => setStatusFilter('ket_thuc')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      statusFilter === 'ket_thuc'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Kết thúc
                    {statusFilter === 'ket_thuc' && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{filteredActivities.length}</span>}
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
                    Từ chối
                    {statusFilter === 'tu_choi' && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{filteredActivities.length}</span>}
                  </button>
                </div>
              )}

              {statusViewMode === 'dropdown' && (
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
                  >
                    <option value="">Tất cả ({activities.length})</option>
                    <option value="cho_duyet">Chờ duyệt ({activities.filter(a => a.trang_thai === 'cho_duyet').length})</option>
                    <option value="da_duyet">Đã duyệt ({activities.filter(a => a.trang_thai === 'da_duyet').length})</option>
                    <option value="ket_thuc">Kết thúc ({activities.filter(a => a.trang_thai === 'ket_thuc').length})</option>
                    <option value="tu_choi">Từ chối ({activities.filter(a => a.trang_thai === 'tu_choi').length})</option>
                  </select>
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md ${
                    !statusFilter ? 'bg-gradient-to-r from-indigo-500 to-purple-600' :
                    statusFilter === 'cho_duyet' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    statusFilter === 'da_duyet' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    statusFilter === 'ket_thuc' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                    'bg-gradient-to-r from-red-500 to-rose-500'
                  } text-white`}>
                    {!statusFilter ? <Filter className="h-4 w-4" /> :
                     statusFilter === 'cho_duyet' ? <Clock className="h-4 w-4" /> :
                     statusFilter === 'da_duyet' ? <CheckCircle className="h-4 w-4" /> :
                     statusFilter === 'tu_choi' ? <XCircle className="h-4 w-4" /> :
                     <Filter className="h-4 w-4" />}
                    <span className="font-bold text-sm">{filteredActivities.length}</span>
                  </div>
                </div>
              )}

              {statusViewMode === 'compact' && (
                <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      !statusFilter ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Tất cả"
                  >
                    <Filter className={`h-5 w-5 ${!statusFilter ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${!statusFilter ? 'text-purple-600' : 'text-gray-600'}`}>{activities.length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('cho_duyet')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'cho_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Chờ duyệt"
                  >
                    <Clock className={`h-5 w-5 ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>{activities.filter(a => a.trang_thai === 'cho_duyet').length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('da_duyet')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'da_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Đã duyệt"
                  >
                    <CheckCircle className={`h-5 w-5 ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>{activities.filter(a => a.trang_thai === 'da_duyet').length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('ket_thuc')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'ket_thuc' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Kết thúc"
                  >
                    <CheckCircle className={`h-5 w-5 ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-600'}`}>{activities.filter(a => a.trang_thai === 'ket_thuc').length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('tu_choi')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'tu_choi' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Từ chối"
                  >
                    <XCircle className={`h-5 w-5 ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-600'}`}>{activities.filter(a => a.trang_thai === 'tu_choi').length}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

      {/* Activities List */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
        <div className="p-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Activity className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy hoạt động</h3>
              <p className="text-gray-600 text-lg mb-8">
                {searchTerm ? `Không có hoạt động nào khớp với "${searchTerm}"` : 'Chưa có hoạt động nào trong học kỳ này'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageItems.map((activity) => {
                const statusColor = getStatusColor(activity.trang_thai);
                const statusLabel = getStatusLabel(activity.trang_thai);
                const registeredCount = activity.registrationCount ?? activity.so_dang_ky ?? activity._count?.dang_ky_hd ?? 0;
                const capacity = activity.sl_toi_da ?? activity.so_luong_toi_da ?? 0;
                const isPending = activity.trang_thai === 'cho_duyet';
                return (
                  <div key={activity.id} className="group relative h-full">
                    <div className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : ''}`}>
                      {/* Activity Visual */}
                      <div className="relative w-full h-36 overflow-hidden">
                        {(() => {
                          const best = getBestActivityImage(activity);
                          const hasImage = best && !String(best).endsWith('default-activity.svg');
                          if (hasImage) {
                            return (
                              <img
                                src={best}
                                alt={activity.ten_hd}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              />
                            );
                          }
                          return (
                            <div
                              className="w-full h-full"
                              style={{
                                background: `linear-gradient(135deg, ${getTypeColor(activity)} 0%, ${getTypeColor(activity)}CC 60%, ${getTypeColor(activity)}99 100%)`
                              }}
                            />
                          );
                        })()}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                        
                        {/* Points Badge */}
                        {activity.diem_rl && (
                          <div className="absolute bottom-2 right-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                              <Award className="h-3 w-3" />+{activity.diem_rl}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 space-y-3 relative z-10">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">
                            {activity.ten_hd || 'Chưa có tên'}
                          </h3>
                          {activity.loai_hd?.ten_loai_hd && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border"
                                  style={{
                                    color: getTypeColor(activity),
                                    borderColor: getTypeColor(activity),
                                    backgroundColor: '#ffffff'
                                  }}>
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTypeColor(activity) }}></span>
                              {activity.loai_hd.ten_loai_hd}
                            </span>
                          )}
                        </div>

                        {/* Activity Info */}
                        <div className="space-y-1.5">
                          {activity.ngay_bd && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-900 font-medium">{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                          {activity.dia_diem && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs">
                            <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-900 font-medium">{registeredCount} / {capacity} người</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-3 pt-0 mt-auto flex gap-2">
                        {isPending && isWritable ? (
                          <>
                            <button
                              onClick={() => handleApproveActivity(activity.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />Duyệt
                            </button>
                            <button
                              onClick={() => handleRejectActivity(activity.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <XCircle className="h-3.5 w-3.5" />Từ chối
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => fetchActivityDetails(activity.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <Eye className="h-3.5 w-3.5" />Chi tiết
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {pageItems.map((activity) => {
                const statusColor = getStatusColor(activity.trang_thai);
                const statusLabel = getStatusLabel(activity.trang_thai);
                const registeredCount = activity.registrationCount ?? activity.so_dang_ky ?? activity._count?.dang_ky_hd ?? 0;
                const capacity = activity.sl_toi_da ?? activity.so_luong_toi_da ?? 0;
                const isPending = activity.trang_thai === 'cho_duyet';
                return (
                  <div key={activity.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
                    <div className={`relative bg-white border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${isPending ? 'border-amber-200 shadow-lg shadow-amber-100' : 'border-gray-200'}`}>
                      <div className="flex items-stretch gap-4 p-4">
                        {/* Activity Visual */}
                        <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          {(() => {
                            const best = getBestActivityImage(activity);
                            const hasImage = best && !String(best).endsWith('default-activity.svg');
                            if (hasImage) {
                              return (
                                <img
                                  src={best}
                                  alt={activity.ten_hd}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              );
                            }
                            return (
                              <div
                                className="w-full h-full"
                                style={{
                                  background: `linear-gradient(135deg, ${getTypeColor(activity)} 0%, ${getTypeColor(activity)}CC 60%, ${getTypeColor(activity)}99 100%)`
                                }}
                              />
                            );
                          })()}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                          
                          {/* Status Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          
                          {/* Points Badge */}
                          {activity.diem_rl && (
                            <div className="absolute bottom-2 left-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                                <Award className="h-3 w-3" />+{activity.diem_rl}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                              {activity.ten_hd || 'Chưa có tên'}
                            </h3>
                            
                            {/* Activity Details */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {activity.loai_hd?.ten_loai_hd && (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTypeColor(activity) }}></span>
                                  <span className="text-gray-700 truncate" style={{ color: getTypeColor(activity) }}>{activity.loai_hd.ten_loai_hd}</span>
                                </div>
                              )}
                              {activity.ngay_bd && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="text-gray-900 font-medium">{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
                                </div>
                              )}
                              {activity.dia_diem && (
                                <div className="flex items-center gap-1.5 col-span-2">
                                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                  <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-900 font-medium">{registeredCount} / {capacity}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                          {isPending && isWritable ? (
                            <>
                              <button
                                onClick={() => handleApproveActivity(activity.id)}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                              >
                                <CheckCircle className="h-4 w-4" />Duyệt
                              </button>
                              <button
                                onClick={() => handleRejectActivity(activity.id)}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                              >
                                <XCircle className="h-4 w-4" />Từ chối
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => fetchActivityDetails(activity.id)}
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
              })}
            </div>
          )}

          {/* No pagination: load all */}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Đang hiển thị {filteredActivities.length ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, effectiveTotal)} / {effectiveTotal}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className={`px-3 py-2 rounded-lg border ${page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-300'}`}
          >
            Trước
          </button>
          <div className="text-sm text-gray-600">Trang {page} / {Math.max(1, Math.ceil(effectiveTotal / limit))}</div>
          <button
            disabled={page >= Math.ceil(effectiveTotal / limit)}
            onClick={() => setPage(p => Math.min(Math.ceil(effectiveTotal / limit) || 1, p + 1))}
            className={`px-3 py-2 rounded-lg border ${page >= Math.ceil(effectiveTotal / limit) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-300'}`}
          >
            Tiếp
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết hoạt động</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên hoạt động</label>
                <p className="text-gray-900">{selectedActivity.ten_hd || 'Chưa có tên'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <p className="text-gray-900">{selectedActivity.mo_ta || 'Không có mô tả'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                  <p className="text-gray-900">{selectedActivity.dia_diem || 'Chưa có địa điểm'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tối đa</label>
                  <p className="text-gray-900">{selectedActivity.sl_toi_da || 0} người</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                  <p className="text-gray-900">
                    {selectedActivity.ngay_bd ? new Date(selectedActivity.ngay_bd).toLocaleString('vi-VN') : 'Chưa có thời gian'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                  <p className="text-gray-900">
                    {selectedActivity.ngay_kt ? new Date(selectedActivity.ngay_kt).toLocaleString('vi-VN') : 'Chưa có thời gian'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điểm rèn luyện</label>
                  <p className="text-gray-900">{selectedActivity.diem_rl || 0} điểm</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <p className="text-gray-900">{getStatusLabel(selectedActivity.trang_thai)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người tạo</label>
                  <p className="text-gray-900">
                    {selectedActivity.nguoi_tao?.ho_ten || selectedActivity.nguoi_tao?.email || 'Không xác định'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại hoạt động</label>
                  <p className="text-gray-900">
                    {selectedActivity.loai_hd?.ten_loai_hd || 'Không xác định'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                  <p className="text-gray-900">
                    {selectedActivity.ngay_tao ? new Date(selectedActivity.ngay_tao).toLocaleString('vi-VN') : 'Không xác định'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn đăng ký</label>
                  <p className="text-gray-900">
                    {selectedActivity.han_dk ? new Date(selectedActivity.han_dk).toLocaleString('vi-VN') : 'Không giới hạn'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default TeacherActivities;
