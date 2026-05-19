import React from 'react';
import { Award, AlertCircle, Loader2, Clock, CheckCircle, Trophy, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../qr-attendance/ui/components/ActivityQRModal';
import { StudentPageHero } from '../../../shared/components/student';
import useMyActivities from '../model/hooks/useMyActivities';
import MyActivitiesToolbar from './components/Activities/MyActivitiesToolbar';
import MyActivitiesFiltersPanel from './components/Activities/MyActivitiesFiltersPanel';
import MyActivitiesResults from './components/Activities/MyActivitiesResults';
import AppLoadingScreen from '../../../shared/components/common/AppLoadingScreen';

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

      {loading && <AppLoadingScreen />}

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
