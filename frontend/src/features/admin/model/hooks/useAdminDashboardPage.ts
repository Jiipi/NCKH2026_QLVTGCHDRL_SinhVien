/**
 * Admin Dashboard Page Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho trang dashboard admin
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';
import { semesterApi, classApi } from '../../../../shared/api';
import http from '../../../../shared/api/http';
import { API_ENDPOINTS } from '../../../../shared/api/endpoints';

interface Activity {
  id: string;
  ten_hd?: string;
  ngay_bd?: string;
  ngay_kt?: string;
  trang_thai?: string;
  diem_rl?: number;
  loai_hd?: { id: string; ten_loai_hd?: string };
  [key: string]: unknown;
}

interface PendingRegistration {
  id: string;
  sinh_vien?: {
    ho_ten?: string;
    mssv?: string;
  };
  hoat_dong?: {
    ten_hd?: string;
  };
  trang_thai?: string;
  ngay_dang_ky?: string;
  [key: string]: unknown;
}

interface StatsCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  link?: string;
  linkLabel?: string;
}

type TimeFilter = 'week' | 'month' | 'semester' | 'year' | 'all';
type ActiveSection = 'overview' | 'activities' | 'registrations' | 'stats';

interface ClassData {
  id: string;
  ten_lop: string;
  ma_lop: string;
  khoa?: string | { ten_khoa?: string };
}

interface SemesterData {
  id: string;
  ten_hk: string;
  nam_hoc?: string;
  trang_thai?: string;
}

interface TeacherData {
  id: string;
  ho_ten: string;
  email?: string;
  ma_gv?: string;
}

interface StudentData {
  id: string;
  ho_ten: string;
  mssv?: string;
}

/**
 * Hook quản lý logic cho trang Dashboard Admin
 */
export default function useAdminDashboardPage() {
  const {
    stats,
    activities: recentActivities,
    loading,
    error,
    refresh,
    lastUpdated
  } = useAdminDashboard();

  // UI State
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pending registrations
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Actual data states (not placeholder)
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [classStudents, setClassStudents] = useState<StudentData[]>([]);
  const [loadingClassDetail, setLoadingClassDetail] = useState(false);
  const [classDetailError, setClassDetailError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  const [showTeacherDetail, setShowTeacherDetail] = useState(false);
  const [loadingTeacherDetail, setLoadingTeacherDetail] = useState(false);
  const [teacherDetailError, setTeacherDetailError] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'classes' | 'teachers'>('classes');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ ho_ten?: string; avatar?: string } | null>(null);

  // Format stats for display cards
  const statsCards = useMemo<StatsCard[]>(() => {
    if (!stats) return [];

    return [
      {
        title: 'Tổng hoạt động',
        value: stats.totalActivities || 0,
        icon: 'Calendar',
        color: 'blue',
        link: '/admin/activities',
        linkLabel: 'Xem tất cả'
      },
      {
        title: 'Hoạt động đang mở',
        value: stats.activeActivities || 0,
        icon: 'Play',
        color: 'green',
        link: '/admin/activities?status=da_duyet',
        linkLabel: 'Xem chi tiết'
      },
      {
        title: 'Chờ duyệt',
        value: stats.pendingActivities || 0,
        icon: 'Clock',
        color: 'yellow',
        link: '/admin/activities?status=cho_duyet',
        linkLabel: 'Duyệt ngay'
      },
      {
        title: 'Tổng sinh viên',
        value: stats.totalStudents || 0,
        icon: 'Users',
        color: 'purple',
        link: '/admin/users?role=sinh_vien',
        linkLabel: 'Quản lý'
      },
      {
        title: 'Đăng ký mới',
        value: stats.pendingRegistrations || 0,
        icon: 'UserPlus',
        color: 'orange',
        link: '/admin/registrations?status=cho_duyet',
        linkLabel: 'Xử lý'
      },
      {
        title: 'Hoàn thành tuần này',
        value: stats.completedThisWeek || 0,
        icon: 'CheckCircle',
        color: 'teal',
        link: '/admin/activities?status=ket_thuc',
        linkLabel: 'Xem báo cáo'
      }
    ];
  }, [stats]);

  // Filter activities based on time
  const filteredActivities = useMemo<Activity[]>(() => {
    if (!recentActivities || !Array.isArray(recentActivities)) return [];

    const now = new Date();
    let filterDate = new Date();

    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'semester':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        return recentActivities;
    }

    return recentActivities.filter(activity => {
      const activityDate = new Date(activity.ngay_bd || activity.ngay_kt || 0);
      return activityDate >= filterDate;
    });
  }, [recentActivities, timeFilter]);

  // Search activities
  const searchedActivities = useMemo<Activity[]>(() => {
    if (!searchQuery.trim()) return filteredActivities;

    const query = searchQuery.toLowerCase();
    return filteredActivities.filter(activity =>
      (activity.ten_hd || '').toLowerCase().includes(query) ||
      (activity.loai_hd?.ten_loai_hd || '').toLowerCase().includes(query)
    );
  }, [filteredActivities, searchQuery]);

  // Quick stats summary
  const quickStats = useMemo(() => {
    return {
      pendingCount: stats?.pendingActivities || 0,
      activeCount: stats?.activeActivities || 0,
      urgentCount: pendingRegistrations.filter(r => r.trang_thai === 'cho_duyet').length,
      hasUrgent: (stats?.pendingActivities || 0) > 0 || pendingRegistrations.length > 0
    };
  }, [stats, pendingRegistrations]);

  // Refresh handler with loading state
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refresh]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refresh]);

  // Load pending registrations from API
  const loadPendingRegistrations = useCallback(async () => {
    setLoadingRegistrations(true);
    try {
      // Use admin registrations API with pending status
      const response = await http.get('/core/admin/registrations', { 
        params: { status: 'cho_duyet', limit: 50 } 
      });
      // API returns { success: true, data: { items: [...], total, page, limit, counts } }
      const rawData = response.data?.data?.items || response.data?.data || response.data?.items || response.data || [];
      // Ensure data is an array
      const registrationList = Array.isArray(rawData) ? rawData : [];
      setPendingRegistrations(registrationList);
    } catch (err) {
      console.error('Failed to load pending registrations:', err);
      setPendingRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  useEffect(() => {
    loadPendingRegistrations();
  }, [loadPendingRegistrations]);

  // Load classes from API
  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const data = await classApi.getClasses();
      // Ensure data is an array
      const classList = Array.isArray(data) ? data : (data as unknown as { data?: ClassData[] })?.data || [];
      setClasses(classList as ClassData[]);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  // Load semesters from API
  const loadSemesters = useCallback(async () => {
    setLoadingSemesters(true);
    try {
      const data = await semesterApi.getSemesters();
      // Ensure data is an array
      const semesterList = Array.isArray(data) ? data : (data as unknown as { data?: SemesterData[] })?.data || [];
      setSemesters(semesterList);
    } catch (err) {
      console.error('Failed to load semesters:', err);
      setSemesters([]);
    } finally {
      setLoadingSemesters(false);
    }
  }, []);

  // Load teachers from API
  const loadTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      // Add limit to get more teachers, sorted by name
      const response = await http.get(API_ENDPOINTS.users.list, { 
        params: { role: 'GIANG_VIEN', limit: 100 } 
      });
      // API returns { success: true, data: { users: [...], pagination: {...} } }
      const rawData = response.data?.data?.users || response.data?.data || response.data?.users || response.data || [];
      // Ensure data is an array and filter out test users
      let teacherList = Array.isArray(rawData) ? rawData : [];
      // Filter out test users (ten_dn contains 'test')
      teacherList = teacherList.filter((t: TeacherData) => 
        !(t.email?.includes('test') || (t as unknown as { ten_dn?: string }).ten_dn?.includes('test'))
      );
      // Sort by name alphabetically
      teacherList.sort((a: TeacherData, b: TeacherData) => 
        (a.ho_ten || '').localeCompare(b.ho_ten || '', 'vi')
      );
      setTeachers(teacherList);
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await http.get(API_ENDPOINTS.users.profile);
      const data = response.data?.data || response.data;
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  }, []);

  // Handle class detail
  const handleClassDetail = useCallback(async (classIdOrObject: string | { id: string }) => {
    // Ensure we have a string classId (handle both string and object)
    const classId = typeof classIdOrObject === 'string' ? classIdOrObject : classIdOrObject?.id;
    if (!classId) {
      console.error('handleClassDetail: Invalid classId', classIdOrObject);
      setClassDetailError('ID lớp không hợp lệ');
      return;
    }
    
    setLoadingClassDetail(true);
    setClassDetailError(null);
    try {
      const classData = classes.find(c => c.id === classId);
      if (classData) {
        setSelectedClass(classData);
      }
      const students = await classApi.getClassStudents(classId);
      setClassStudents((students || []) as StudentData[]);
      setShowClassDetail(true);
    } catch (err) {
      console.error('Failed to load class detail:', err);
      setClassDetailError('Không thể tải thông tin lớp');
    } finally {
      setLoadingClassDetail(false);
    }
  }, [classes]);

  const closeClassDetail = useCallback(() => {
    setShowClassDetail(false);
    setSelectedClass(null);
    setClassStudents([]);
    setClassDetailError(null);
  }, []);

  // Handle teacher detail
  const handleTeacherDetail = useCallback(async (teacherId: string) => {
    setLoadingTeacherDetail(true);
    setTeacherDetailError(null);
    try {
      const teacherData = teachers.find(t => t.id === teacherId);
      if (teacherData) {
        setSelectedTeacher(teacherData);
      }
      setShowTeacherDetail(true);
    } catch (err) {
      console.error('Failed to load teacher detail:', err);
      setTeacherDetailError('Không thể tải thông tin giảng viên');
    } finally {
      setLoadingTeacherDetail(false);
    }
  }, [teachers]);

  const closeTeacherDetail = useCallback(() => {
    setShowTeacherDetail(false);
    setSelectedTeacher(null);
    setTeacherDetailError(null);
  }, []);

  // Handle approve/reject registration
  const handleApproveRegistration = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    setProcessingId(id);
    let result = { success: true, message: 'Đã duyệt đăng ký' };
    try {
      // TODO: Integrate with actual API
      // await registrationApi.approve(id);
    } catch (err) {
      console.error('Failed to approve registration:', err);
      result = { success: false, message: 'Không thể duyệt đăng ký' };
    } finally {
      setProcessingId(null);
    }
    return result;
  }, []);

  const handleRejectRegistration = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    setProcessingId(id);
    let result = { success: true, message: 'Đã từ chối đăng ký' };
    try {
      // TODO: Integrate with actual API
      // await registrationApi.reject(id);
    } catch (err) {
      console.error('Failed to reject registration:', err);
      result = { success: false, message: 'Không thể từ chối đăng ký' };
    } finally {
      setProcessingId(null);
    }
    return result;
  }, []);

  // Load all data on mount
  useEffect(() => {
    loadClasses();
    loadSemesters();
    loadTeachers();
    loadUserProfile();
  }, [loadClasses, loadSemesters, loadTeachers, loadUserProfile]);

  // Navigation helpers
  const navigateToSection = useCallback((section: ActiveSection) => {
    setActiveSection(section);
  }, []);

  const getTimeFilterLabel = useCallback((filter: TimeFilter): string => {
    const labels: Record<TimeFilter, string> = {
      week: 'Tuần này',
      month: 'Tháng này',
      semester: 'Học kỳ này',
      year: 'Năm nay',
      all: 'Tất cả'
    };
    return labels[filter] || 'Tất cả';
  }, []);

  // Format last updated time
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  }, [lastUpdated]);

  // Activity status helpers
  const getStatusColor = useCallback((status: string | undefined): string => {
    const colors: Record<string, string> = {
      cho_duyet: 'yellow',
      da_duyet: 'green',
      tu_choi: 'red',
      da_huy: 'gray',
      ket_thuc: 'purple'
    };
    return colors[status || ''] || 'gray';
  }, []);

  const getStatusLabel = useCallback((status: string | undefined): string => {
    const labels: Record<string, string> = {
      cho_duyet: 'Chờ duyệt',
      da_duyet: 'Đã duyệt',
      tu_choi: 'Từ chối',
      da_huy: 'Đã hủy',
      ket_thuc: 'Kết thúc'
    };
    return labels[status || ''] || 'Không xác định';
  }, []);

  return {
    // Data
    stats,
    statsCards,
    recentActivities: searchedActivities,
    allActivities: filteredActivities,
    pendingRegistrations,
    quickStats,

    // Loading states
    loading,
    loadingRegistrations,
    isRefreshing,
    error,

    // UI State
    timeFilter,
    setTimeFilter,
    activeSection,
    setActiveSection,
    showNotifications,
    setShowNotifications,
    searchQuery,
    setSearchQuery,

    // Computed
    formattedLastUpdated,
    lastUpdated,

    // Actions
    handleRefresh,
    refresh,
    navigateToSection,
    loadPendingRegistrations,

    // Helpers
    getTimeFilterLabel,
    getStatusColor,
    getStatusLabel,

    // Admin Dashboard Page data - actual state values
    activeTab: activeSection,
    setActiveTab: setActiveSection as (value: string) => void,
    sidebarTab,
    setSidebarTab: setSidebarTab as unknown as (value: string) => void,
    classes,
    loadingClasses,
    selectedClass,
    showClassDetail,
    classStudents,
    loadingClassDetail,
    classDetailError,
    handleClassDetail,
    closeClassDetail,
    semesters,
    loadingSemesters,
    registrations: pendingRegistrations,
    processingId,
    pendingRegistrationsCount: pendingRegistrations.length,
    handleApproveRegistration,
    handleRejectRegistration,
    teachers,
    loadingTeachers,
    selectedTeacher,
    showTeacherDetail,
    loadingTeacherDetail,
    teacherDetailError,
    handleTeacherDetail,
    closeTeacherDetail,
    adminActionFeed: recentActivities?.slice(0, 10).map((a, idx) => ({
      id: a.id || String(idx),
      action: a.ten_hd || 'Hoạt động',
      timestamp: a.ngay_bd || new Date().toISOString()
    })) || [],
    userProfile
  };
}
