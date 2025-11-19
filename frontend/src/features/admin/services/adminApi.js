import http from '../../../shared/api/http';

const adminApi = {
  async getDashboard() {
    const res = await http.get('/core/dashboard/admin');
    return res?.data?.data || res?.data || {};
  },
};

export default adminApi;
