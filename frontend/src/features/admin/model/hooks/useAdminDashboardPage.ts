/**
 * Admin Dashboard Page Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho trang dashboard admin
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';

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

  // Pending registrations (mock for now, should integrate with actual API)
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

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

  // Load pending registrations (placeholder - should integrate with actual API)
  const loadPendingRegistrations = useCallback(async () => {
    setLoadingRegistrations(true);
    try {
      // TODO: Integrate with actual registrations API
      // const data = await adminRegistrationsApi.getPendingRegistrations();
      // setPendingRegistrations(data);
      setPendingRegistrations([]);
    } catch (err) {
      console.error('Failed to load pending registrations:', err);
    } finally {
      setLoadingRegistrations(false);
    }
  }, []);

  useEffect(() => {
    loadPendingRegistrations();
  }, [loadPendingRegistrations]);

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

    // Legacy compatibility - Placeholder values for AdminDashboardPage
    activeTab: activeSection,
    setActiveTab: setActiveSection as (value: string) => void,
    sidebarTab: 'classes' as const,
    setSidebarTab: (() => {}) as (value: string) => void,
    classes: [] as { id: string; ten_lop: string; ma_lop: string; khoa?: { ten_khoa?: string } }[],
    loadingClasses: false,
    selectedClass: null as { id: string; ten_lop: string; ma_lop: string } | null,
    showClassDetail: false,
    classStudents: [] as { id: string; ho_ten: string; mssv: string }[],
    loadingClassDetail: false,
    classDetailError: null as string | null,
    handleClassDetail: (() => {}) as (classId: string) => void,
    closeClassDetail: () => {},
    semesters: [] as { id: string; ten_hk: string }[],
    loadingSemesters: false,
    registrations: pendingRegistrations,
    processingId: null as string | null,
    pendingRegistrationsCount: pendingRegistrations.length,
    handleApproveRegistration: (async (_id: string) => ({ success: false, message: 'Not implemented' })) as (id: string) => Promise<{ success: boolean; message: string }>,
    handleRejectRegistration: (async (_id: string) => ({ success: false, message: 'Not implemented' })) as (id: string) => Promise<{ success: boolean; message: string }>,
    teachers: [] as { id: string; ho_ten: string; email?: string }[],
    loadingTeachers: false,
    selectedTeacher: null as { id: string; ho_ten: string } | null,
    showTeacherDetail: false,
    loadingTeacherDetail: false,
    teacherDetailError: null as string | null,
    handleTeacherDetail: (() => {}) as (teacherId: string) => void,
    closeTeacherDetail: () => {},
    adminActionFeed: [] as { id: string; action: string; timestamp: string }[],
    userProfile: null as { ho_ten?: string; avatar?: string } | null
  };
}
