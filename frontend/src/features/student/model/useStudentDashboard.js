import React from 'react';
import useSemesterData from '../../../hooks/useSemesterData';
import useDashboardData from '../../../hooks/useDashboardData';

export default function useStudentDashboard() {
  const { options: semesterOptions, currentSemester, loading: semesterLoading } = useSemesterData();
  
  // Initialize semester from sessionStorage or currentSemester
  const [semester, setSemester] = React.useState(() => {
    try {
      const saved = sessionStorage.getItem('current_semester');
      return saved || null;
    } catch {
      return null;
    }
  });

  // Set initial semester only once
  React.useEffect(() => {
    if (!semester && !semesterLoading) {
      if (currentSemester) {
        setSemester(currentSemester);
      } else if (semesterOptions.length > 0) {
        setSemester(semesterOptions[0]?.value || null);
      }
    }
  }, [currentSemester, semesterOptions, semesterLoading, semester]);

  const [recentFilter, setRecentFilter] = React.useState('all');
  const [recentActivities, setRecentActivities] = React.useState([]);

  const { upcoming, myActivities, summary, userProfile, studentInfo, loading } = useDashboardData({ semester: semester || undefined, role: 'student' });

  // Persist semester to sessionStorage whenever it changes
  const handleSetSemester = React.useCallback((newSemester) => {
    setSemester(newSemester);
    if (newSemester) {
      try {
        sessionStorage.setItem('current_semester', newSemester);
      } catch (_) {}
    }
  }, []);

  React.useEffect(() => {
    if (semester) {
      try { sessionStorage.setItem('current_semester', semester); } catch (_) {}
    }
  }, [semester]);

  const getClassification = React.useCallback((points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  }, []);

  React.useEffect(() => {
    let filtered = [];
    switch (recentFilter) {
      case 'pending':
        filtered = myActivities.pending;
        break;
      case 'approved':
        filtered = myActivities.approved;
        break;
      case 'joined':
        filtered = myActivities.joined;
        break;
      case 'rejected':
        filtered = myActivities.rejected;
        break;
      default:
        filtered = myActivities.all;
    }
    setRecentActivities(filtered);
  }, [recentFilter, myActivities]);

  const classification = getClassification(summary.totalPoints);

  const formatNumber = React.useCallback((n) => {
    const num = Number(n || 0);
    return (Math.round(num * 10) / 10).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  }, []);

  return {
    semester,
    setSemester: handleSetSemester,
    recentFilter,
    setRecentFilter,
    recentActivities,
    setRecentActivities,
    selectedActivityState: React.useState(null),
    showSummaryModalState: React.useState(false),
    upcoming,
    myActivities,
    summary,
    userProfile,
    studentInfo,
    loading,
    classification,
    formatNumber,
  };
}
