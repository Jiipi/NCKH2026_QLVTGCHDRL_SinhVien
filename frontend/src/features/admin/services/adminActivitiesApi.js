import http from '../../../shared/api/http';

const adminActivitiesApi = {
  async listActivities(params) {
    const res = await http.get('/admin/activities', { params });
    return res;
  },
  async getActivityTypes() {
    const res = await http.get('/admin/activity-types');
    return res?.data?.data || res?.data || {};
  },
  async deleteActivity(id) {
    return http.delete(`/admin/activities/${id}`);
  },
  async approveActivity(id) {
    return http.post(`/admin/activities/${id}/approve`);
  },
  async rejectActivity(id, reason) {
    return http.post(`/admin/activities/${id}/reject`, { reason });
  },
};

export default adminActivitiesApi;
