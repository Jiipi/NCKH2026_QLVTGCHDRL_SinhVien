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

  async getCurrentSemester() {
    const res = await http.get('/semesters/current');
    return res?.data?.data || null;
  },

  async getSemesterClosureRequests() {
    const res = await http.get('/semesters/closure-requests');
    return res?.data?.data || [];
  },

  async markNotificationRead(notificationId: string) {
    const res = await http.patch(`/core/notifications/${notificationId}/read`);
    return res?.data?.data || res?.data || {};
  },
};

export default adminApi;
