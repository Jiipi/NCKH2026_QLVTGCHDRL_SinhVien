import http from '../../../shared/api/http';

interface DashboardData {
  totalUsers?: number;
  totalActivities?: number;
  totalRegistrations?: number;
  pendingApprovals?: number;
  activeUsers?: number;
  todayApprovals?: number;
  newUsersThisMonth?: number;
  [key: string]: unknown;
}

const adminApi = {
  async getDashboard(): Promise<DashboardData> {
    const res = await http.get('/core/dashboard/admin');
    return res?.data?.data || res?.data || {};
  },
};

export default adminApi;
