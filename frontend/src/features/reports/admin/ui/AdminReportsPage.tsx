import React from 'react';
import useAdminReports from '../model/useAdminReports';
import {
  AdminReportsHeader,
  AdminReportsFilters,
  AdminReportsCharts,
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
    alert(result.message);
  };

  const handleExportRegistrations = async () => {
    const result = await exportCsv('registrations');
    alert(result.message);
  };

  if (loading) {
    return <AdminReportsLoadingState />;
  }

  if (error) {
    return <AdminReportsErrorState error={error} />;
  }

  const stats = {
    total: totalByStatus('cho_duyet') + totalByStatus('da_duyet') + totalByStatus('tu_choi') + totalByStatus('da_tham_gia'),
    pending: totalByStatus('cho_duyet'),
    approved: totalByStatus('da_duyet'),
    rejected: totalByStatus('tu_choi')
  };

  return (
    <div className="space-y-6">
      <AdminReportsHeader stats={stats} />

      <AdminReportsFilters
        semester={semester}
        onSemesterChange={setSemester}
        onExportActivities={handleExportActivities}
        onExportRegistrations={handleExportRegistrations}
      />

      <AdminReportsCharts byStatus={overview.byStatus} dailyRegs={overview.dailyRegs} />

      <TopActivitiesList activities={overview.topActivities} totalDailyRegs={totalDailyRegs()} />
    </div>
  );
}
