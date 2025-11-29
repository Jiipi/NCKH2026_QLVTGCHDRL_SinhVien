import React from 'react';
import { Clock, Award, AlertCircle, CheckCircle, Trophy, XCircle } from 'lucide-react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../qr-attendance/ui/components/ActivityQRModal';
import useMyActivities from '../model/hooks/useMyActivities';
import MyActivitiesHero from './components/Activities/MyActivitiesHero';
import MyActivitiesToolbar from './components/Activities/MyActivitiesToolbar';
import MyActivitiesFiltersPanel from './components/Activities/MyActivitiesFiltersPanel';
import MyActivitiesStatusTabs from './components/Activities/MyActivitiesStatusTabs';
import MyActivitiesResults from './components/Activities/MyActivitiesResults';

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
    statusViewMode,
    setStatusViewMode,
    pagination,
    setPagination,
    semester,
    setSemester,
    semesterOptions,
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
  const filteredTotal = Array.isArray(data[tab])
    ? data[tab].filter((item) => item.is_class_activity).length
    : 0;

  const tabsConfig = [
    { key: 'pending', title: 'Chờ duyệt', icon: Clock, count: data.pending.length, gradient: 'from-amber-500 to-orange-600' },
    { key: 'approved', title: 'Đã duyệt', icon: CheckCircle, count: data.approved.length, gradient: 'from-emerald-500 to-green-600' },
    { key: 'joined', title: 'Đã tham gia', icon: Trophy, count: data.joined.length, gradient: 'from-blue-500 to-indigo-600' },
    { key: 'rejected', title: 'Bị từ chối', icon: XCircle, count: data.rejected.length, gradient: 'from-rose-500 to-red-600' }
  ];

  const handleStatusViewModeChange = () => {
    setStatusViewMode((prev) => (prev === 'pills' ? 'dropdown' : prev === 'dropdown' ? 'compact' : 'pills'));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  return (
    <div className="space-y-6" data-ref="student-my-activities-refactored">
      <MyActivitiesHero stats={data} totalActivities={totalActivities} />

      <MyActivitiesToolbar
        query={query}
        onSearch={setQuery}
        semester={semester}
        semesterOptions={semesterOptions || []}
        onSemesterChange={setSemester}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearAllFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <MyActivitiesFiltersPanel
        visible={showFilters}
        filters={filters}
        activityTypes={activityTypes}
        onFilterChange={handleFilterChange}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />

      <MyActivitiesStatusTabs
        tabs={tabsConfig}
        activeTab={tab}
        onTabChange={setTab}
        statusViewMode={statusViewMode}
        onStatusViewModeChange={handleStatusViewModeChange}
        showQrHint={tab === 'approved'}
      />

      {
        loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative inline-block mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-pink-600 absolute inset-0"></div>
              <Clock className="absolute inset-0 m-auto h-6 w-6 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">Đang tải...</p>
          </div>
        )
      }

      {
        error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 rounded-xl p-3">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-red-900 font-semibold">Đã xảy ra lỗi</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )
      }

      {
        !loading && !error && currentItems.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-full mb-6">
              <Award className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có hoạt động nào</h3>
            <p className="text-gray-600 mb-6">Bạn chưa có hoạt động nào trong danh mục này</p>
          </div>
        )
      }

      {
        !loading && !error && currentItems.length > 0 && (
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
        )
      }

      <ActivityDetailModal activityId={selectedActivityId} isOpen={isModalOpen} onClose={handleCloseModal} />
      <ActivityQRModal activityId={qrActivityId} activityName={qrActivityName} isOpen={qrModalOpen} onClose={handleCloseQRModal} />
    </div >
  );
}

