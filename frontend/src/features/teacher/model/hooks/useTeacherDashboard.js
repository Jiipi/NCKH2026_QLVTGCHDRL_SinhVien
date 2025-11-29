/**
 * Teacher Dashboard Hook (Tier 2: Business Logic Layer)
 * =====================================================
 * Single Responsibility: Dashboard state and business logic only
 * 
 * @module features/teacher/model/hooks/useTeacherDashboard
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherDashboardApi } from '../../services/teacherDashboardApi';
import { teacherActivitiesApi } from '../../services/teacherActivitiesApi';
import { teacherRegistrationsApi } from '../../services/teacherRegistrationsApi';
import { mapDashboardToUI } from '../mappers/teacher.mappers';
import { 
  dedupeById, 
  isWithinDays, 
  toFiniteNumber, 
  devLog 
} from '../utils/teacherUtils';
import { useAutoRefresh, useDataChangeListener } from '../../../../shared/lib/dataRefresh';

/**
 * Hook quản lý dashboard của giáo viên
 */
export default function useTeacherDashboard({ semester, classId }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [derivedStats, setDerivedStats] = useState({
    totalActivities: 0,
    pendingActivities: 0,
    pendingRegistrations: 0,
    approvedThisWeek: 0,
    avgClassScore: null,
    participationRate: null
  });

  // Business logic: Load dashboard data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherDashboardApi.getDashboard(semester, classId);
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        console.error('[useTeacherDashboard] Dashboard error:', result.error);
        setError(result.error || 'Không thể tải dữ liệu dashboard');
        setDashboardData(null);
      }
    } catch (err) {
      console.error('[useTeacherDashboard] Load error:', err);
      setError(err?.message || 'Không thể tải dữ liệu dashboard');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [semester, classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for data changes from same tab
  useDataChangeListener(['ACTIVITIES', 'APPROVALS', 'REGISTRATIONS'], fetchData, { debounceMs: 500 });

  // Auto-refresh for cross-user sync (60s interval for dashboard)
  useAutoRefresh(fetchData, { 
    intervalMs: 60000, 
    enabled: !!semester,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  useEffect(() => {
    let cancelled = false;
    async function loadDerivedStats() {
      if (!semester) {
        if (!cancelled) {
          setDerivedStats({
            totalActivities: 0,
            pendingActivities: 0,
            pendingRegistrations: 0,
            approvedThisWeek: 0,
            avgClassScore: null,
            participationRate: null
          });
        }
        return;
      }
      try {
        const [activitiesRes, reportsRes, pendingRegistrationsListRes, approvedRegistrationsListRes] = await Promise.all([
          teacherActivitiesApi.listActivities({ page: 1, limit: 'all', semester }),
          teacherDashboardApi.getReportStatistics({ semester }),
          teacherRegistrationsApi.listRegistrations({ status: 'cho_duyet', semester, limit: 500 }),
          teacherRegistrationsApi.listRegistrations({ status: 'da_duyet', semester, limit: 500 })
        ]);

        if (cancelled) return;

        const activitiesList = activitiesRes.success
          ? dedupeById(activitiesRes.data?.items || [])
          : [];
        const totalActivities = activitiesRes.success
          ? (activitiesRes.data?.total ?? activitiesList.length)
          : 0;

        const pendingRegistrationsList = pendingRegistrationsListRes.success
          ? dedupeById(pendingRegistrationsListRes.data?.items || [])
          : [];
        const pendingRegistrationsCount = pendingRegistrationsList.length;

        // Approved activities within selected semester occurring last 7 days
        const approvedActivitiesThisWeek = activitiesList
          .filter(activity => activity.trang_thai === 'da_duyet')
          .filter(activity => {
            const date = activity.ngay_cap_nhat || activity.ngay_duyet || activity.ngay_bd;
            return isWithinDays(date, 7);
          })
          .length;

        const approvedRegistrationsList = approvedRegistrationsListRes.success
          ? dedupeById(approvedRegistrationsListRes.data?.items || [])
          : [];
        const approvedRegistrationsThisWeek = approvedRegistrationsList.filter((registration) => {
          const date = registration.ngay_duyet || registration.updated_at || registration.updatedAt;
          return isWithinDays(date, 7);
        }).length;

        const derivedApprovedThisWeek = approvedActivitiesThisWeek + approvedRegistrationsThisWeek;

        const reportOverview = reportsRes.success ? reportsRes.data?.overview || {} : {};
        const avgPoints = typeof reportOverview.avgPoints === 'number'
          ? reportOverview.avgPoints
          : null;
        const reportParticipationRate = typeof reportOverview.participationRate === 'number'
          ? reportOverview.participationRate
          : null;

        if (!cancelled) {
        setDerivedStats({
          totalActivities,
            pendingActivities: pendingRegistrationsCount,
          pendingRegistrations: pendingRegistrationsCount,
          approvedThisWeek: derivedApprovedThisWeek,
          avgClassScore: avgPoints,
          participationRate: reportParticipationRate
        });
        }
      } catch (err) {
        console.error('[useTeacherDashboard] Derived stats error:', err);
        if (!cancelled) {
          setDerivedStats({
            totalActivities: 0,
            pendingActivities: 0,
            pendingRegistrations: 0,
            approvedThisWeek: 0,
            avgClassScore: null,
            participationRate: null
          });
        }
      }
    }
    loadDerivedStats();
    return () => { cancelled = true; };
  }, [semester]);

  // Business logic: Transform dashboard data
  const dashboard = useMemo(() => {
    if (!dashboardData) {
      return {
        summary: {
          totalActivities: 0,
          pendingApprovals: 0,
          totalStudents: 0,
          avgClassScore: 0,
          participationRate: 0,
          approvedThisWeek: 0
        },
        pendingActivities: [],
        pendingRegistrations: [],
        classes: [],
        students: []
      };
    }
    return mapDashboardToUI(dashboardData);
  }, [dashboardData]);

  // Business logic: Extract stats with fallbacks derived from lists
  const stats = useMemo(() => {
    const base = dashboard.summary || {};
    const pendingActivitiesCount = dashboard.pendingActivities?.length || 0;
    const pendingRegistrationsCount = dashboard.pendingRegistrations?.length || 0;
    const totalStudents = dashboard.students?.length || 0;
    const studentsWithScores = (dashboard.students || []).filter((student) => {
      return (Number(student.diem_rl) || 0) > 0;
    });
    const totalScores = studentsWithScores.reduce((sum, student) => {
      const score = Number(student.diem_rl) || 0;
      return sum + score;
    }, 0);
    const avgScoreFallback = studentsWithScores.length > 0
      ? Number((totalScores / studentsWithScores.length).toFixed(1))
      : 0;
    const participationRateFallback = totalStudents > 0
      ? Number(((studentsWithScores.length / totalStudents) * 100).toFixed(1))
      : 0;

    const toNumber = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    };

    const derivedPending = derivedStats.pendingActivities + derivedStats.pendingRegistrations || (pendingActivitiesCount + pendingRegistrationsCount);

    const totalActivitiesValue = derivedStats.totalActivities || toNumber(base.totalActivities) || pendingActivitiesCount;
    const pendingApprovalsValue = derivedPending || toNumber(base.pendingApprovals);
    const hasValidNumber = (value) => typeof value === 'number' && Number.isFinite(value);
    const avgClassScoreValue = hasValidNumber(derivedStats.avgClassScore)
      ? Number(derivedStats.avgClassScore)
      : hasValidNumber(base.avgClassScore)
        ? Number(base.avgClassScore)
        : avgScoreFallback;
    const participationRateValue = hasValidNumber(derivedStats.participationRate)
      ? Number(derivedStats.participationRate)
      : hasValidNumber(base.participationRate)
        ? Number(base.participationRate)
        : participationRateFallback;
    const approvedThisWeekValue = derivedStats.approvedThisWeek || toNumber(base.approvedThisWeek);

    return {
      totalActivities: Math.round(totalActivitiesValue),
      pendingApprovals: Math.round(pendingApprovalsValue),
      totalStudents: totalStudents || toNumber(base.totalStudents),
      avgClassScore: Number(avgClassScoreValue.toFixed(1)),
      participationRate: Number(participationRateValue.toFixed(1)),
      approvedThisWeek: approvedThisWeekValue
    };
  }, [dashboard, derivedStats]);

  // Business logic: Extract recent activities
  const recentActivities = useMemo(() => {
    const sourceActivities = dashboard.pendingActivities || [];
    return dedupeById(
      sourceActivities.filter((activity) => {
        const status = (activity.trang_thai || activity.status || '').toLowerCase();
        return status === 'cho_duyet' || status === 'pending';
      })
    );
  }, [dashboard]);

  // Business logic: Extract pending registrations
  const pendingRegistrations = useMemo(() => dashboard.pendingRegistrations, [dashboard]);

  // Business logic: Extract classes
  const classes = useMemo(() => dashboard.classes, [dashboard]);

  // Business logic: Extract students
  const students = useMemo(() => dashboard.students, [dashboard]);

  // Business logic: Handle approve activity
  const handleApprove = useCallback(async (id) => {
    try {
      const result = await teacherDashboardApi.approveActivity(id);
      if (result.success) {
        await fetchData();
      } else {
        setError(result.error || 'Không thể phê duyệt hoạt động');
      }
    } catch (err) {
      console.error('[useTeacherDashboard] Approve error:', err);
      setError(err?.message || 'Không thể phê duyệt hoạt động');
    }
  }, [fetchData]);

  // Business logic: Handle reject activity
  const handleReject = useCallback(async (id, reason) => {
    try {
      const result = await teacherDashboardApi.rejectActivity(id, reason);
      if (result.success) {
        await fetchData();
      } else {
        setError(result.error || 'Không thể từ chối hoạt động');
      }
    } catch (err) {
      console.error('[useTeacherDashboard] Reject error:', err);
      setError(err?.message || 'Không thể từ chối hoạt động');
    }
  }, [fetchData]);

  return {
    // Data
    stats,
    recentActivities,
    pendingRegistrations,
    classes,
    students,
    dashboard,
    
    // State
    loading,
    error,
    
    // Actions
    refresh: fetchData,
    approve: handleApprove,
    reject: handleReject
  };
}

