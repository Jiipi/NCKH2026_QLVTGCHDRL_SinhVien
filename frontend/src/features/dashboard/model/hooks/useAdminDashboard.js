import { useState, useEffect, useCallback } from 'react';
import dashboardApi from '../../services/dashboardApi';
import { useAutoRefresh, useDataChangeListener } from '../../../../shared/lib/dataRefresh';

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

  // Listen for data changes from same tab
  useDataChangeListener(['ACTIVITIES', 'APPROVALS', 'REGISTRATIONS'], fetchData, { debounceMs: 500 });

  // Auto-refresh for cross-user sync (60s interval for dashboard)
  useAutoRefresh(fetchData, { 
    intervalMs: 60000, 
    enabled: true,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  return {
    stats,
    loading,
    error,
    refresh: fetchData
  };
}
