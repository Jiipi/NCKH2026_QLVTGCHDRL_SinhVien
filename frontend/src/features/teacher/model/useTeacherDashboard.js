import { useState, useEffect, useCallback } from 'react';
import { getDashboard, approveActivity, rejectActivity } from '../services/teacherDashboardApi';

// FSD Hook: useTeacherDashboard
// Mirrors legacy logic from ModernTeacherDashboard via consolidated service.
export default function useTeacherDashboard({ semester, classId }) {
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingApprovals: 0,
    totalStudents: 0,
    avgClassScore: 0,
    participationRate: 0,
    approvedThisWeek: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboard(semester, classId);
      const summary = data.summary || {};
      setStats({
        totalActivities: summary.totalActivities || 0,
        pendingApprovals: summary.pendingApprovals || 0,
        totalStudents: summary.totalStudents || 0,
        avgClassScore: summary.avgClassScore || 0,
        participationRate: summary.participationRate || 0,
        approvedThisWeek: summary.approvedThisWeek || 0
      });
      setRecentActivities(data.pendingActivities || []);
      setPendingRegistrations(data.pendingRegistrations || []);
      setClasses(data.classes || []);
      setStudents(data.students || []);
    } catch (e) {
      setError(e.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, [semester, classId]);

  useEffect(() => {
    fetchData();
  }, [semester, classId, fetchData]);

  const handleApprove = useCallback(async (id) => {
    await approveActivity(id);
    await fetchData();
  }, [fetchData]);

  const handleReject = useCallback(async (id, reason) => {
    await rejectActivity(id, reason);
    await fetchData();
  }, [fetchData]);

  return {
    stats,
    recentActivities,
    pendingRegistrations,
    classes,
    students,
    loading,
    error,
    refresh: fetchData,
    approve: handleApprove,
    reject: handleReject
  };
}
