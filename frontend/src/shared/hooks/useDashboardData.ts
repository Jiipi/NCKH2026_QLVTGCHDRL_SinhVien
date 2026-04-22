import { useState, useEffect, useCallback, useRef } from 'react';
import http from '../api/http';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Interface for dashboard data parameters
 */
export interface DashboardDataParams {
  semester?: string;
  role?: string;
}

/**
 * Interface for class summary statistics
 */
export interface ClassSummary {
  totalStudents?: number;
  totalActivitiesCount?: number;
  approvedCount?: number;
  [key: string]: unknown;
}

/**
 * Hook: Lấy "Hoạt động sắp diễn ra"
 * Sử dụng backend endpoint để đảm bảo logic đồng nhất
 * 
 * Backend logic:
 * - Chỉ lấy hoạt động LỚP (created by students/GVCN in same class)
 * - Đã duyệt (da_duyet)
 * - Chưa bắt đầu (ngay_bd >= now)
 * - Thuộc học kỳ hiện tại
 * 
 * @param {Object} options
 * @param {string} options.semester - Học kỳ cần lọc
 * @param {boolean} options.autoFetch - Tự động fetch khi mount
 * @returns {Object} { upcoming, loading, error, refresh }
 */
export const useUpcomingActivities = ({ semester, autoFetch = true }: { semester?: string; autoFetch?: boolean } = {}) => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUpcoming = useCallback(async () => {
    if (!semester) {
      setUpcoming([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useUpcomingActivities] Fetching for semester:', semester);

      // ✅ Sử dụng CORE endpoint - dashboard module
      // Backend sẽ tự động filter theo lớp của user
      const response = await http.get(API_ENDPOINTS.dashboard.student, {
        params: { semesterValue: semester }
      });

      const data = response.data?.data || response.data || {};
      const upcomingData = data.hoat_dong_sap_toi || [];

      console.log('[useUpcomingActivities] Fetched:', upcomingData.length, 'activities');

      setUpcoming(upcomingData);
    } catch (err) {
      console.error('[useUpcomingActivities] Error:', err);
      setError(err.message || 'Không thể tải hoạt động sắp diễn ra');
      setUpcoming([]);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    if (autoFetch && semester) {
      fetchUpcoming();
    }
  }, [semester, autoFetch, fetchUpcoming]);

  return {
    upcoming,
    loading,
    error,
    refresh: fetchUpcoming
  };
};

/**
 * Hook: Lấy "Hoạt động của tôi" (Personal registrations)
 * Sử dụng cho cả Student và Monitor
 * 
 * @param {Object} options
 * @param {string} options.semester - Học kỳ cần lọc
 * @param {boolean} options.autoFetch - Tự động fetch khi mount
 * @returns {Object}
 */
export const useMyActivities = ({ semester, autoFetch = true }: { semester?: string; autoFetch?: boolean } = {}) => {
  const [myActivities, setMyActivities] = useState({
    all: [],
    pending: [],
    approved: [],
    joined: [],
    rejected: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyActivities = useCallback(async () => {
    if (!semester) {
      setMyActivities({ all: [], pending: [], approved: [], joined: [], rejected: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useMyActivities] Fetching for semester:', semester);

      const response = await http.get(API_ENDPOINTS.dashboard.activitiesMe, {
        params: { semesterValue: semester }
      });

      // Normalize response structure
      const data = (response.data?.success && Array.isArray(response.data.data))
        ? response.data.data
        : (Array.isArray(response.data?.data))
          ? response.data.data
          : (Array.isArray(response.data))
            ? response.data
            : [];

      console.log('[useMyActivities] Fetched:', data.length, 'activities');

      // Filter by status
      const pending = data.filter(x => {
        const status = (x.trang_thai_dk || x.status || '').toLowerCase();
        return status === 'cho_duyet' || status === 'pending';
      });

      const approved = data.filter(x => {
        const status = (x.trang_thai_dk || x.status || '').toLowerCase();
        return status === 'da_duyet' || status === 'approved';
      });

      const joined = data.filter(x => {
        const status = (x.trang_thai_dk || x.status || '').toLowerCase();
        return status === 'da_tham_gia' || status === 'participated' || status === 'attended';
      });

      const rejected = data.filter(x => {
        const status = (x.trang_thai_dk || x.status || '').toLowerCase();
        return status === 'tu_choi' || status === 'rejected';
      });

      setMyActivities({
        all: data,
        pending,
        approved,
        joined,
        rejected
      });
    } catch (err) {
      console.error('[useMyActivities] Error:', err);
      setError(err.message || 'Không thể tải hoạt động của tôi');
      setMyActivities({ all: [], pending: [], approved: [], joined: [], rejected: [] });
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    if (autoFetch && semester) {
      fetchMyActivities();
    }
  }, [semester, autoFetch, fetchMyActivities]);

  return {
    myActivities,
    loading,
    error,
    refresh: fetchMyActivities
  };
};

/**
 * Hook: Lấy student summary (điểm, xếp hạng, etc)
 * Sử dụng cho cả Student và Monitor
 * 
 * @param {Object} options
 * @param {string} options.semester - Học kỳ cần lọc
 * @param {boolean} options.autoFetch - Tự động fetch khi mount
 * @returns {Object}
 */
export const useStudentSummary = ({ semester, autoFetch = true }: { semester?: string; autoFetch?: boolean } = {}) => {
  const [summary, setSummary] = useState({
    totalPoints: 0,
    activitiesJoined: 0,
    activitiesUpcoming: 0,
    classRank: 1,
    totalStudents: 1,
    progress: 0,
    targetPoints: 100,
    goalText: '',
    goalPoints: 0
  });
  const [userProfile, setUserProfile] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ mssv: '', ten_lop: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateGoal = useCallback((points) => {
    const p = Number(points || 0);
    if (p < 50) return {
      goalPoints: Math.max(0, Math.ceil(50 - p)),
      goalText: `Cần ${Math.max(0, Math.ceil(50 - p))} điểm để đạt Trung bình`
    };
    if (p < 65) return {
      goalPoints: Math.max(0, Math.ceil(65 - p)),
      goalText: `Cần ${Math.max(0, Math.ceil(65 - p))} điểm để đạt Khá`
    };
    if (p < 80) return {
      goalPoints: Math.max(0, Math.ceil(80 - p)),
      goalText: `Cần ${Math.max(0, Math.ceil(80 - p))} điểm để đạt Tốt`
    };
    if (p < 90) return {
      goalPoints: Math.max(0, Math.ceil(90 - p)),
      goalText: `Cần ${Math.max(0, Math.ceil(90 - p))} điểm để đạt Xuất sắc`
    };
    return { goalPoints: 0, goalText: 'ĐÃ ĐẠT XUẤT SẮC' };
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!semester) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useStudentSummary] Fetching for semester:', semester);

      // Fetch cả dashboard và profile - SỬ DỤNG CORE ENDPOINT
      const [dashboardRes, profileRes] = await Promise.all([
        http.get(API_ENDPOINTS.dashboard.student, { params: { semesterValue: semester } }),
        http.get(API_ENDPOINTS.profile.get)
      ]);

      const apiData = dashboardRes.data?.data || dashboardRes.data || {};
      const profileData = profileRes.data?.data || profileRes.data || {};

      // Set user profile
      setUserProfile(profileData);

      // Set student info (MSSV, Lớp)
      if (apiData.sinh_vien) {
        setStudentInfo({
          mssv: apiData.sinh_vien.mssv || '',
          ten_lop: apiData.sinh_vien.lop?.ten_lop || ''
        });
      }

      // Extract tổng quan
      const tongQuan = apiData.tong_quan || {};
      const soSanhLop = apiData.so_sanh_lop || {};

      const totalPoints = Number(tongQuan.tong_diem || 0);
      const activitiesJoined = tongQuan.tong_hoat_dong || 0;
      const target = Number(tongQuan.muc_tieu || 100);
      const progress = Math.round(Math.min((totalPoints / target) * 100, 100) * 10) / 10;

      const goal = calculateGoal(totalPoints);

      const upcomingCount = (apiData.hoat_dong_sap_toi || []).length;

      setSummary({
        totalPoints: Math.round(totalPoints * 10) / 10,
        activitiesJoined,
        activitiesUpcoming: upcomingCount,
        classRank: soSanhLop.my_rank_in_class || 1,
        totalStudents: soSanhLop.total_students_in_class || 1,
        progress,
        targetPoints: target,
        goalText: goal.goalText,
        goalPoints: goal.goalPoints
      });

      console.log('[useStudentSummary] Summary:', {
        totalPoints,
        activitiesJoined,
        upcomingCount,
        classRank: soSanhLop.my_rank_in_class
      });
    } catch (err) {
      console.error('[useStudentSummary] Error:', err);
      setError(err.message || 'Không thể tải thông tin tổng quan');
    } finally {
      setLoading(false);
    }
  }, [semester, calculateGoal]);

  useEffect(() => {
    if (autoFetch && semester) {
      fetchSummary();
    }
  }, [semester, autoFetch, fetchSummary]);

  return {
    summary,
    userProfile,
    studentInfo,
    loading,
    error,
    refresh: fetchSummary
  };
};

/**
 * Hook: Lấy class statistics (chỉ dành cho Monitor)
 * Bao gồm: topStudents, class summary, pending registrations
 * 
 * @param {Object} options
 * @param {string} options.semester - Học kỳ cần lọc
 * @param {boolean} options.enabled - Chỉ fetch khi enabled=true
 * @returns {Object}
 */
export const useClassStats = ({ semester, enabled = true }: { semester?: string; enabled?: boolean } = {}) => {
  const [classStats, setClassStats] = useState<{
    topStudents: unknown[];
    classSummary: ClassSummary;
    approvals: { pending: number; total: number };
  }>({
    topStudents: [],
    classSummary: {},
    approvals: { pending: 0, total: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClassStats = useCallback(async () => {
    if (!semester || !enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useClassStats] Fetching for semester:', semester);

      // ✅ Sử dụng CORE endpoint
      const [classDashboardRes, registrationsRes] = await Promise.all([
        http.get(API_ENDPOINTS.dashboard.monitor, { params: { semester } }),
        http.get('/core/monitor/registrations', { params: { status: 'all', semester } })
          .catch(() => ({ data: { data: [] } }))
      ]);

      const classData = classDashboardRes?.data?.data || {};
      const regsData = registrationsRes?.data?.data || registrationsRes?.data || [];

      // Normalize class summary
      const classSummary = classData?.summary || classData?.tong_quan_lop || {};

      // Normalize top students
      const topStudents = classData?.topStudents || classData?.top_sinh_vien || [];

      // Count approvals
      const registrations = Array.isArray(regsData?.items)
        ? regsData.items
        : (Array.isArray(regsData) ? regsData : []);

      const pendingCount = registrations.filter(r => r.trang_thai_dk === 'cho_duyet').length;

      setClassStats({
        topStudents,
        classSummary,
        approvals: {
          pending: pendingCount,
          total: registrations.length
        }
      });

      console.log('[useClassStats] Loaded:', {
        topStudents: topStudents.length,
        pendingApprovals: pendingCount,
        totalRegistrations: registrations.length
      });
    } catch (err) {
      console.error('[useClassStats] Error:', err);
      setError(err.message || 'Không thể tải thông tin lớp');
      setClassStats({
        topStudents: [],
        classSummary: {},
        approvals: { pending: 0, total: 0 }
      });
    } finally {
      setLoading(false);
    }
  }, [semester, enabled]);

  useEffect(() => {
    if (enabled && semester) {
      fetchClassStats();
    }
  }, [semester, enabled, fetchClassStats]);

  return {
    ...classStats,
    loading,
    error,
    refresh: fetchClassStats
  };
};

/**
 * Hook tổng hợp: Lấy toàn bộ dashboard data
 * Sử dụng khi cần tất cả data cùng lúc
 * 
 * ✅ FIXED: Trước đây gọi /core/dashboard/student 2 lần (1 lần từ useUpcomingActivities,
 * 1 lần từ useStudentSummary). Giờ gọi 1 lần duy nhất và share data.
 */
export const useDashboardData = ({ semester, role = 'student' }: DashboardDataParams = {}) => {
  // ── Shared state for student dashboard (called ONCE) ──
  const [sharedDashboardData, setSharedDashboardData] = useState<Record<string, unknown> | null>(null);
  const [sharedProfileData, setSharedProfileData] = useState<Record<string, unknown> | null>(null);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState<string | null>(null);

  // ── Derived state: upcoming activities ──
  const [upcoming, setUpcoming] = useState([]);

  // ── Derived state: my activities ──
  const myActivitiesHook = useMyActivities({ semester });

  // ── Derived state: summary ──
  const [summary, setSummary] = useState({
    totalPoints: 0, activitiesJoined: 0, activitiesUpcoming: 0,
    classRank: 1, totalStudents: 1, progress: 0,
    targetPoints: 100, goalText: '', goalPoints: 0
  });
  const [userProfile, setUserProfile] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ mssv: '', ten_lop: '' });

  const calculateGoal = useCallback((points) => {
    const p = Number(points || 0);
    if (p < 50) return { goalPoints: Math.max(0, Math.ceil(50 - p)), goalText: `Cần ${Math.max(0, Math.ceil(50 - p))} điểm để đạt Trung bình` };
    if (p < 65) return { goalPoints: Math.max(0, Math.ceil(65 - p)), goalText: `Cần ${Math.max(0, Math.ceil(65 - p))} điểm để đạt Khá` };
    if (p < 80) return { goalPoints: Math.max(0, Math.ceil(80 - p)), goalText: `Cần ${Math.max(0, Math.ceil(80 - p))} điểm để đạt Tốt` };
    if (p < 90) return { goalPoints: Math.max(0, Math.ceil(90 - p)), goalText: `Cần ${Math.max(0, Math.ceil(90 - p))} điểm để đạt Xuất sắc` };
    return { goalPoints: 0, goalText: 'ĐÃ ĐẠT XUẤT SẮC' };
  }, []);

  // ── Single fetch for student dashboard + profile ──
  const fetchSharedData = useCallback(async () => {
    if (!semester) return;
    try {
      setSharedLoading(true);
      setSharedError(null);

      console.log('[useDashboardData] Fetching student dashboard + profile (SINGLE call)');

      const [dashboardRes, profileRes] = await Promise.all([
        http.get(API_ENDPOINTS.dashboard.student, { params: { semesterValue: semester } }),
        http.get(API_ENDPOINTS.profile.get)
      ]);

      const apiData = dashboardRes.data?.data || dashboardRes.data || {};
      const profileData = profileRes.data?.data || profileRes.data || {};

      setSharedDashboardData(apiData);
      setSharedProfileData(profileData);

      // ── Derive upcoming activities ──
      const upcomingData = (apiData as Record<string, unknown>).hoat_dong_sap_toi || [];
      setUpcoming(upcomingData as never[]);

      // ── Derive summary ──
      setUserProfile(profileData as never);
      if ((apiData as Record<string, unknown>).sinh_vien) {
        const sv = (apiData as Record<string, unknown>).sinh_vien as Record<string, unknown>;
        setStudentInfo({
          mssv: (sv.mssv as string) || '',
          ten_lop: ((sv.lop as Record<string, unknown>)?.ten_lop as string) || ''
        });
      }

      const tongQuan = (apiData as Record<string, unknown>).tong_quan as Record<string, unknown> || {};
      const soSanhLop = (apiData as Record<string, unknown>).so_sanh_lop as Record<string, unknown> || {};
      const totalPoints = Number(tongQuan.tong_diem || 0);
      const activitiesJoined = (tongQuan.tong_hoat_dong as number) || 0;
      const target = Number(tongQuan.muc_tieu || 100);
      const progress = Math.round(Math.min((totalPoints / target) * 100, 100) * 10) / 10;
      const goal = calculateGoal(totalPoints);
      const upcomingCount = ((apiData as Record<string, unknown>).hoat_dong_sap_toi as unknown[] || []).length;

      setSummary({
        totalPoints: Math.round(totalPoints * 10) / 10,
        activitiesJoined,
        activitiesUpcoming: upcomingCount,
        classRank: (soSanhLop.my_rank_in_class as number) || 1,
        totalStudents: (soSanhLop.total_students_in_class as number) || 1,
        progress,
        targetPoints: target,
        goalText: goal.goalText,
        goalPoints: goal.goalPoints
      });

      console.log('[useDashboardData] Loaded from single call:', { totalPoints, activitiesJoined, upcomingCount });
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Không thể tải dữ liệu dashboard';
      console.error('[useDashboardData] Error:', err);
      setSharedError(errorMsg);
    } finally {
      setSharedLoading(false);
    }
  }, [semester, calculateGoal]);

  useEffect(() => {
    if (semester) {
      fetchSharedData();
    }
  }, [semester, fetchSharedData]);

  // Chỉ fetch class stats nếu role = monitor
  const classStatsHook = useClassStats({
    semester,
    enabled: role === 'monitor' || role === 'class_monitor'
  });

  const loading = sharedLoading || myActivitiesHook.loading || classStatsHook.loading;
  const error = sharedError || myActivitiesHook.error || classStatsHook.error;

  const refresh = useCallback(() => {
    fetchSharedData();
    myActivitiesHook.refresh();
    if (role === 'monitor' || role === 'class_monitor') {
      classStatsHook.refresh();
    }
  }, [fetchSharedData, myActivitiesHook, classStatsHook, role]);

  return {
    // Upcoming activities
    upcoming,

    // My activities (personal registrations)
    myActivities: myActivitiesHook.myActivities,

    // Summary (points, rank, etc)
    summary,

    // User info
    userProfile,
    studentInfo,

    // Class stats (monitor only)
    topStudents: classStatsHook.topStudents,
    classSummary: classStatsHook.classSummary,
    approvals: classStatsHook.approvals,

    // States
    loading,
    error,

    // Actions
    refresh
  };
};

/**
 * Hook: Teacher Dashboard Data
 * Lấy stats, pending activities, notifications, classes cho GVCN
 * 
 * @param {Object} options
 * @param {string} options.semester - Học kỳ cần lọc
 * @returns {Object}
 */
export const useTeacherDashboard = ({ semester }: { semester?: string } = {}) => {
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingApprovals: 0,
    totalStudents: 0,
    avgClassScore: 0,
    participationRate: 0,
    approvedThisWeek: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeacherData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTeacherDashboard] Fetching for semester:', semester || 'current');

      const response = await http.get(API_ENDPOINTS.dashboard.teacher, {
        params: semester ? { semester } : {}
      });

      const dashboardData = response.data?.data || {};
      const summary = dashboardData.summary || {};

      // Backend returns: totalClasses, totalStudents, pendingRegistrations, upcomingActivities, classStats
      // Map to frontend stats structure
      setStats({
        totalActivities: summary.upcomingActivities || 0,
        pendingApprovals: summary.pendingRegistrations || 0,
        totalStudents: summary.totalStudents || 0,
        avgClassScore: summary.classStats?.[0]?.avgScore || 0,
        participationRate: summary.classStats?.[0]?.participationRate || 0,
        approvedThisWeek: 0 // Not provided by backend
      });

      // pendingActivities from backend - prefer pendingRegistrations if pendingActivities is empty
      const activities = dashboardData.pendingActivities?.length > 0
        ? dashboardData.pendingActivities
        : (dashboardData.pendingRegistrations || []);
      setRecentActivities(activities);
      setRecentNotifications(dashboardData.recentNotifications || []);
      setClasses(dashboardData.classes || []);

      // Also expose students data if available - normalize API shape
      if (dashboardData.students) {
        const normalizedStudents = dashboardData.students.map((s: Record<string, unknown>) => ({
          ...s,
          ho_ten: s.ho_ten || s.name || '',
          mssv: s.mssv || '',
          lop: s.lop || s.className || '',
        }));
        setStudents(normalizedStudents);
      }

      console.log('[useTeacherDashboard] Loaded:', {
        stats,
        activities: dashboardData.pendingActivities?.length,
        classes: dashboardData.classes?.length
      });
    } catch (err) {
      console.error('[useTeacherDashboard] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    fetchTeacherData();
  }, [semester, fetchTeacherData]);

  return {
    stats,
    recentActivities,
    recentNotifications,
    classes,
    students,
    loading,
    error,
    refresh: fetchTeacherData
  };
};

/**
 * Hook: Admin Dashboard Data
 * Lấy stats tổng quan hệ thống cho Admin
 * 
 * @returns {Object}
 */
export const useAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    pendingApprovals: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useAdminDashboard] Fetching system stats...');

      const response = await http.get(API_ENDPOINTS.dashboard.admin);
      const data = response.data?.data || {};

      setStats({
        totalUsers: data.totalUsers || 0,
        totalActivities: data.totalActivities || 0,
        pendingApprovals: data.pendingApprovals || 0,
        activeUsers: data.activeUsers || 0
      });

      console.log('[useAdminDashboard] Loaded:', stats);
    } catch (err) {
      console.error('[useAdminDashboard] Error:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return {
    stats,
    loading,
    error,
    refresh: fetchAdminData
  };
};

export default useDashboardData;
