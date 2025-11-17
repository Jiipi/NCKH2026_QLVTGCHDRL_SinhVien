import http from '../../../shared/api/http';

const adminRegistrationsApi = {
  async listRegistrations(params) {
    const res = await http.get('/admin/registrations', { params });
    return res?.data?.data || res?.data || {};
  },
  async listActivities(params) {
    const res = await http.get('/admin/activities', { params });
    return res;
  },
  async listClasses() {
    const res = await http.get('/admin/classes');
    return Array.isArray(res?.data?.data) ? res.data.data : (res?.data || []);
  },
  async approve(registrationId) {
    return http.post(`/admin/registrations/${registrationId}/approve`);
  },
  async reject(registrationId, reason) {
    return http.post(`/admin/registrations/${registrationId}/reject`, { reason });
  },
  async bulkApprove(ids) {
    return http.post('/admin/registrations/bulk', { ids, action: 'approve' });
  },
  getExportUrl({ status, classId, semester }) {
    const params = new URLSearchParams({
      status: status || '',
      classId: classId || '',
      semester: semester || '',
    });
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    return `${baseURL}/admin/registrations/export?${params.toString()}`;
  },
};

export default adminRegistrationsApi;
