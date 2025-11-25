import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStudentDashboard from '../model/hooks/useStudentDashboard';
import { Zap } from 'lucide-react';
import DashboardHero from './components/Dashboard/DashboardHero';
import UpcomingActivities from './components/Dashboard/UpcomingActivities';
import RecentActivities from './components/Dashboard/RecentActivities';
import DashboardActivitySummaryModal from './components/Dashboard/DashboardActivitySummaryModal';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const {
    semester,
    setSemester,
    recentFilter,
    setRecentFilter,
    recentActivities,
    selectedActivityState,
    showSummaryModalState,
    upcoming,
    myActivities,
    summary,
    userProfile,
    studentInfo,
    loading,
    classification,
    formatNumber
  } = useStudentDashboard();

  const [selectedActivity, setSelectedActivity] = selectedActivityState;
  const [showSummaryModal, setShowSummaryModal] = showSummaryModalState;
  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setShowSummaryModal(true);
  };
  const handleCloseModal = () => {
    setShowSummaryModal(false);
    setSelectedActivity(null);
  };

  return (
    <div data-ref="student-dashboard-refactored" className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <DashboardHero
        summary={summary}
        userProfile={userProfile}
        studentInfo={studentInfo}
        classification={classification}
        semester={semester}
        onSemesterChange={setSemester}
        loading={loading}
        formatNumber={formatNumber}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute inset-0"></div>
            <Zap className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingActivities
              upcoming={upcoming}
              formatNumber={formatNumber}
              onViewAll={() => navigate('/student/activities')}
              onSelectActivity={handleSelectActivity}
            />
            <RecentActivities
              recentActivities={recentActivities}
              recentFilter={recentFilter}
              onFilterChange={setRecentFilter}
              myActivities={myActivities}
              formatNumber={formatNumber}
              onViewAll={() => navigate('/student/my-activities')}
              onSelectActivity={handleSelectActivity}
            />
          </div>
        </div>
      )}

      <DashboardActivitySummaryModal
        visible={showSummaryModal}
        activity={selectedActivity}
        onClose={handleCloseModal}
        formatNumber={formatNumber}
      />
    </div>
  );
}
