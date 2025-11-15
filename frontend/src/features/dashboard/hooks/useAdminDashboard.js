import { useState, useEffect, useCallback } from 'react';
import dashboardApi from '../services/dashboardApi';

export function useAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    pendingApprovals: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await dashboardApi.getAdminDashboard();
    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    loading,
    error,
    refresh: fetchData
  };
}
