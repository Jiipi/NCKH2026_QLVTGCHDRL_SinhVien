/**
 * Monitor Dashboard Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho dashboard lớp trưởng
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import useSemesterData, { useGlobalSemesterSync, setGlobalSemester, getGlobalSemester } from '../../../../shared/hooks/useSemesterData';
import { monitorDashboardApi } from '../../services/monitorDashboardApi';
import { studentDashboardApi } from '../../../student/services/studentDashboardApi';
import { studentActivitiesApi } from '../../../student/services/studentActivitiesApi';
import { studentProfileApi } from '../../../student/services/studentProfileApi';
import { mapDashboardToUI, groupRegistrationsByStatus } from '../mappers/monitor.mappers';
import { mapDashboardToUI as mapStudentDashboardToUI } from '../../../student/model/mappers/student.mappers';
import { groupActivitiesByStatus } from '../../../student/model/mappers/student.mappers';
import { useAutoRefresh, useDataChangeListener } from '../../../../shared/lib/dataRefresh';

export default function useMonitorDashboard() {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [recentFilter, setRecentFilter] = useState('all');

  // Initialize semester from global storage (synced across all forms)
  const [semester, setSemesterState] = useState(() => {
    try {
      return getGlobalSemester() || null;
    } catch (_) {
      return null;
    }
  });

  const { currentSemester, options: semesterOptions, loading: semesterLoading } = useSemesterData(semester);

  // Sync với global semester changes từ các form khác
  useGlobalSemesterSync(semester, setSemesterState);

  // Re-sync on mount (in case sessionStorage was updated while unmounted)
  useEffect(() => {
    const stored = getGlobalSemester();
    if (stored && stored !== semester) {
      setSemesterState(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Data state
  const [monitorDashboardData, setMonitorDashboardData] = useState(null);
  const [studentDashboardData, setStudentDashboardData] = useState(null);
  const [myActivitiesData, setMyActivitiesData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business logic: Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!semester) {
      setMonitorDashboardData(null);
      setStudentDashboardData(null);
      setMyActivitiesData([]);
      setProfileData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [monitorResult, studentResult, activitiesResult, profileResult] = await Promise.all([
        monitorDashboardApi.getDashboard(semester),
        studentDashboardApi.getDashboard(semester),
        studentActivitiesApi.getMyActivities(semester),
        studentProfileApi.getProfile()
      ]);

      // Set monitor dashboard data
      if (monitorResult.success) {
        setMonitorDashboardData(monitorResult.data);
      } else {
        console.error('[useMonitorDashboard] Monitor dashboard error:', monitorResult.error);
        setMonitorDashboardData(null);
      }

      // Set student dashboard data (for personal stats)
      if (studentResult.success) {
        setStudentDashboardData(studentResult.data);
      } else {
        console.error('[useMonitorDashboard] Student dashboard error:', studentResult.error);
        setStudentDashboardData(null);
      }

      // Set my activities data
      if (activitiesResult.success) {
        setMyActivitiesData(activitiesResult.data || []);
      } else {
        console.error('[useMonitorDashboard] Activities error:', activitiesResult.error);
        setMyActivitiesData([]);
      }

      // Set profile data
      if (profileResult.success) {
        setProfileData(profileResult.data);
      } else {
        console.error('[useMonitorDashboard] Profile error:', profileResult.error);
        setProfileData(null);
      }
    } catch (err) {
      console.error('[useMonitorDashboard] Load error:', err);
      setError(err?.message || 'Không thể tải dữ liệu dashboard');
      setMonitorDashboardData(null);
      setStudentDashboardData(null);
      setMyActivitiesData([]);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  // Load data when semester changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Listen for data changes from same tab
  useDataChangeListener(['ACTIVITIES', 'APPROVALS', 'REGISTRATIONS', 'SCORES'], loadDashboardData, { debounceMs: 500 });

  // Auto-refresh for cross-user sync (60s interval for dashboard)
  useAutoRefresh(loadDashboardData, { 
    intervalMs: 60000, 
    enabled: !!semester,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  // Set initial semester only once (use backend active semester)
  useEffect(() => {
    if (!semester && !semesterLoading) {
      if (currentSemester) {
        setSemesterState(currentSemester);
        setGlobalSemester(currentSemester);
      } else if (semesterOptions.length > 0) {
        const firstSemester = semesterOptions[0]?.value || null;
        setSemesterState(firstSemester);
        setGlobalSemester(firstSemester);
      }
    }
  }, [currentSemester, semesterOptions, semesterLoading, semester]);

  // Wrapper để broadcast global khi thay đổi semester
  const handleSetSemester = useCallback((newSemester) => {
    setSemesterState(newSemester);
    setGlobalSemester(newSemester);
  }, []);

  // Business logic: Transform monitor dashboard data
  const monitorDashboard = useMemo(() => {
    if (!monitorDashboardData) {
      return {
        summary: {
          className: '',
          totalStudents: 0,
          pendingApprovals: 0,
          totalActivities: 0,
          avgClassScore: 0,
          participationRate: 0
        },
        upcomingActivities: [],
        recentApprovals: [],
        topStudents: []
      };
    }
    return mapDashboardToUI(monitorDashboardData);
  }, [monitorDashboardData]);

  // Business logic: Transform student dashboard data (for personal stats)
  const studentDashboard = useMemo(() => {
    if (!studentDashboardData) {
      return {
        tong_quan: { tong_diem: 0, tong_hoat_dong: 0, muc_tieu: 100 },
        so_sanh_lop: { my_rank_in_class: 1, total_students_in_class: 0 },
        hoat_dong_sap_toi: []
      };
    }
    return mapStudentDashboardToUI(studentDashboardData);
  }, [studentDashboardData]);

  // Business logic: Transform my activities
  const myActivities = useMemo(() => {
    if (!myActivitiesData || myActivitiesData.length === 0) {
      return { all: [], pending: [], approved: [], joined: [], rejected: [] };
    }
    return groupActivitiesByStatus(myActivitiesData);
  }, [myActivitiesData]);

  // Business logic: Extract data for UI
  const userProfile = useMemo(() => {
    if (!profileData) return null;
    const nguoiDung = profileData.nguoi_dung || profileData.user || profileData || {};
    return {
      ho_ten: nguoiDung.ho_ten || nguoiDung.name || '',
      name: nguoiDung.ho_ten || nguoiDung.name || '',
      email: nguoiDung.email || '',
      anh_dai_dien: nguoiDung.anh_dai_dien || nguoiDung.avatar || null,
      avatar: nguoiDung.anh_dai_dien || nguoiDung.avatar || null,
      mssv: profileData.sinh_vien?.mssv || profileData.mssv || ''
    };
  }, [profileData]);

  const studentInfo = useMemo(() => {
    if (!studentDashboardData) {
      return { mssv: '', ten_lop: '' };
    }
    const sinhVien = studentDashboardData.sinh_vien || {};
    return {
      mssv: sinhVien.mssv || userProfile?.mssv || '',
      ten_lop: sinhVien.lop?.ten_lop || sinhVien.ten_lop || ''
    };
  }, [studentDashboardData, userProfile]);

  // Business logic: Extract summary
  const summary = useMemo(() => {
    const tongQuan = studentDashboard.tong_quan || {};
    const soSanhLop = studentDashboard.so_sanh_lop || {};
    const totalPoints = Number(tongQuan.tong_diem || 0);
    const targetPoints = Number(tongQuan.muc_tieu || 100);
    const progress = Math.round(Math.min((totalPoints / targetPoints) * 100, 100) * 10) / 10;

    // Calculate goal
    let goalPoints = 0;
    let goalText = '';
    if (totalPoints < 50) {
      goalPoints = Math.max(0, Math.ceil(50 - totalPoints));
      goalText = `Cần ${goalPoints} điểm để đạt Trung bình`;
    } else if (totalPoints < 65) {
      goalPoints = Math.max(0, Math.ceil(65 - totalPoints));
      goalText = `Cần ${goalPoints} điểm để đạt Khá`;
    } else if (totalPoints < 80) {
      goalPoints = Math.max(0, Math.ceil(80 - totalPoints));
      goalText = `Cần ${goalPoints} điểm để đạt Tốt`;
    } else if (totalPoints < 90) {
      goalPoints = Math.max(0, Math.ceil(90 - totalPoints));
      goalText = `Cần ${goalPoints} điểm để đạt Xuất sắc`;
    } else {
      goalPoints = 0;
      goalText = 'ĐÃ ĐẠT XUẤT SẮC';
    }

    return {
      totalPoints: Math.round(totalPoints * 10) / 10,
      activitiesJoined: tongQuan.tong_hoat_dong || 0,
      activitiesUpcoming: studentDashboard.hoat_dong_sap_toi?.length || 0,
      classRank: soSanhLop.my_rank_in_class || 1,
      totalStudents: soSanhLop.total_students_in_class || 1,
      progress,
      targetPoints,
      goalText,
      goalPoints
    };
  }, [studentDashboard]);

  // Business logic: Extract class data
  const classSummary = useMemo(() => monitorDashboard.summary, [monitorDashboard]);
  const topStudents = useMemo(() => monitorDashboard.topStudents, [monitorDashboard]);
  const upcomingActivities = useMemo(() => monitorDashboard.upcomingActivities, [monitorDashboard]);

  // Business logic: Extract approvals
  const approvals = useMemo(() => {
    const recentApprovals = monitorDashboard.recentApprovals || [];
    const grouped = groupRegistrationsByStatus(recentApprovals);
    return {
      pending: grouped.cho_duyet.length,
      total: recentApprovals.length
    };
  }, [monitorDashboard]);

  // Business logic: Extract recent activities
  const recentApprovals = useMemo(() => myActivities.all || [], [myActivities]);

  const normalizeStatus = useCallback((a) => {
    const s = (a?.trang_thai_dk || a?.status || a?.trang_thai || '').toLowerCase();
    if (s === 'pending') return 'cho_duyet';
    if (s === 'approved') return 'da_duyet';
    if (s === 'participated' || s === 'attended') return 'da_tham_gia';
    return s || 'unknown';
  }, []);

  const recentCounts = useMemo(() => ({
    all: recentApprovals.length,
    cho_duyet: recentApprovals.filter(a => normalizeStatus(a) === 'cho_duyet').length,
    da_duyet: recentApprovals.filter(a => normalizeStatus(a) === 'da_duyet').length,
    da_tham_gia: recentApprovals.filter(a => normalizeStatus(a) === 'da_tham_gia').length,
    tu_choi: recentApprovals.filter(a => normalizeStatus(a) === 'tu_choi').length,
  }), [recentApprovals, normalizeStatus]);

  const filteredRecent = useMemo(() => (
    recentApprovals.filter(a => recentFilter === 'all' ? true : normalizeStatus(a) === recentFilter)
  ), [recentApprovals, recentFilter, normalizeStatus]);

  // Business logic: Calculate class rank from topStudents
  const classRank = useMemo(() => {
    if (!topStudents || topStudents.length === 0) {
      // Fallback to student dashboard data if topStudents is empty
      return summary?.classRank || 1;
    }

    const monitorMssv = studentInfo?.mssv || userProfile?.mssv || profileData?.sinh_vien?.mssv || '';
    const monitorId = profileData?.sinh_vien?.id || profileData?.id;
    
    if (!monitorMssv && !monitorId) {
      return summary?.classRank || 1;
    }

    // Find the index of monitor in topStudents array
    // topStudents is already sorted by points (descending)
    const monitorIndex = topStudents.findIndex(student => {
      // Match by MSSV (preferred) or by ID
      const mssvMatch = monitorMssv && (
        student.mssv === monitorMssv || 
        String(student.mssv) === String(monitorMssv) ||
        student.mssv?.trim() === monitorMssv.trim()
      );
      const idMatch = monitorId && student.id === monitorId;
      return mssvMatch || idMatch;
    });

    if (monitorIndex === -1) {
      // Monitor not found in topStudents, fallback to student dashboard
      console.warn('[useMonitorDashboard] Monitor not found in topStudents, using fallback rank');
      return summary?.classRank || 1;
    }

    // Rank is index + 1 (since array is 0-indexed)
    // topStudents is sorted by points descending, so index 0 = rank 1
    return monitorIndex + 1;
  }, [topStudents, studentInfo, userProfile, profileData, summary]);

  // Business logic: Calculate derived values
  const monitorName = useMemo(() => userProfile?.ho_ten || userProfile?.name || 'Lớp trưởng', [userProfile]);
  const monitorMssv = useMemo(() => studentInfo?.mssv || userProfile?.mssv || '', [studentInfo, userProfile]);
  const monitorPoints = useMemo(() => Math.round(summary?.totalPoints || 0), [summary]);
  const activitiesJoined = useMemo(() => summary?.activitiesJoined || 0, [summary]);
  const goalPoints = useMemo(() => summary?.goalPoints || 0, [summary]);
  const goalText = useMemo(() => summary?.goalText || '', [summary]);
  const totalPointsProgress = useMemo(() => Math.min((monitorPoints / 100) * 100, 100), [monitorPoints]);
  const totalStudents = useMemo(() => classSummary?.totalStudents || 0, [classSummary]);
  const pendingApprovals = useMemo(() => approvals?.pending || classSummary?.pendingApprovals || 0, [approvals, classSummary]);
  const totalActivities = useMemo(() => classSummary?.totalActivities || 0, [classSummary]);

  const getClassification = useCallback((points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  }, []);

  const classification = useMemo(() => getClassification(monitorPoints), [monitorPoints, getClassification]);

  const formatNumber = useCallback((num) => {
    if (num === null || num === undefined) return '0';
    return Math.round(Number(num) * 10) / 10;
  }, []);

  const handleActivityClick = useCallback((activity) => {
    setSelectedActivity(activity);
    setSelectedActivityId(activity?.id || activity);
    setShowSummaryModal(true);
  }, []);

  const handleCloseSummaryModal = useCallback(() => {
    setShowSummaryModal(false);
    setSelectedActivity(null);
    setSelectedActivityId(null);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedActivityId(null);
  }, []);

  return {
    // Semester
    semester,
    setSemester: handleSetSemester,

    // Tabs and filters
    activeTab,
    setActiveTab,
    recentFilter,
    setRecentFilter,
    recentCounts,
    filteredRecent,

    // Activity selection & modals
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

    // Data
    upcomingActivities,
    myActivities,
    summary,
    userProfile,
    topStudents,
    classSummary,
    approvals,
    loading,
    error,

    // Derived values for UI
    monitorName,
    monitorMssv,
    monitorPoints,
    activitiesJoined,
    classRank,
    goalPoints,
    goalText,
    totalPointsProgress,
    totalStudents,
    pendingApprovals,
    totalActivities,
    classification,

    // Helpers
    formatNumber,
    refresh: loadDashboardData
  };
}

