import React, { useMemo } from 'react';
import {
  Clock, Calendar, Filter, Search, RefreshCw, SlidersHorizontal, Grid3X3, List,
  CheckCircle, XCircle, Sparkles, Trophy
} from 'lucide-react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../qr-attendance/ui/components/ActivityQRModal';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import Pagination from '../../../shared/components/common/Pagination';
import useMyActivities from '../../student/model/hooks/useMyActivities';
import ActivitySortBar from '../../activities/ui/shared/ActivitySortBar';
import MyActivitiesHeader from './components/Activities/MyActivitiesHeader';
import MyActivityCard from './components/Activities/MyActivityCard';

export default function MonitorMyActivitiesPage() {
  const {
    tab,
    setTab,
    selectedActivityId,
    isModalOpen,
    qrModalOpen,
    qrActivityId,
    qrActivityName,
    query,
    setQuery,
    viewMode: displayViewMode,
    setViewMode: setDisplayViewMode,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    statusViewMode,
    setStatusViewMode,
    pagination,
    setPagination,
    data,
    loading,
    error,
    activityTypes,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    getActiveFilterCount,
    clearAllFilters,
    cancelRegistration,
    handleViewDetail,
    handleCloseModal,
    handleShowQR,
    handleCloseQRModal,
    sortBy,
    setSortBy,
    currentItems,
    paginatedItems
  } = useMyActivities();

  // Map tab names to viewMode
  const viewModeMap = {
    'pending': 'cho_duyet',
    'approved': 'da_duyet',
    'joined': 'da_tham_gia',
    'rejected': 'tu_choi'
  };

  const currentViewMode = viewModeMap[tab] || 'cho_duyet';

  // Get all registrations for counting
  const myRegistrations = useMemo(() => {
    const allRegistrations = [...data.pending, ...data.approved, ...data.joined, ...data.rejected];
    return allRegistrations;
  }, [data]);

  // Calculate total points
  const totalPoints = useMemo(() => {
    return myRegistrations
      .filter(reg => reg.trang_thai_dk === 'da_tham_gia')
      .reduce((sum, reg) => sum + (parseFloat(reg.hoat_dong?.diem_rl) || 0), 0);
  }, [myRegistrations]);

  // Handle cancel with activity name
  const handleCancel = async (hdId, activityName) => {
    await cancelRegistration(hdId, activityName);
  };

  // Sử dụng currentItems từ hook (đã được filter + sort)
  // Không cần getFilteredRegistrations() nữa vì hook đã xử lý

  function parseDateSafe(dateStr) { if (!dateStr) return null; try { return new Date(dateStr); } catch { return null; } }
  function formatDate(dateStr) { const date = parseDateSafe(dateStr); return date ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'; }
  function getStatusBadge(status) {
    const badges = {
      'cho_duyet': { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'da_duyet': { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200' },
      'tu_choi': { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200' },
      'da_tham_gia': { label: 'Đã tham gia', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    };
    const badge = badges[status] || badges['cho_duyet'];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {status === 'da_duyet' && <CheckCircle className="h-3 w-3" />}
        {status === 'tu_choi' && <XCircle className="h-3 w-3" />}
        {status === 'da_tham_gia' && <Trophy className="h-3 w-3" />}
        {badge.label}
      </span>
    );
  }

  const totalActivities = myRegistrations.length;
  // Sử dụng currentItems từ hook thay vì getFilteredRegistrations()
  const filteredRegs = currentItems;

  return (
    <div className="space-y-6">
      <MyActivitiesHeader
        totalActivities={totalActivities}
        myRegistrations={myRegistrations}
        totalPoints={totalPoints}
      />

      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300" placeholder="Tìm kiếm hoạt động..." />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Học kỳ:</span>
                <SemesterFilter value={semester} onChange={setSemester} label="" />
              </div>
              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
                {getActiveFilterCount() > 0 && (<span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full min-w-[20px] text-center">{getActiveFilterCount()}</span>)}
                <span className={`text-xs transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {getActiveFilterCount() > 0 && (
                <button onClick={clearAllFilters} className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium border-2 border-red-200 hover:border-red-300" title="Xóa tất cả bộ lọc">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm">Xóa lọc</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 justify-end w-full lg:w-auto">
              <ActivitySortBar sortBy={sortBy} onSortChange={setSortBy} />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                  <button onClick={() => setDisplayViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${displayViewMode === 'grid' ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`} title="Hiển thị dạng lưới">
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Lưới</span>
                  </button>
                  <button onClick={() => setDisplayViewMode('list')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${displayViewMode === 'list' ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`} title="Hiển thị dạng danh sách">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Danh sách</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Bộ lọc nâng cao
                </h3>
                {getActiveFilterCount() > 0 && (<span className="text-sm text-gray-600">✓ Đang áp dụng <strong>{getActiveFilterCount()}</strong> bộ lọc</span>)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loại hoạt động</label>
                  <select value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all">
                    <option value="">Tất cả loại</option>
                    {(Array.isArray(activityTypes) ? activityTypes : []).map(type => {
                      const typeName = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || '');
                      const typeValue = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || type?.id || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (<option key={typeKey} value={typeValue}>{typeName}</option>);
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Từ ngày</label>
                  <input type="date" value={filters.from} onChange={e => setFilters(prev => ({ ...prev, from: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đến ngày</label>
                  <input type="date" value={filters.to} onChange={e => setFilters(prev => ({ ...prev, to: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm RL tối thiểu</label>
                  <input type="number" step="0.5" min="0" value={filters.minPoints} onChange={e => setFilters(prev => ({ ...prev, minPoints: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm RL tối đa</label>
                  <input type="number" step="0.5" min="0" value={filters.maxPoints} onChange={e => setFilters(prev => ({ ...prev, maxPoints: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" placeholder="Không giới hạn" />
                </div>
              </div>
              {getActiveFilterCount() > 0 && (
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
                  <button onClick={clearAllFilters} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200">
                    <RefreshCw className="h-4 w-4" />
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')} className="p-1 text-gray-400 hover:text-purple-600 transition-colors" title="Chuyển chế độ hiển thị">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab('pending')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${tab === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Clock className="h-4 w-4" />
                Chờ duyệt
                {myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}</span>)}
              </button>
              <button onClick={() => setTab('approved')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${tab === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <CheckCircle className="h-4 w-4" />
                Đã duyệt
                {myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length}</span>)}
              </button>
              <button onClick={() => setTab('joined')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${tab === 'joined' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Trophy className="h-4 w-4" />
                Đã tham gia
                {myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length}</span>)}
              </button>
              <button onClick={() => setTab('rejected')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${tab === 'rejected' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <XCircle className="h-4 w-4" />
                Bị từ chối
                {myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length}</span>)}
              </button>
            </div>
          )}
          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select value={tab} onChange={e => setTab(e.target.value)} className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm">
                <option value="pending">Chờ duyệt ({myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length})</option>
                <option value="approved">Đã duyệt ({myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length})</option>
                <option value="completed">Đã tham gia ({myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length})</option>
                <option value="rejected">Bị từ chối ({myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length})</option>
              </select>
              {(() => {
                const configs = {
                  pending: { icon: Clock, gradient: 'from-yellow-500 to-orange-500', count: myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length },
                  approved: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', count: myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length },
                  completed: { icon: Trophy, gradient: 'from-blue-600 to-indigo-600', count: myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length },
                  rejected: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length }
                };
                const currentConfig = configs[tab];
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
          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <button onClick={() => setTab('pending')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${tab === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Chờ duyệt">
                <Clock className={`h-5 w-5 ${tab === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${tab === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}</span>
              </button>
              <button onClick={() => setTab('approved')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${tab === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Đã duyệt">
                <CheckCircle className={`h-5 w-5 ${tab === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${tab === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length}</span>
              </button>
              <button onClick={() => setTab('joined')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${tab === 'joined' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Đã tham gia">
                <Trophy className={`h-5 w-5 ${tab === 'joined' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${tab === 'joined' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length}</span>
              </button>
              <button onClick={() => setTab('rejected')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${tab === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Bị từ chối">
                <XCircle className={`h-5 w-5 ${tab === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${tab === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filteredRegs.map(reg => (
            <MyActivityCard
              key={reg.id}
              registration={reg}
              displayViewMode={displayViewMode}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              handleViewDetail={handleViewDetail}
              handleShowQR={handleShowQR}
              handleCancel={handleCancel}
              isWritable={isWritable}
            />
          ))}
        </div>
      )}

      {filteredRegs.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6">
          <Pagination pagination={pagination} onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))} onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))} itemLabel="hoạt động" showLimitSelector={true} />
        </div>
      )}

      {isModalOpen && (
        <ActivityDetailModal activityId={selectedActivityId} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
      {qrModalOpen && qrActivityId && (
        <ActivityQRModal activityId={qrActivityId} activityName={qrActivityName} isOpen={qrModalOpen} onClose={handleCloseQRModal} />
      )}
    </div>
  );
}
