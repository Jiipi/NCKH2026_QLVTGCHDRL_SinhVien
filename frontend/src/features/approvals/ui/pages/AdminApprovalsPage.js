import React, { useState, useMemo } from 'react';
import { 
  Globe, Building, Users, Clock, CheckCircle, XCircle, Award, 
  Search, Filter, Calendar, RefreshCw, SlidersHorizontal, Grid3X3, List,
  Trophy, Sparkles, X
} from 'lucide-react';

// Hook & Services
import { useAdminApprovals } from '../../model/hooks/useAdminApprovals';
import { useSemesterData } from '../../../../shared/hooks';

// Shared Components (3-Tier Architecture)
import ActivityDetailModal from '../../../../entities/activity/ui/ActivityDetailModal';
import SemesterFilter from '../../../../widgets/semester/ui/SemesterSwitcher';
import { AdminRegistrationCard } from '../shared';
import Pagination from '../../../../shared/components/common/Pagination';

// ============================================
// CONSTANTS
// ============================================
const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_tham_gia: 'Đã tham gia'
};

const STATUS_COLORS = {
  cho_duyet: 'border border-amber-200 bg-amber-50 text-amber-700',
  da_duyet: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  tu_choi: 'border border-rose-200 bg-rose-50 text-rose-700',
  da_tham_gia: 'border border-blue-200 bg-blue-50 text-blue-700'
};

const ROLE_DISPLAY = {
  ADMIN: 'Admin',
  GIANG_VIEN: 'Giảng viên',
  LOP_TRUONG: 'Lớp trưởng',
  SINH_VIEN: 'Sinh viên'
};

const formatRegistrationDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
};

const roleLabel = (role) => ROLE_DISPLAY[role] || role || 'Không rõ';

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminApprovalsPage() {
  const initialSemester = useMemo(() => sessionStorage.getItem('current_semester') || '', []);
  const { options: semesterOptions } = useSemesterData(initialSemester);

  const {
    loading,
    processing,
    error,
    semester,
    setSemester,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    scopeTab,
    setScopeTab,
    selectedClass,
    setSelectedClass,
    pagination,
    filteredRegistrations,
    activities,
    classes,
    stats,
    handleApprove,
    handleReject,
    handleBulkApprove,
    handleToggleSelect,
    handleToggleSelectAll,
    handlePageChange,
    handleLimitChange,
    clearAllFilters,
    getActiveFilterCount,
    refresh,
    SCOPE_OPTIONS,
    sortBy,
    setSortBy
  } = useAdminApprovals(initialSemester);

  const [activityDetailId, setActivityDetailId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [displayViewMode, setDisplayViewMode] = useState('grid');
  const [statusViewMode, setStatusViewMode] = useState('pills');

  const activeFilterCount = getActiveFilterCount();
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  // Backend already handles pagination, filteredRegistrations is the current page data
  const pendingInCurrentList = filteredRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length;

  // Filter semester options based on scope tab
  // - Tab "Toàn hệ thống": Có option "Tất cả học kỳ" (value='')
  // - Tab "Theo lớp": Không có option "Tất cả học kỳ", chỉ các học kỳ cụ thể
  const filteredSemesterOptions = useMemo(() => {
    if (scopeTab === 'class') {
      // Remove "Tất cả học kỳ" option when filtering by class
      return semesterOptions.filter(opt => opt.value !== '');
    }
    return semesterOptions;
  }, [semesterOptions, scopeTab]);

  // When switching to class tab, ensure semester is not empty
  React.useEffect(() => {
    if (scopeTab === 'class' && semester === '' && filteredSemesterOptions.length > 0) {
      // Auto-select the first available semester
      setSemester(filteredSemesterOptions[0]?.value || '');
    }
  }, [scopeTab, semester, filteredSemesterOptions, setSemester]);

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
      {/* ============================================ */}
      {/* HERO HEADER - Neo-Brutalism + Glassmorphism */}
      {/* ============================================ */}
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
                  <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-yellow-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-yellow-400">
                    ⚡ QUẢN TRỊ
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {stats.total ?? 0} ĐĂNG KÝ
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
                  <span className="relative z-10 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                    ĐĂNG KÝ
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Quản lý và phê duyệt đăng ký tham gia hoạt động của sinh viên toàn hệ thống
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Pending */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.pending ?? 0}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>

              {/* Card 2 - Approved */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.approved ?? 0}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>

              {/* Card 3 - Participated */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Trophy className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.participated ?? 0}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ THAM GIA</p>
                </div>
              </div>

              {/* Card 4 - Rejected */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-red-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <XCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.rejected ?? 0}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỪ CHỐI</p>
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

      {/* ============================================ */}
      {/* SCOPE SELECTOR (Admin specific) */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {SCOPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setScopeTab(option.value);
                if (option.value === 'all') setSelectedClass('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                scopeTab === option.value
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {option.value === 'all' ? <Globe className="h-4 w-4" /> : <Building className="h-4 w-4" />}
              {option.label}
            </button>
          ))}
        </div>

        {scopeTab === 'class' && (
          <div className="p-4 rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Chọn lớp để xem đăng ký
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full md:w-96 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.ten_lop || cls.name} {cls.khoa ? `(${cls.khoa})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* SEARCH & FILTERS */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Search bar */}
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

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Semester Filter */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Học kỳ:</span>
                <SemesterFilter
                  value={semester}
                  label=""
                  options={filteredSemesterOptions}
                  onChange={setSemester}
                />
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

              {/* Activity Filter */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filters.activityId}
                  onChange={(e) => setFilters(prev => ({ ...prev, activityId: e.target.value }))}
                  className="border-none bg-transparent text-sm font-semibold text-gray-700 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  <option value="">Tất cả hoạt động</option>
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.ten_hd}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

              {/* Advanced Filter Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full min-w-[20px] text-center">
                    {activeFilterCount}
                  </span>
                )}
                <span className={`text-xs transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Clear filters button */}
              {activeFilterCount > 0 && (
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
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy || 'newest'}
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
          {showAdvancedFilters && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-indigo-600" />
                  Bộ lọc nâng cao
                </h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* MSSV */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">MSSV</label>
                  <input
                    type="text"
                    value={filters.mssv || ''}
                    onChange={e => setFilters({ ...filters, mssv: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                    placeholder="Nhập MSSV"
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sinh viên</label>
                  <input
                    type="text"
                    value={filters.studentName || ''}
                    onChange={e => setFilters({ ...filters, studentName: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                    placeholder="Nhập tên sinh viên"
                  />
                </div>

                {/* From date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={filters.fromDate || ''}
                    onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  />
                </div>

                {/* To date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={filters.toDate || ''}
                    onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* STATUS TABS */}
      {/* ============================================ */}
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
                onClick={() => { setActiveTab('pending'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'pending' 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Chờ duyệt
                {stats.pending > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.pending}</span>)}
              </button>
              <button 
                onClick={() => { setActiveTab('approved'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'approved' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Đã duyệt
                {stats.approved > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.approved}</span>)}
              </button>
              <button 
                onClick={() => { setActiveTab('participated'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'participated' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Trophy className="h-4 w-4" />
                Đã tham gia
                {stats.participated > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.participated}</span>)}
              </button>
              <button 
                onClick={() => { setActiveTab('rejected'); setSelectedIds([]); }} 
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'rejected' 
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Từ chối
                {stats.rejected > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.rejected}</span>)}
              </button>
            </div>
          )}

          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select 
                value={activeTab} 
                onChange={e => { setActiveTab(e.target.value); setSelectedIds([]); }} 
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
              >
                <option value="pending">Chờ duyệt ({stats.pending})</option>
                <option value="approved">Đã duyệt ({stats.approved})</option>
                <option value="participated">Đã tham gia ({stats.participated})</option>
                <option value="rejected">Từ chối ({stats.rejected})</option>
              </select>
            </div>
          )}

          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <button 
                onClick={() => { setActiveTab('pending'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Chờ duyệt"
              >
                <Clock className={`h-5 w-5 ${activeTab === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.pending}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('approved'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Đã duyệt"
              >
                <CheckCircle className={`h-5 w-5 ${activeTab === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.approved}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('participated'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'participated' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Đã tham gia"
              >
                <Trophy className={`h-5 w-5 ${activeTab === 'participated' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'participated' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.participated}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('rejected'); setSelectedIds([]); }} 
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`} 
                title="Từ chối"
              >
                <XCircle className={`h-5 w-5 ${activeTab === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${activeTab === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>{stats.rejected}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* BULK ACTION TOOLBAR (only show for pending) */}
      {/* ============================================ */}
      {activeTab === 'pending' && pendingInCurrentList > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 rounded-lg px-3 py-2 transition-all">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === pendingInCurrentList} 
                  onChange={handleToggleSelectAll} 
                  className="w-5 h-5 rounded border-2 cursor-pointer accent-indigo-600" 
                />
                <span className="font-semibold text-gray-700">Chọn tất cả ({pendingInCurrentList})</span>
              </label>
              {selectedIds.length > 0 && (
                <span className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-bold shadow-md animate-pulse">
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
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {processing ? 'Đang xử lý...' : `Phê duyệt ${selectedIds.length} đăng ký`}
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">← Chọn các đăng ký để phê duyệt hàng loạt</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* REGISTRATIONS LIST */}
      {/* ============================================ */}
      <div>
        {filteredRegistrations.length > 0 ? (
          <div className={displayViewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-3'
          }>
            {filteredRegistrations.map(reg => {
              // Normalize registration data for RegistrationCard
              const normalizedReg = {
                ...reg,
                sinh_vien: reg.sinh_vien || reg.SinhVien || {},
                hoat_dong: reg.hoat_dong || reg.HoatDong || {}
              };
              
              return (
                <AdminRegistrationCard
                  key={reg.id}
                  registration={normalizedReg}
                  isSelected={selectedIds.includes(reg.id)}
                  isPending={reg.trang_thai_dk === 'cho_duyet'}
                  onToggleSelect={handleToggleSelect}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={(activityId) => setActivityDetailId(activityId)}
                  displayViewMode={displayViewMode}
                  statusColors={STATUS_COLORS}
                  statusLabels={STATUS_LABELS}
                  formatDate={formatRegistrationDate}
                  processing={processing}
                  roleLabel={roleLabel}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'pending' && <Clock className="h-12 w-12 text-amber-600" />}
                {activeTab === 'approved' && <CheckCircle className="h-12 w-12 text-emerald-600" />}
                {activeTab === 'rejected' && <XCircle className="h-12 w-12 text-rose-600" />}
                {activeTab === 'participated' && <Trophy className="h-12 w-12 text-blue-600" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'Không tìm thấy đăng ký' : 
                  activeTab === 'pending' ? 'Không có đăng ký chờ duyệt' : 
                  activeTab === 'approved' ? 'Không có đăng ký đã duyệt' : 
                  activeTab === 'rejected' ? 'Không có đăng ký bị từ chối' : 
                  activeTab === 'participated' ? 'Không có đăng ký hoàn thành' : 
                  'Chưa có đăng ký nào'}
              </h3>
              <p className="text-gray-600 text-lg">
                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 
                  activeTab === 'pending' ? 'Tất cả đăng ký đã được xử lý' : 
                  activeTab === 'approved' ? 'Chưa có đăng ký nào được phê duyệt' : 
                  activeTab === 'rejected' ? 'Chưa có đăng ký nào bị từ chối' : 
                  activeTab === 'participated' ? 'Chưa có đăng ký nào hoàn thành' : 
                  'Chưa có sinh viên nào đăng ký hoạt động'}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 mt-6">
            <Pagination 
              pagination={{ 
                page: pagination.page, 
                limit: pagination.limit, 
                total: pagination.total 
              }} 
              onPageChange={handlePageChange} 
              onLimitChange={(newLimit) => { 
                handleLimitChange(newLimit); 
              }} 
              itemLabel="đăng ký" 
              showLimitSelector={true} 
            />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* ACTIVITY DETAIL MODAL */}
      {/* ============================================ */}
      <ActivityDetailModal 
        activityId={activityDetailId} 
        isOpen={!!activityDetailId} 
        onClose={() => setActivityDetailId(null)} 
      />
    </div>
  );
}
