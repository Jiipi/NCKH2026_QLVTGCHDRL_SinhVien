import http from '../../../shared/api/http';
import { emitActivitiesChange } from '../../../shared/lib/dataRefresh';

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
    const res = await http.delete(`/core/activities/${id}`);
    emitActivitiesChange({ action: 'delete', id });
    return res;
  },
  async approveActivity(id) {
    const res = await http.post(`/core/activities/${id}/approve`);
    emitActivitiesChange({ action: 'approve', id });
    return res;
  },
  async rejectActivity(id, reason) {
    const res = await http.post(`/core/activities/${id}/reject`, { reason });
    emitActivitiesChange({ action: 'reject', id });
    return res;
  },
};

export default adminActivitiesApi;
