/**
 * Monitor Reports Page (Tier 1: UI Layer)
 * ========================================
 * Single Responsibility: Orchestrate report UI components
 */

import React from 'react';
import useMonitorReports from '../model/useMonitorReports';
import {
  ReportsHeader,
  ReportsSemesterFilter,
  ReportsChartSelector,
  ParticipationChart,
  ActivitiesChart,
  PointsChart,
  TopStudentsList,
  ReportsLoadingState,
  ReportsErrorState
} from './components';

export default function ClassReports() {
  const {
    reportData,
    loading,
    error,
    selectedChart,
    setSelectedChart,
    semester,
    setSemester,
    semesterOptions,
    loadReportData,
    handleExportExcel,
    handleExportPDF,
    overview
  } = useMonitorReports();

  if (loading) {
    return <ReportsLoadingState />;
  }

  if (error) {
    return <ReportsErrorState error={error} onRetry={loadReportData} />;
  }

  return (
    <div className="space-y-6">
      <ReportsHeader 
        overview={overview} 
        onExportExcel={handleExportExcel} 
        onExportPDF={handleExportPDF} 
      />

      <ReportsSemesterFilter
        semester={semester}
        semesterOptions={semesterOptions}
        onSemesterChange={setSemester}
        onRefresh={loadReportData}
      />

      <ReportsChartSelector
        selectedChart={selectedChart}
        onChartChange={setSelectedChart}
      />

      {/* Charts */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8">
        {selectedChart === 'participation' && (
          <ParticipationChart data={reportData?.pointsDistribution || []} />
        )}

        {selectedChart === 'activities' && (
          <ActivitiesChart data={reportData?.activityTypes || []} />
        )}

        {selectedChart === 'points' && (
          <PointsChart reportData={reportData} />
        )}
      </div>

      <TopStudentsList students={reportData?.topStudents} />
    </div>
  );
}

