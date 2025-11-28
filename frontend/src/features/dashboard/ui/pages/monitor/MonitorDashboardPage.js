import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityDetailModal from '../../../../entities/activity/ui/ActivityDetailModal';
import { useSemesterData, useDashboardData } from '../../../../shared/hooks';
import {
  MonitorHeroSection,
  MonitorStatsGrid,
  MonitorActivitiesPanel,
  MonitorTopStudentsPanel
} from '../../shared/monitor';

export default function MonitorDashboardPage() {
  const navigate = useNavigate();

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [recentFilter, setRecentFilter] = useState('all');
  const [semester, setSemester] = useState(() => sessionStorage.getItem('current_semester') || '');

  const { options: semesterOptions, currentSemester } = useSemesterData(semester);
  const {
    upcoming,
    myActivities,
    summary,
    userProfile,
    topStudents,
    classSummary,
    approvals,
    loading
  } = useDashboardData({ semester, role: 'monitor' });

  useEffect(() => {
    if (!semesterOptions.length) return;
    const semesterExists = semesterOptions.some((opt) => opt.value === semester);
    if (semesterExists) return;

    const fallbackSemester =
      (currentSemester && semesterOptions.find((opt) => opt.value === currentSemester)?.value) ||
      semesterOptions[0]?.value;

    if (fallbackSemester) {
      setSemester(fallbackSemester);
    }
  }, [semesterOptions, currentSemester, semester]);

  useEffect(() => {
    if (semester) {
      try {
        sessionStorage.setItem('current_semester', semester);
      } catch (err) {
        console.warn('[MonitorDashboard] Unable to persist semester', err);
      }
    }
  }, [semester]);

  const handleActivityClick = (activityId) => {
    if (!activityId) return;
    setSelectedActivity(activityId);
    setShowActivityModal(true);
  };

  const handleCloseModal = () => {
    setShowActivityModal(false);
    setSelectedActivity(null);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || Number.isNaN(num)) return 0;
    return Math.round(Number(num) * 10) / 10;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  const monitorName = userProfile?.ho_ten || userProfile?.name || 'Lớp trưởng';
  const upcomingActivities = upcoming || [];
  const recentApprovals = myActivities?.all || [];

  const normalizeStatus = (activity) => {
    const raw = (activity?.trang_thai_dk || activity?.status || activity?.trang_thai || '').toLowerCase();
    if (raw === 'pending') return 'cho_duyet';
    if (raw === 'approved') return 'da_duyet';
    if (raw === 'participated' || raw === 'attended') return 'da_tham_gia';
    return raw || 'unknown';
  };

  const recentCounts = {
    all: recentApprovals.length,
    cho_duyet: recentApprovals.filter((a) => normalizeStatus(a) === 'cho_duyet').length,
    da_duyet: recentApprovals.filter((a) => normalizeStatus(a) === 'da_duyet').length,
    da_tham_gia: recentApprovals.filter((a) => normalizeStatus(a) === 'da_tham_gia').length,
    tu_choi: recentApprovals.filter((a) => normalizeStatus(a) === 'tu_choi').length
  };
  const filteredRecent =
    recentFilter === 'all'
      ? recentApprovals
      : recentApprovals.filter((activity) => normalizeStatus(activity) === recentFilter);

  const monitorPoints = Math.round(summary?.totalPoints || 0);
  const activitiesJoined = summary?.activitiesJoined || 0;
  const classRank = summary?.classRank || 1;
  const goalPoints = summary?.goalPoints || 0;
  const goalText = summary?.goalText || '';

  const progressPercent = Math.min(Math.round((monitorPoints / 100) * 100), 100);
  const totalPointsProgress = Math.min((monitorPoints / 100) * 100, 100);
  const totalStudents = summary?.totalStudents || classSummary?.totalStudents || 0;
  const pendingApprovals = approvals?.pending || 0;
  const totalActivities = classSummary?.totalActivitiesCount || classSummary?.approvedCount || 0;

  const getClassification = (points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };
  const classification = getClassification(monitorPoints);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonitorHeroSection
            userProfile={userProfile}
            monitorName={monitorName}
            classification={classification}
            monitorPoints={monitorPoints}
            summary={summary}
            totalStudents={totalStudents}
            progressPercent={progressPercent}
            totalPointsProgress={totalPointsProgress}
            semester={semester}
            onSemesterChange={setSemester}
            loading={loading}
          />

          <MonitorStatsGrid
            monitorPoints={monitorPoints}
            totalPointsProgress={totalPointsProgress}
            totalStudents={totalStudents}
            activitiesJoined={activitiesJoined}
            pendingApprovals={pendingApprovals}
            totalActivities={totalActivities}
            upcomingCount={upcomingActivities.length}
            classRank={classRank}
            goalPoints={goalPoints}
            goalText={goalText}
            formatNumber={formatNumber}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MonitorActivitiesPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            recentFilter={recentFilter}
            onRecentFilterChange={setRecentFilter}
            recentCounts={recentCounts}
            filteredRecent={filteredRecent}
            upcomingActivities={upcomingActivities}
            onActivityClick={handleActivityClick}
            onCreateActivity={() => navigate('/class/activities/create')}
            onViewAllActivities={() => navigate('/class/activities')}
            formatNumber={formatNumber}
          />

          <MonitorTopStudentsPanel topStudents={topStudents} />
        </div>
      </div>

      <ActivityDetailModal activityId={selectedActivity} isOpen={showActivityModal} onClose={handleCloseModal} />
    </div>
  );
}

