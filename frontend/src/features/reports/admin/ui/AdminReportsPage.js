/**
 * Admin Reports Page (Tier 1: UI Layer)
 * =====================================
 * Single Responsibility: Orchestrate admin reports UI components
 * Design: Neo-brutalism style
 */

import React from 'react';
import useAdminReports from '../model/useAdminReports';
import {
  AdminReportsHeader,
  AdminReportsFilters,
  TopActivitiesList,
  AdminReportsLoadingState,
  AdminReportsErrorState
} from './components';

export default function AdminReports() {
  const {
    semester,
    setSemester,
    loading,
    error,
    overview,
    exportCsv,
    totalByStatus,
    totalDailyRegs
  } = useAdminReports();

  const handleExportActivities = async () => {
    const result = await exportCsv('activities');
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleExportRegistrations = async () => {
    const result = await exportCsv('registrations');
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return <AdminReportsLoadingState />;
  }

  if (error) {
    return <AdminReportsErrorState error={error} />;
  }

  // Calculate stats for header
  const stats = {
    total: (overview?.topActivities?.length || 0) + totalByStatus('cho_duyet') + totalByStatus('da_duyet') + totalByStatus('tu_choi'),
    pending: totalByStatus('cho_duyet'),
    approved: totalByStatus('da_duyet'),
    rejected: totalByStatus('tu_choi')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-10">
      <div className="p-4 sm:p-6 lg:p-8">
        <AdminReportsHeader stats={stats} />

        <AdminReportsFilters
          semester={semester}
          onSemesterChange={setSemester}
          onExportActivities={handleExportActivities}
          onExportRegistrations={handleExportRegistrations}
        />

        <TopActivitiesList activities={overview.topActivities} totalDailyRegs={totalDailyRegs} />
      </div>
    </div>
  );
}
