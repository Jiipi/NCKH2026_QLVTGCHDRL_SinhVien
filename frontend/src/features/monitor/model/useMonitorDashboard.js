import React from 'react';
import useSemesterData from '../../../hooks/useSemesterData';
import useDashboardData from '../../../hooks/useDashboardData';

export default function useMonitorDashboard() {
  const navigate = () => {}; // placeholder for parity; navigation handled in UI via useNavigate

  const [selectedActivity, setSelectedActivity] = React.useState(null);
  const [selectedActivityId, setSelectedActivityId] = React.useState(null);
  const [showSummaryModal, setShowSummaryModal] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('upcoming');
  const [recentFilter, setRecentFilter] = React.useState('all');

  const [semester, setSemester] = React.useState(() => {
    try {
      const cached = sessionStorage.getItem('current_semester');
      return cached || '';
    } catch (_) {
      return '';
    }
  });

  const { currentSemester } = useSemesterData(semester);

  const {
    upcoming,
    myActivities,
    summary,
    userProfile,
    studentInfo,
    topStudents,
    classSummary,
    approvals,
    loading
  } = useDashboardData({ semester, role: 'monitor' });

  React.useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester]);

  React.useEffect(() => {
    if (semester) {
      try { sessionStorage.setItem('current_semester', semester); } catch (_) {}
    }
  }, [semester]);

  const handleActivityClick = React.useCallback((activity) => {
    setSelectedActivity(activity);
    setSelectedActivityId(activity?.id || activity);
    setShowSummaryModal(true);
  }, []);

  const handleCloseSummaryModal = React.useCallback(() => {
    setShowSummaryModal(false);
    setSelectedActivity(null);
    setSelectedActivityId(null);
  }, []);

  const handleCloseDetailModal = React.useCallback(() => {
    setShowDetailModal(false);
    setSelectedActivityId(null);
  }, []);

  const formatNumber = React.useCallback((num) => {
    if (num === null || num === undefined) return '0';
    return Math.round(Number(num) * 10) / 10;
  }, []);

  const getSemesterDisplay = React.useCallback((v) => {
    if (v === 'hoc_ky_1') return 'Học kỳ 1';
    if (v === 'hoc_ky_2') return 'Học kỳ 2';
    if (v === 'hoc_ky_he') return 'Học kỳ hè';
    return v;
  }, []);

  const monitorName = userProfile?.ho_ten || userProfile?.name || 'Lớp trưởng';
  const monitorMssv = studentInfo?.mssv || userProfile?.mssv || summary?.mssv;
  const upcomingActivities = upcoming || [];
  const recentApprovals = myActivities?.all || [];

  const normalizeStatus = (a) => {
    const s = (a?.trang_thai_dk || a?.status || a?.trang_thai || '').toLowerCase();
    if (s === 'pending') return 'cho_duyet';
    if (s === 'approved') return 'da_duyet';
    if (s === 'participated' || s === 'attended') return 'da_tham_gia';
    return s || 'unknown';
  };

  const recentCounts = React.useMemo(() => ({
    all: recentApprovals.length,
    cho_duyet: recentApprovals.filter(a => normalizeStatus(a) === 'cho_duyet').length,
    da_duyet: recentApprovals.filter(a => normalizeStatus(a) === 'da_duyet').length,
    da_tham_gia: recentApprovals.filter(a => normalizeStatus(a) === 'da_tham_gia').length,
    tu_choi: recentApprovals.filter(a => normalizeStatus(a) === 'tu_choi').length,
  }), [recentApprovals]);

  const filteredRecent = React.useMemo(() => (
    recentApprovals.filter(a => recentFilter === 'all' ? true : normalizeStatus(a) === recentFilter)
  ), [recentApprovals, recentFilter]);

  const monitorPoints = Math.round(summary?.totalPoints || 0);
  const activitiesJoined = summary?.activitiesJoined || 0;
  const pendingActivities = myActivities?.pending?.length || 0; // kept for parity if needed
  const classRank = summary?.classRank || 1;
  const goalPoints = summary?.goalPoints || 0;
  const goalText = summary?.goalText || '';

  const progressPercent = Math.min(Math.round((monitorPoints / 100) * 100), 100);
  const totalPointsProgress = Math.min((monitorPoints / 100) * 100, 100);

  const totalStudents = classSummary?.summary?.totalStudents || classSummary?.totalStudents || summary?.totalStudents || 0;
  const pendingApprovals = approvals?.pending || classSummary?.summary?.pendingApprovals || 0;
  const totalActivities = classSummary?.summary?.totalActivities || classSummary?.totalActivitiesCount || classSummary?.approvedCount || 0;

  const getClassification = React.useCallback((points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  }, []);
  const classification = getClassification(monitorPoints);

  return {
    // semester
    semester,
    setSemester,

    // tabs and filters
    activeTab,
    setActiveTab,
    recentFilter,
    setRecentFilter,
    recentCounts,
    filteredRecent,

    // activity selection & modals
    selectedActivity,
    setSelectedActivity,
    selectedActivityId,
    setSelectedActivityId,
    showSummaryModal,
    setShowSummaryModal,
    showDetailModal,
    setShowDetailModal,
    handleActivityClick,
    handleCloseSummaryModal,
    handleCloseDetailModal,

    // data
    upcomingActivities,
    myActivities,
    summary,
    userProfile,
    topStudents,
    classSummary,
    approvals,
    loading,

    // derived
    monitorName,
    monitorMssv,
    monitorPoints,
    activitiesJoined,
    pendingActivities,
    classRank,
    goalPoints,
    goalText,
    progressPercent,
    totalPointsProgress,
    totalStudents,
    pendingApprovals,
    totalActivities,
    classification,

    // helpers
    formatNumber,
    getSemesterDisplay,
  };
}
