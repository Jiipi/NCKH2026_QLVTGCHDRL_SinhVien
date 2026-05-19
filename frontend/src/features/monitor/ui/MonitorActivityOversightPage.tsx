import React from 'react';
import { Plus, Search, Filter, SlidersHorizontal, Grid3X3, List, Calendar, Clock, Award, Activity as ActivityIcon, CheckCircle, XCircle, UserPlus, X, Sparkles } from 'lucide-react';
import ActivityQRModal from '../../qr-attendance/ui/components/ActivityQRModal';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import Pagination from '../../../shared/components/common/Pagination';
import ActivityCard from './components/Activities/ActivityCard';
import ActivityEditModal from './components/Activities/ActivityEditModal';
import { useMonitorActivityOversight } from '../model/hooks/useMonitorActivityOversight';
import ActivitySortBar from '../../activities/ui/shared/ActivitySortBar';
import MonitorBulkFaceAttendanceModal from './components/FaceAttendance/MonitorBulkFaceAttendanceModal';
import { StudentPageHero } from '../../../shared/components/student';
import AppLoadingScreen from '../../../shared/components/common/AppLoadingScreen';

const statusConfig = {
  co_san: { label: 'Có sẵn', icon: UserPlus, tone: 'teal', countKey: 'availableCount' },
  cho_duyet: { label: 'Chờ duyệt', icon: Clock, tone: 'amber', countKey: 'cho_duyet' },
  da_duyet: { label: 'Đã duyệt', icon: CheckCircle, tone: 'emerald', countKey: 'da_duyet' },
  ket_thuc: { label: 'Kết thúc', icon: Award, tone: 'indigo', countKey: 'ket_thuc' },
  tu_choi: { label: 'Bị từ chối', icon: XCircle, tone: 'rose', countKey: 'tu_choi' }
} as const;

const toneClasses = {
  teal: {
    icon: 'bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300',
    active: 'border-teal-200/80 bg-teal-50/80 text-teal-800 shadow-teal-100/70 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-200'
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300',
    active: 'border-amber-200/80 bg-amber-50/80 text-amber-800 shadow-amber-100/70 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200'
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300',
    active: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-800 shadow-emerald-100/70 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200'
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300',
    active: 'border-indigo-200/80 bg-indigo-50/80 text-indigo-800 shadow-indigo-100/70 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200'
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300',
    active: 'border-rose-200/80 bg-rose-50/80 text-rose-800 shadow-rose-100/70 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200'
  }
};

function LoadingSkeleton() {
  return <AppLoadingScreen />;
}

export default function MonitorActivityOversightPage() {
  const [showFaceAttendanceModal, setShowFaceAttendanceModal] = React.useState(false);

  const {
    activityTypes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedActivity,
    setSelectedActivity,
    showQRModal,
    setShowQRModal,
    showDetailModal,
    setShowDetailModal,
    showEditModal,
    editMode,
    setEditMode,
    displayViewMode,
    setDisplayViewMode,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    pagination,
    setPagination,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    statusLabels,
    statusColors,
    getActiveFilterCount,
    clearAllFilters,
    getDisplayStatus,
    formatDate,
    filteredActivities,
    paginatedActivities,
    approvedCount,
    availableCount,
    pendingCount,
    endedCount,
    totalActivitiesCount,
    tabCounts,
    handleCreateActivity,
    handleEditActivity,
    handleSaveActivity,
    handleDeleteActivity,
    handleRegister,
    handleViewDetails,
    handleShowQR,
    handleCloseEditModal,
    sortBy,
    setSortBy
  } = useMonitorActivityOversight();

  if (loading) return <LoadingSkeleton />;

  const selectedStatus = statusConfig[statusFilter as keyof typeof statusConfig] || statusConfig.cho_duyet;
  const selectedLabel = selectedStatus.label;
  const hasActiveFilters = Boolean(searchTerm || getActiveFilterCount() > 0);

  const getStatusCount = (key: keyof typeof statusConfig) => {
    if (key === 'co_san') return availableCount;
    return tabCounts[key as keyof typeof tabCounts] || 0;
  };

  const handleShowFaceAttendance = (activity) => {
    setSelectedActivity(activity);
    setShowFaceAttendanceModal(true);
  };

  const handleCloseFaceAttendance = () => {
    setShowFaceAttendanceModal(false);
    setSelectedActivity(null);
  };

  return (
    <div className="space-y-6">
      <StudentPageHero
        eyebrow="Không gian lớp trưởng"
        title="Quản lý hoạt động lớp"
        description="Theo dõi đề xuất, đăng ký và trạng thái hoạt động theo học kỳ với giao diện quản trị gọn, rõ và dễ thao tác."
        heroIcon={ActivityIcon}
        metrics={[
          { icon: ActivityIcon, label: 'Tổng hoạt động', value: totalActivitiesCount, tone: 'text-indigo-600 dark:text-indigo-300' },
          { icon: Clock, label: 'Chờ duyệt', value: pendingCount, tone: 'text-amber-600 dark:text-amber-300' },
          { icon: CheckCircle, label: 'Đã duyệt', value: approvedCount, tone: 'text-emerald-600 dark:text-emerald-300' },
          { icon: Award, label: 'Kết thúc', value: endedCount, tone: 'text-teal-600 dark:text-teal-300' },
        ]}
        actions={(
          <>
            <span className="rounded-2xl border border-white/60 bg-white/45 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {semesterOptions.find(option => option.value === semester)?.label || 'Học kỳ hiện tại'}
            </span>
            <span className={`rounded-2xl border px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-xl ${isWritable ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300' : 'border-slate-200/70 bg-slate-50/80 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'}`}>
              {isWritable ? 'Có quyền tạo/sửa' : 'Chỉ xem học kỳ'}
            </span>
            <button
              onClick={handleCreateActivity}
              disabled={!isWritable}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950' : 'cursor-not-allowed border border-white/60 bg-white/40 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-600'}`}
            >
              <Plus className="h-4 w-4" />
              Tạo hoạt động
            </button>
          </>
        )}
      />

      <section className="rounded-[2rem] border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-12 pr-4 text-sm font-bold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white/75 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none"
              placeholder="Tìm kiếm hoạt động theo tên hoặc mô tả..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="border-none bg-transparent text-sm font-bold text-slate-800 focus:outline-none focus:ring-0 dark:text-white"
              >
                {semesterOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Lọc nâng cao
              {getActiveFilterCount() > 0 && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{getActiveFilterCount()}</span>}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ActivitySortBar sortBy={sortBy} onSortChange={(v) => setSortBy(v as typeof sortBy)} />
          <div className="flex flex-wrap items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-2.5 text-sm font-bold text-rose-600 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
              >
                <X className="h-4 w-4" />
                Xóa lọc
              </button>
            )}
            <div className="flex items-center gap-1 rounded-2xl border border-white/70 bg-white/45 p-1 shadow-inner shadow-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <button
                onClick={() => setDisplayViewMode('grid')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all ${displayViewMode === 'grid' ? 'border border-white/80 bg-white/85 text-indigo-600 shadow-sm dark:border-white/10 dark:bg-white/15 dark:text-indigo-200' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Lưới</span>
              </button>
              <button
                onClick={() => setDisplayViewMode('list')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all ${displayViewMode === 'list' ? 'border border-white/80 bg-white/85 text-indigo-600 shadow-sm dark:border-white/10 dark:bg-white/15 dark:text-indigo-200' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-5 rounded-[1.5rem] border border-white/60 bg-white/45 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">
                <Filter className="h-4 w-4 text-indigo-500" />
                Bộ lọc nâng cao
              </h3>
              <button onClick={() => setShowFilters(false)} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-600 dark:hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Loại hoạt động</span>
                <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-bold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none">
                  <option value="">Tất cả loại</option>
                  {Array.isArray(activityTypes) && activityTypes.map(type => {
                    const typeName = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || '');
                    const typeValue = typeof type === 'string' ? type : (type?.id?.toString() || type?.name || type?.ten_loai_hd || '');
                    const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                    return <option key={typeKey} value={typeValue}>{typeName}</option>;
                  })}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Từ ngày</span>
                <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-bold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Đến ngày</span>
                <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} className="w-full rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-bold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none" />
              </label>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">Trạng thái</h3>
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{filteredActivities.length} hoạt động</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(key => {
            const config = statusConfig[key];
            const Icon = config.icon;
            const active = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex min-w-fit items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black shadow-sm transition-all duration-200 ${active ? toneClasses[config.tone].active : 'border-white/60 bg-white/45 text-slate-500 hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
              >
                <Icon className="h-4 w-4" />
                {config.label}
                <span className="rounded-full bg-white/65 px-2 py-0.5 text-xs dark:bg-white/10">{getStatusCount(key)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 text-sm font-bold text-rose-700 shadow-sm backdrop-blur-xl dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Kết quả</p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">{selectedLabel}</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Hiển thị {paginatedActivities.length} / {filteredActivities.length} hoạt động
          </p>
        </div>

        {filteredActivities.length > 0 ? (
          <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-3'}>
            {paginatedActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                displayViewMode={displayViewMode}
                statusFilter={statusFilter}
                statusLabels={statusLabels}
                statusColors={statusColors}
                isWritable={isWritable}
                formatDate={formatDate}
                getDisplayStatus={getDisplayStatus}
                onViewDetails={handleViewDetails}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
                onShowQR={handleShowQR}
                onRegister={handleRegister}
                onShowFaceAttendance={handleShowFaceAttendance}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/70 bg-white/60 p-12 text-center shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 sm:p-16">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
              <Calendar className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
              {hasActiveFilters ? 'Không tìm thấy hoạt động' : 'Chưa có hoạt động nào'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
              {hasActiveFilters ? 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.' : 'Bắt đầu bằng cách tạo hoạt động đầu tiên cho lớp của bạn.'}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={handleCreateActivity}
                disabled={!isWritable}
                className={`mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all ${isWritable ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950' : 'cursor-not-allowed border border-white/60 bg-white/40 text-slate-400 dark:border-white/10 dark:bg-white/5'}`}
              >
                <Plus className="h-4 w-4" />
                Tạo hoạt động đầu tiên
              </button>
            )}
          </div>
        )}
      </section>

      {filteredActivities.length > 0 && (
        <div className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
            itemLabel="hoạt động"
            showLimitSelector={true}
          />
        </div>
      )}

      <ActivityEditModal
        isOpen={showEditModal}
        activity={selectedActivity}
        editMode={editMode}
        onClose={handleCloseEditModal}
        onEdit={() => setEditMode(true)}
        onSave={handleSaveActivity}
        onActivityChange={setSelectedActivity}
      />

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

      <MonitorBulkFaceAttendanceModal
        isOpen={showFaceAttendanceModal}
        activity={selectedActivity}
        onClose={handleCloseFaceAttendance}
        onCompleted={() => setPagination(prev => ({ ...prev }))}
      />
    </div>
  );
}
