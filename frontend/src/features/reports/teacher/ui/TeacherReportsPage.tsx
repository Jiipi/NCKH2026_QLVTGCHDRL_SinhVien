/**
 * Teacher Reports Page (Tier 1: UI Layer)
 * ========================================
 * Single Responsibility: Orchestrate teacher reports UI components
 */

import React from 'react';
import useTeacherReports from '../model/useTeacherReports';
import {
  TeacherReportsHeader,
  TeacherReportsFilters,
  TeacherChartsSection,
  TeacherReportsTable,
  TeacherReportsLoadingState,
  TeacherReportsErrorState
} from './components';

export default function ModernReports() {
  const {
    stats,
    loading,
    error,
    dateRange,
    setDateRange,
    semester,
    setSemester,
    semesterOptions,
    filterMode,
    setFilterMode,
    loadStatistics,
    handleExport
  } = useTeacherReports();

  const handleExportExcel = async () => {
    const result = await handleExport('excel');
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleExportPDF = async () => {
    const result = await handleExport('pdf');
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return <TeacherReportsLoadingState />;
  }

  if (error) {
    return <TeacherReportsErrorState error={error} onRetry={loadStatistics} />;
  }

  return (
    <div className="p-8">
      <TeacherReportsHeader stats={stats} />

      <TeacherReportsFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        semester={semester}
        semesterOptions={semesterOptions}
        setSemester={setSemester}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        onRefresh={loadStatistics}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      <TeacherChartsSection
        monthlyActivities={(stats as any)?.monthlyActivities || []}
        pointsDistribution={(stats as any)?.pointsDistribution || []}
      />

      <TeacherReportsTable
        activityTypes={(stats as any)?.activityTypes || []}
        topStudents={(stats as any)?.topStudents || []}
      />
    </div>
  );
}

