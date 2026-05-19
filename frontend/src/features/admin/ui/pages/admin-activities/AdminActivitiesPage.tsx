import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ActivityDetailModal from '../../../../../entities/activity/ui/ActivityDetailModal';
import SemesterClosureBanner from '../../../../../shared/components/semester/SemesterClosureBanner';
import { useAdminActivitiesList } from '../../../model';
import { Activity } from '../../../types';
import AdminActivitiesHero from '../../shared/ActivitiesList/AdminActivitiesHero';
import AdminActivitiesToolbar from '../../shared/ActivitiesList/AdminActivitiesToolbar';
import AdminActivitiesFiltersPanel from '../../shared/ActivitiesList/AdminActivitiesFiltersPanel';
import AdminActivitiesLoading from '../../shared/ActivitiesList/AdminActivitiesLoading';
import AdminActivitiesError from '../../shared/ActivitiesList/AdminActivitiesError';
import AdminActivitiesEmpty from '../../shared/ActivitiesList/AdminActivitiesEmpty';
import AdminActivitiesResults from '../../shared/ActivitiesList/AdminActivitiesResults';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const AdminActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const statusParam = new URLSearchParams(location.search).get('status') || '';
  const isApprovalMode = statusParam === 'cho_duyet';

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
    allItems,
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
  const stats: Stats = useMemo(() => {
    const pending = (allItems as Activity[]).filter((a) => a.trang_thai === 'cho_duyet').length;
    const approved = (allItems as Activity[]).filter((a) => a.trang_thai === 'da_duyet').length;
    const rejected = (allItems as Activity[]).filter((a) => a.trang_thai === 'tu_choi').length;
    return {
      total: allItems.length,
      pending,
      approved,
      rejected
    };
  }, [allItems]);

  const handleSemesterChange = (value: string): void => {
    setSemester(value);
  };

  const handleCreateActivity = (): void => {
    navigate('/admin/activities/create');
  };

  const handleEditActivity = (activity: Activity): void => {
    navigate(`/admin/activities/${activity.id}/edit`);
  };

  const handleResetFilters = (): void => {
    clearAllFilters();
    reload();
  };

  const shouldShowLoading = loading && allItems.length === 0;
  const shouldShowError = !loading && error;
  const shouldShowEmpty = !loading && !error && allItems.length === 0;
  const shouldShowResults = !loading && !error && allItems.length > 0;

  return (
    <div className="space-y-6">
      <SemesterClosureBanner />

        <AdminActivitiesHero
          totalActivities={stats.total}
          pendingCount={stats.pending}
          approvedCount={stats.approved}
          rejectedCount={stats.rejected}
          approvalMode={isApprovalMode}
        />

        <AdminActivitiesToolbar
          query={query}
          onQueryChange={setQuery}
          onSearch={onSearch}
          semester={semester}
          semesterOptions={semesterOptions}
          onSemesterChange={handleSemesterChange}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev: boolean) => !prev)}
          onClearFilters={clearAllFilters}
          activeFilterCount={activeFilterCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          scopeTab={scopeTab}
          onScopeTabChange={(value: string) => setScopeTab(value as 'all' | 'class')}
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
  );
};

export default AdminActivitiesPage;
