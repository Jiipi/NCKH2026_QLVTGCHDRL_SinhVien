import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

export default function useAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalRegistrations: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    todayApprovals: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getDashboard();
      setStats({
        totalUsers: data.totalUsers || 0,
        totalActivities: data.totalActivities || 0,
        totalRegistrations: data.totalRegistrations || 0,
        pendingApprovals: data.pendingApprovals || 0,
        activeUsers: data.activeUsers || 0,
        todayApprovals: data.todayApprovals || 0,
        newUsersThisMonth: data.newUsersThisMonth || 0,
      });
    } catch (err) {
      setError(err?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return { stats, loading, error, refresh: fetchAdminData };
}
