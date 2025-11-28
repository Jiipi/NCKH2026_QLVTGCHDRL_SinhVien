/**
 * Student Dashboard Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho dashboard sinh viên
 * HOÀN TOÀN tách khỏi hook cũ useDashboardData
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { studentDashboardApi } from '../../services/studentDashboardApi';
import { studentActivitiesApi } from '../../services/studentActivitiesApi';
import { studentProfileApi } from '../../services/studentProfileApi';
import { mapDashboardToUI, groupActivitiesByStatus } from '../mappers/student.mappers';
import useSemesterData, { useGlobalSemesterSync, setGlobalSemester, getGlobalSemester } from '../../../../shared/hooks/useSemesterData';

/**
 * Hook quản lý dashboard của sinh viên
 */
export default function useStudentDashboard() {
  const { options: semesterOptions, currentSemester, loading: semesterLoading } = useSemesterData();
  
  // Semester state - sync với global storage
  const [semester, setSemesterState] = useState(() => {
    try {
      return getGlobalSemester() || null;
    } catch {
      return null;
    }
  });

  // Sync với global semester changes từ các form khác
  useGlobalSemesterSync(semester, setSemesterState);

  // Re-sync on mount (in case sessionStorage was updated while unmounted)
  useEffect(() => {
    const stored = getGlobalSemester();
    if (stored && stored !== semester) {
      setSemesterState(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter state
  const [recentFilter, setRecentFilter] = useState('all');

  // Data state
  const [dashboardData, setDashboardData] = useState(null);
  const [myActivitiesData, setMyActivitiesData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize semester
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

  // Business logic: Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!semester) {
      setDashboardData(null);
      setMyActivitiesData([]);
      setProfileData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [dashboardResult, activitiesResult, profileResult] = await Promise.all([
        studentDashboardApi.getDashboard(semester),
        studentActivitiesApi.getMyActivities(semester),
        studentProfileApi.getProfile()
      ]);

      // Set dashboard data
      if (dashboardResult.success) {
        // Debug: Log API response
        console.log('[useStudentDashboard] API Response:', {
          semester,
          rawData: dashboardResult.data,
          tong_quan: dashboardResult.data?.tong_quan,
          tong_diem: dashboardResult.data?.tong_quan?.tong_diem
        });
        
        setDashboardData(dashboardResult.data);
      } else {
        console.error('[useStudentDashboard] Dashboard error:', dashboardResult.error);
        setDashboardData(null);
      }

      // Set my activities data
      if (activitiesResult.success) {
        setMyActivitiesData(activitiesResult.data || []);
      } else {
        console.error('[useStudentDashboard] Activities error:', activitiesResult.error);
        setMyActivitiesData([]);
      }

      // Set profile data
      if (profileResult.success) {
        setProfileData(profileResult.data);
      } else {
        console.error('[useStudentDashboard] Profile error:', profileResult.error);
        setProfileData(null);
      }
    } catch (err) {
      console.error('[useStudentDashboard] Load error:', err);
      setError(err?.message || 'Không thể tải dữ liệu dashboard');
      setDashboardData(null);
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

  // Business logic: Transform dashboard data
  const dashboard = useMemo(() => {
    if (!dashboardData) {
      return {
        hoat_dong_sap_toi: [],
        tong_quan: { tong_diem: 0, tong_hoat_dong: 0, muc_tieu: 100 },
        so_sanh_lop: { my_rank_in_class: 1, total_students_in_class: 0 },
        sinh_vien: {}
      };
    }
    return mapDashboardToUI(dashboardData);
  }, [dashboardData]);

  // Business logic: Transform my activities
  const myActivities = useMemo(() => {
    if (!myActivitiesData || myActivitiesData.length === 0) {
      return { all: [], pending: [], approved: [], joined: [], rejected: [] };
    }
    return groupActivitiesByStatus(myActivitiesData);
  }, [myActivitiesData]);

  // Business logic: Extract upcoming activities
  const upcoming = useMemo(() => {
    return dashboard.hoat_dong_sap_toi || [];
  }, [dashboard]);

  // Business logic: Extract summary
  const summary = useMemo(() => {
    const tongQuan = dashboard.tong_quan || {};
    const soSanhLop = dashboard.so_sanh_lop || {};
    const totalPoints = Number(tongQuan.tong_diem || 0);
    
    // Debug: Log calculated summary
    console.log('[useStudentDashboard] Calculated Summary:', {
      tongQuan,
      totalPoints,
      semester
    });
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
      activitiesUpcoming: upcoming.length,
      classRank: soSanhLop.my_rank_in_class || 1,
      totalStudents: soSanhLop.total_students_in_class || 1,
      progress,
      targetPoints,
      goalText,
      goalPoints
    };
  }, [dashboard, upcoming]);

  // Business logic: Extract user profile
  const userProfile = useMemo(() => {
    if (!profileData) return null;
    
    const nguoiDung = profileData.nguoi_dung || profileData.user || profileData || {};
    return {
      ho_ten: nguoiDung.ho_ten || nguoiDung.name || '',
      name: nguoiDung.ho_ten || nguoiDung.name || '',
      email: nguoiDung.email || '',
      anh_dai_dien: nguoiDung.anh_dai_dien || nguoiDung.avatar || null,
      avatar: nguoiDung.anh_dai_dien || nguoiDung.avatar || null,
      mssv: profileData.sinh_vien?.mssv || profileData.mssv || '',
      vai_tro: nguoiDung.vai_tro || profileData.vai_tro || {}
    };
  }, [profileData]);

  // Business logic: Extract student info
  const studentInfo = useMemo(() => {
    if (!dashboardData) {
      return { mssv: '', ten_lop: '' };
    }
    
    const sinhVien = dashboardData.sinh_vien || {};
    return {
      mssv: sinhVien.mssv || userProfile?.mssv || '',
      ten_lop: sinhVien.lop?.ten_lop || sinhVien.ten_lop || ''
    };
  }, [dashboardData, userProfile]);

  // Business logic: Filter recent activities
  const recentActivities = useMemo(() => {
    let filtered = [];
    switch (recentFilter) {
      case 'pending':
        filtered = myActivities.pending || [];
        break;
      case 'approved':
        filtered = myActivities.approved || [];
        break;
      case 'joined':
        filtered = myActivities.joined || [];
        break;
      case 'rejected':
        filtered = myActivities.rejected || [];
        break;
      default:
        filtered = myActivities.all || [];
    }
    return filtered;
  }, [recentFilter, myActivities]);

  // Business logic: Get classification based on points
  const getClassification = useCallback((points) => {
    if (points >= 90) return { text: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (points >= 80) return { text: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (points >= 65) return { text: 'Khá', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (points >= 50) return { text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'Yếu', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  }, []);

  const classification = useMemo(() => getClassification(summary.totalPoints), [summary.totalPoints, getClassification]);

  // Business logic: Format number
  const formatNumber = useCallback((n) => {
    const num = Number(n || 0);
    return (Math.round(num * 10) / 10).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
  }, []);

  return {
    // State
    semester,
    setSemester: handleSetSemester,
    recentFilter,
    setRecentFilter,
    recentActivities,
    selectedActivityState: useState(null),
    showSummaryModalState: useState(false),
    
    // Data
    upcoming,
    myActivities,
    summary,
    userProfile,
    studentInfo,
    loading,
    error,
    
    // Business logic results
    classification,
    formatNumber,
    
    // Actions
    refresh: loadDashboardData
  };
}
