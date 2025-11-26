import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import SemesterClosureBanner from '../../../shared/components/semester/SemesterClosureBanner';
import useAdminActivitiesList from '../model/useAdminActivitiesList';
import AdminActivitiesHero from './components/ActivitiesList/AdminActivitiesHero';
import AdminActivitiesToolbar from './components/ActivitiesList/AdminActivitiesToolbar';
import AdminActivitiesFiltersPanel from './components/ActivitiesList/AdminActivitiesFiltersPanel';
import AdminActivitiesLoading from './components/ActivitiesList/AdminActivitiesLoading';
import AdminActivitiesError from './components/ActivitiesList/AdminActivitiesError';
import AdminActivitiesEmpty from './components/ActivitiesList/AdminActivitiesEmpty';
import AdminActivitiesResults from './components/ActivitiesList/AdminActivitiesResults';

export default function AdminActivitiesPage() {
  const navigate = useNavigate();

  const {
    query,
    setQuery,
    filters,
    activityTypes,
    classes,
    loading,
    error,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    pagination,
    semester,
    setSemester,
    semesterOptions,
    selectedActivityId,
    isModalOpen,
    scopeTab,
    setScopeTab,
    selectedClass,
    setSelectedClass,
    filteredItems,
    allItems, // Tất cả hoạt động (để tính stats chính xác)
    isTransitioning,
    activitiesGridRef,
    onSearch,
    onFilterChange,
    getActiveFilterCount,
    clearAllFilters,
    handleApprove,
    handleReject,
    handleDelete,
    handleViewDetail,
    handleCloseModal,
    handlePageChange,
    handleLimitChange,
    reload,
    ACTIVITY_STATUS_OPTIONS,
    SCOPE_OPTIONS,
    sortBy,
    setSortBy,
    isWritable
  } = useAdminActivitiesList();

  const activeFilterCount = getActiveFilterCount();

  // Calculate stats từ TẤT CẢ hoạt động (không chỉ trang hiện tại)
  const stats = useMemo(() => {
    const pending = allItems.filter(a => a.trang_thai === 'cho_duyet').length;
    const approved = allItems.filter(a => a.trang_thai === 'da_duyet').length;
    const rejected = allItems.filter(a => a.trang_thai === 'tu_choi').length;
    return {
      total: allItems.length,
      pending,
      approved,
      rejected
    };
  }, [allItems]);

  const handleSemesterChange = (value) => {
    setSemester(value);
  };

  const handleCreateActivity = () => {
    navigate('/admin/activities/create');
  };

  const handleEditActivity = (activity) => {
    navigate(`/admin/activities/${activity.id}/edit`);
  };

  const handleResetFilters = () => {
    clearAllFilters();
    reload();
  };

  const shouldShowLoading = loading && allItems.length === 0;
  const shouldShowError = !loading && error;
  const shouldShowEmpty = !loading && !error && allItems.length === 0;
  const shouldShowResults = !loading && !error && allItems.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <SemesterClosureBanner />

        <AdminActivitiesHero
          totalActivities={stats.total}
          pendingCount={stats.pending}
          approvedCount={stats.approved}
          rejectedCount={stats.rejected}
        />

        <AdminActivitiesToolbar
          query={query}
          onQueryChange={setQuery}
          onSearch={onSearch}
          semester={semester}
          semesterOptions={semesterOptions}
          onSemesterChange={handleSemesterChange}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          onClearFilters={clearAllFilters}
          activeFilterCount={activeFilterCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          scopeTab={scopeTab}
          onScopeTabChange={setScopeTab}
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          onCreateActivity={handleCreateActivity}
          scopeOptions={SCOPE_OPTIONS}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isWritable={isWritable}
        />

        <AdminActivitiesFiltersPanel
          visible={showFilters}
          filters={filters}
          activityTypes={activityTypes}
          statusOptions={ACTIVITY_STATUS_OPTIONS}
          onFilterChange={onFilterChange}
          onClearAll={clearAllFilters}
          activeFilterCount={activeFilterCount}
        />

        {shouldShowLoading && <AdminActivitiesLoading />}
        
        {shouldShowError && (
          <AdminActivitiesError message={error} onRetry={reload} />
        )}
        
        {shouldShowEmpty && (
          <AdminActivitiesEmpty scopeTab={scopeTab} onResetFilters={handleResetFilters} />
        )}
        
        {shouldShowResults && (
          <AdminActivitiesResults
            filteredItems={filteredItems}
            viewMode={viewMode}
            activitiesGridRef={activitiesGridRef}
            isTransitioning={isTransitioning}
            onViewDetail={handleViewDetail}
            onEdit={handleEditActivity}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            scopeTab={scopeTab}
            isWritable={isWritable}
          />
        )}

        <ActivityDetailModal
          activityId={selectedActivityId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
