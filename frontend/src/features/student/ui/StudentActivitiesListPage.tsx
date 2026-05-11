import React, { useMemo } from 'react';
import { Calendar, Sparkles, Trophy } from 'lucide-react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import SemesterClosureBanner from '../../../shared/components/semester/SemesterClosureBanner';
import useStudentActivitiesList from '../model/hooks/useStudentActivitiesList';
import ActivitiesListToolbar from './components/ActivitiesList/ActivitiesListToolbar';
import ActivitiesListFiltersPanel from './components/ActivitiesList/ActivitiesListFiltersPanel';
import ActivitiesListLoading from './components/ActivitiesList/ActivitiesListLoading';
import ActivitiesListError from './components/ActivitiesList/ActivitiesListError';
import ActivitiesListEmpty from './components/ActivitiesList/ActivitiesListEmpty';
import ActivitiesListResults from './components/ActivitiesList/ActivitiesListResults';

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
    allItems,
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

  // Compute stats from allItems for the stats bar
  const stats = useMemo(() => {
    const now = new Date();
    let upcoming = 0;
    let past = 0;
    let totalPoints = 0;

    (allItems || []).forEach((item: any) => {
      const endDate = item.ngay_kt ? new Date(item.ngay_kt) : null;
      const startDate = item.ngay_bd ? new Date(item.ngay_bd) : null;

      if (endDate && endDate < now) {
        past++;
      } else if (startDate && startDate > now) {
        upcoming++;
      }

      if (item.is_registered && item.diem_rl) {
        totalPoints += Number(item.diem_rl) || 0;
      }
    });

    return {
      total: (allItems || []).length,
      upcoming,
      past,
      totalPoints: Math.min(totalPoints, 100)
    };
  }, [allItems]);

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
    <div className="flex flex-col flex-1 space-y-4" data-ref="student-activities-list-refactored">
      <StudentPageHero
        eyebrow="Không gian sinh viên"
        title="Danh sách hoạt động"
        description="Khám phá hoạt động phù hợp, lọc theo học kỳ và đăng ký để tích lũy điểm rèn luyện."
        chips={[
          { icon: Calendar, label: `${stats.total} hoạt động` },
          { icon: Sparkles, label: `${stats.upcoming} sắp diễn ra` },
          { icon: Trophy, label: `${stats.totalPoints}/100 điểm` }
        ]}
      />

      <SemesterClosureBanner />

      <ActivitiesListToolbar
        query={query}
        onQueryChange={setQuery}
        onSearch={onSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onClearFilters={clearAllFilters}
        activeFilterCount={activeFilterCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        stats={stats}
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
