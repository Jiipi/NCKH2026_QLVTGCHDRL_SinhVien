import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

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

export interface DashboardStats {
  totalUsers: number;
  totalActivities: number;
  totalRegistrations: number;
  pendingApprovals: number;
  activeUsers: number;
  todayApprovals: number;
  newUsersThisMonth: number;
  // Extended stats for dashboard page
  activeActivities?: number;
  pendingActivities?: number;
  totalStudents?: number;
  pendingRegistrations?: number;
  completedThisWeek?: number;
}

export interface UseAdminDashboardReturn {
  stats: DashboardStats;
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export default function useAdminDashboard(): UseAdminDashboardReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalActivities: 0,
    totalRegistrations: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    todayApprovals: 0,
    newUsersThisMonth: 0,
    activeActivities: 0,
    pendingActivities: 0,
    totalStudents: 0,
    pendingRegistrations: 0,
    completedThisWeek: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getDashboard();
      setStats({
        totalUsers: Number(data.totalUsers) || 0,
        totalActivities: Number(data.totalActivities) || 0,
        totalRegistrations: Number(data.totalRegistrations) || 0,
        pendingApprovals: Number(data.pendingApprovals) || 0,
        activeUsers: Number(data.activeUsers) || 0,
        todayApprovals: Number(data.todayApprovals) || 0,
        newUsersThisMonth: Number(data.newUsersThisMonth) || 0,
        activeActivities: Number(data.activeActivities ?? data.pendingApprovals) || 0,
        pendingActivities: Number(data.pendingActivities ?? data.pendingApprovals) || 0,
        totalStudents: Number(data.totalStudents ?? data.totalUsers) || 0,
        pendingRegistrations: Number(data.pendingRegistrations ?? data.pendingApprovals) || 0,
        completedThisWeek: Number(data.completedThisWeek) || 0,
      });
      // Set activities if provided by API
      if (Array.isArray(data.recentActivities)) {
        setActivities(data.recentActivities);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError((err as Error)?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return { stats, activities, loading, error, refresh: fetchAdminData, lastUpdated };
}
