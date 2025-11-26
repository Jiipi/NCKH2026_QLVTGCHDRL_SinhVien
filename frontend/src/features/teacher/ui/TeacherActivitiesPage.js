import React from 'react';
import { 
  Activity, Search, Calendar, MapPin, Users, Award, 
  CheckCircle, XCircle, Filter, List, Tag, Grid3X3, 
  Clock, Sparkles, SlidersHorizontal, RefreshCw, X
} from 'lucide-react';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityTypesManagementPage from '../../activity-types/ui/ActivityTypesManagementPage';
import useTeacherActivitiesPage from '../model/hooks/useTeacherActivitiesPage';
import { getBestActivityImage } from '../../../shared/lib/activityImages';
import TeacherActivitiesHeroInline from './components/activities-management/TeacherActivitiesHeroInline';
import TeacherActivityCardInline from './components/activities-management/TeacherActivityCardInline';
import ActivityDetailModalInline from './components/activities-management/ActivityDetailModalInline';
import Pagination from '../../../shared/components/common/Pagination';

export default function TeacherActivitiesPage() {
  const { showSuccess, showError } = useNotification();

  const {
    activities,
    filteredActivities,
    allActivities,
    loading,
    error,
    semester,
    semesterOptions,
    isWritable,
    activityTypes,
    selectedActivity,
    showDetailModal,
    activeTab,
    viewMode,
    searchTerm,
    statusFilter,
    statusViewMode,
    sortBy,
    showFilters,
    filters,
    page,
    limit,
    effectiveTotal,
    heroStats,
    setActiveTab,
    setViewMode,
    setSearchTerm,
    setStatusFilter,
    setStatusViewMode,
    setSortBy,
    setShowFilters,
    setFilters,
    setPage,
    setLimit,
    setSemester,
    setSelectedActivity,
    setShowDetailModal,
    fetchActivityDetails,
    handleApprove,
    handleReject,
    getActiveFilterCount,
    clearAllFilters,
    getTypeColor,
    STATUS_LABELS,
    STATUS_COLORS
  } = useTeacherActivitiesPage();

  const paginationState = {
    page,
    limit,
    total: effectiveTotal
  };
  const startItem = effectiveTotal ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, effectiveTotal);

  const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.cho_duyet;
  const getStatusLabel = (status) => STATUS_LABELS[status] || 'Chưa xác định';

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
      <TeacherActivitiesHeroInline
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={heroStats}
        activityTypesCount={activityTypes.length}
      />

      {/* Content based on active tab */}
      {activeTab === 'types' ? (
          <ActivityTypesManagementPage showHeader={false} />
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
                    {!statusFilter && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{filteredActivities.length}</span>}
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
                    <option value="">Tất cả ({filteredActivities.length})</option>
                    <option value="cho_duyet">Chờ duyệt ({allActivities.filter(a => a.trang_thai === 'cho_duyet').length})</option>
                    <option value="da_duyet">Đã duyệt ({allActivities.filter(a => a.trang_thai === 'da_duyet').length})</option>
                    <option value="ket_thuc">Kết thúc ({allActivities.filter(a => a.trang_thai === 'ket_thuc').length})</option>
                    <option value="tu_choi">Từ chối ({allActivities.filter(a => a.trang_thai === 'tu_choi').length})</option>
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
                    <span className={`text-xs font-bold ${!statusFilter ? 'text-purple-600' : 'text-gray-600'}`}>{filteredActivities.length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('cho_duyet')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'cho_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Chờ duyệt"
                  >
                    <Clock className={`h-5 w-5 ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'cho_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>{allActivities.filter(a => a.trang_thai === 'cho_duyet').length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('da_duyet')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'da_duyet' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Đã duyệt"
                  >
                    <CheckCircle className={`h-5 w-5 ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'da_duyet' ? 'text-purple-600' : 'text-gray-600'}`}>{allActivities.filter(a => a.trang_thai === 'da_duyet').length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('ket_thuc')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'ket_thuc' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Kết thúc"
                  >
                    <CheckCircle className={`h-5 w-5 ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'ket_thuc' ? 'text-purple-600' : 'text-gray-600'}`}>{allActivities.filter(a => a.trang_thai === 'ket_thuc').length}</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('tu_choi')}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      statusFilter === 'tu_choi' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                    }`}
                    title="Từ chối"
                  >
                    <XCircle className={`h-5 w-5 ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${statusFilter === 'tu_choi' ? 'text-purple-600' : 'text-gray-600'}`}>{allActivities.filter(a => a.trang_thai === 'tu_choi').length}</span>
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
                  {activities.map((activity) => (
                    <TeacherActivityCardInline
                  key={activity.id}
                  activity={activity}
                      viewMode="grid"
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getTypeColor={getTypeColor}
                  isWritable={isWritable}
                  onApprove={handleApprove}
                  onReject={handleReject}
                      onViewDetail={fetchActivityDetails}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
                  {activities.map((activity) => (
                    <TeacherActivityCardInline
                  key={activity.id}
                  activity={activity}
                      viewMode="list"
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getTypeColor={getTypeColor}
                  isWritable={isWritable}
                  onApprove={handleApprove}
                  onReject={handleReject}
                      onViewDetail={fetchActivityDetails}
                />
              ))}
            </div>
          )}
            </div>
          </div>

          {effectiveTotal > limit && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mt-4">
              <div className="text-sm text-gray-600 mb-3">
                Đang hiển thị {startItem}-{endItem} / {effectiveTotal} hoạt động
              </div>
              <Pagination
                pagination={paginationState}
                onPageChange={setPage}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit);
                  setPage(1);
                }}
                itemLabel="hoạt động"
                showLimitSelector
              />
            </div>
          )}

          {/* Detail Modal */}
          <ActivityDetailModalInline
            activity={selectedActivity}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedActivity(null);
            }}
            getStatusLabel={getStatusLabel}
          />
        </>
      )}
    </div>
  );
}
