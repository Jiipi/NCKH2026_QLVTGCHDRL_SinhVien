import React from 'react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import SemesterClosureBanner from '../../../shared/components/semester/SemesterClosureBanner';
import useStudentActivitiesList from '../model/hooks/useStudentActivitiesList';
import ActivitiesListHero from './components/ActivitiesList/ActivitiesListHero';
import ActivitiesListToolbar from './components/ActivitiesList/ActivitiesListToolbar';
import ActivitiesListFiltersPanel from './components/ActivitiesList/ActivitiesListFiltersPanel';
import ActivitiesListLoading from './components/ActivitiesList/ActivitiesListLoading';
import ActivitiesListError from './components/ActivitiesList/ActivitiesListError';
import ActivitiesListEmpty from './components/ActivitiesList/ActivitiesListEmpty';
import ActivitiesListResults from './components/ActivitiesList/ActivitiesListResults';

export default function StudentActivitiesListPage() {
  const {
    query,
    setQuery,
    filters,
    setFilters,
    activityTypes,
    loading,
    error,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    pagination,
    setPagination,
    role,
    selectedActivityId,
    isModalOpen,
    scopeTab,
    filteredItems,
    isTransitioning,
    activitiesGridRef,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    onSearch,
    onFilterChange,
    getActiveFilterCount,
    clearAllFilters,
    handleRegister,
    handleViewDetail,
    handleCloseModal,
    handlePageChange,
    reload,
    ACTIVITY_STATUS_OPTIONS,
    sortBy,
    setSortBy
  } = useStudentActivitiesList();

  const activeFilterCount = getActiveFilterCount();

  const handleSemesterChange = (value) => {
    setSemester(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleResetFilters = () => {
    setQuery('');
    setFilters({ type: '', status: '', from: '', to: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
    reload();
  };

  const shouldShowEmpty = !loading && !error && filteredItems.length === 0;
  const shouldShowResults = !loading && !error && filteredItems.length > 0;

  return (
    <div className="space-y-6" data-ref="student-activities-list-refactored">
      <SemesterClosureBanner />

      <ActivitiesListHero totalActivities={pagination.total} />

      <ActivitiesListToolbar
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
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <ActivitiesListFiltersPanel
        visible={showFilters}
        filters={filters}
        activityTypes={activityTypes}
        statusOptions={ACTIVITY_STATUS_OPTIONS}
        onFilterChange={onFilterChange}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />

      {loading && <ActivitiesListLoading />}
      {error && !loading && <ActivitiesListError message={error} />}
      {shouldShowEmpty && (
        <ActivitiesListEmpty scopeTab={scopeTab} onResetFilters={handleResetFilters} />
      )}
      {shouldShowResults && (
        <ActivitiesListResults
          filteredItems={filteredItems}
          viewMode={viewMode}
          activitiesGridRef={activitiesGridRef}
          isTransitioning={isTransitioning}
          role={role}
          isWritable={isWritable}
          onRegister={handleRegister}
          onViewDetail={handleViewDetail}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      <ActivityDetailModal activityId={selectedActivityId} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

