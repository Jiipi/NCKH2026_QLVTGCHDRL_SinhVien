import React from 'react';
import { Award, AlertCircle, Loader2, Clock, CheckCircle, Trophy, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../qr-attendance/ui/components/ActivityQRModal';
import useMyActivities from '../model/hooks/useMyActivities';
import MyActivitiesToolbar from './components/Activities/MyActivitiesToolbar';
import MyActivitiesFiltersPanel from './components/Activities/MyActivitiesFiltersPanel';
import MyActivitiesResults from './components/Activities/MyActivitiesResults';

function StudentPageHero({ eyebrow, title, description, chips }: {
  eyebrow: string;
  title: string;
  description: string;
  chips: Array<{ icon: React.ElementType; label: string }>;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.14),transparent_28%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/45 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Icon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MyActivitiesPage() {
  const {
    tab,
    setTab,
    data,
    loading,
    error,
    selectedActivityId,
    isModalOpen,
    qrModalOpen,
    qrActivityId,
    qrActivityName,
    query,
    setQuery,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    activityTypes,
    pagination,
    setPagination,
    isWritable,
    canShowQR,
    currentItems,
    paginatedItems,
    totalActivities,
    cancelRegistration,
    handleViewDetail,
    handleCloseModal,
    handleShowQR,
    handleCloseQRModal,
    getActiveFilterCount,
    clearAllFilters,
    handlePageChange,
    sortBy,
    setSortBy
  } = useMyActivities();

  const activeFilterCount = getActiveFilterCount();
  const filteredTotal = Array.isArray(data[tab]) ? data[tab].length : 0;

  const tabsConfig = [
    { key: 'pending', title: 'Chờ duyệt', icon: Clock, count: data.pending.length, gradient: 'from-amber-500 to-orange-600' },
    { key: 'approved', title: 'Đã duyệt', icon: CheckCircle, count: data.approved.length, gradient: 'from-emerald-500 to-green-600' },
    { key: 'joined', title: 'Đã tham gia', icon: Trophy, count: data.joined.length, gradient: 'from-blue-500 to-indigo-600' },
    { key: 'rejected', title: 'Bị từ chối', icon: XCircle, count: data.rejected.length, gradient: 'from-rose-500 to-red-600' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  return (
    <div className="flex flex-col flex-1 space-y-4" data-ref="student-my-activities-refactored">
      <StudentPageHero
        eyebrow="Không gian sinh viên"
        title="Hoạt động của tôi"
        description="Theo dõi các hoạt động đã đăng ký, trạng thái phê duyệt và mã QR điểm danh của bạn."
        chips={[
          { icon: Clock, label: `${data.pending.length} chờ duyệt` },
          { icon: CheckCircle, label: `${data.approved.length} đã duyệt` },
          { icon: Trophy, label: `${totalActivities} tổng hoạt động` }
        ]}
      />

      <MyActivitiesToolbar
        query={query}
        onSearch={setQuery}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearAllFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        tabs={tabsConfig}
        activeTab={tab}
        onTabChange={setTab}
      />

      <MyActivitiesFiltersPanel
        visible={showFilters}
        filters={filters}
        activityTypes={activityTypes}
        onFilterChange={handleFilterChange}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
          </motion.div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-semibold text-rose-800 dark:text-rose-300">Đã xảy ra lỗi</p>
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && currentItems.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="inline-block p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
            <Award className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Chưa có hoạt động nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bạn chưa có hoạt động nào trong danh mục này</p>
        </div>
      )}

      {!loading && !error && currentItems.length > 0 && (
        <MyActivitiesResults
          viewMode={viewMode}
          paginatedItems={paginatedItems}
          currentItemsCount={currentItems.length}
          filteredTotal={filteredTotal}
          query={query}
          activeFilterCount={activeFilterCount}
          status={tab}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onViewDetail={handleViewDetail}
          onShowQr={handleShowQR}
          onCancel={cancelRegistration}
          canShowQr={canShowQR}
          isWritable={isWritable}
        />
      )}

      <ActivityDetailModal activityId={selectedActivityId} isOpen={isModalOpen} onClose={handleCloseModal} />
      <ActivityQRModal activityId={qrActivityId} activityName={qrActivityName} isOpen={qrModalOpen} onClose={handleCloseQRModal} />
    </div>
  );
}
