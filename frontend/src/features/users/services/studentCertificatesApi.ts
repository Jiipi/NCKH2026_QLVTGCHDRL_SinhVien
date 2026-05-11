import http from '../../../shared/api/http';

export const studentCertificatesApi = {
  async getActivityTypes() {
    const response = await http.get('/activities/types/list');
    return response.data?.data || [];
  },

  async getMyActivities() {
    const response = await http.get('/core/dashboard/activities/me');
    return response.data?.data || [];
  }
};
