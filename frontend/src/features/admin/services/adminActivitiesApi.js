import http from '../../../shared/api/http';

const adminActivitiesApi = {
  async listActivities(params) {
    // Sử dụng API endpoint mới /core/activities (thay vì /admin/activities đã deprecated)
    const res = await http.get('/core/activities', { params });
    return res;
  },
  async getActivityTypes() {
    // Sử dụng API endpoint mới /core/activity-types
    const res = await http.get('/core/activity-types');
    return res?.data?.data || res?.data || {};
  },
  async deleteActivity(id) {
    return http.delete(`/core/activities/${id}`);
  },
  async approveActivity(id) {
    return http.post(`/core/activities/${id}/approve`);
  },
  async rejectActivity(id, reason) {
    return http.post(`/core/activities/${id}/reject`, { reason });
  },
};

export default adminActivitiesApi;
