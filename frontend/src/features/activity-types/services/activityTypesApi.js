import http from '../../../shared/api/http';

export const activityTypesApi = {
  async list() {
    const res = await http.get('/core/activity-types').catch(()=>({ data:{ data:{ items:[] }}}));
    const data = res.data?.data?.items || res.data?.data || [];
    return Array.isArray(data) ? data : [];
  },
  async create(payload) {
    return http.post('/core/activity-types', payload);
  },
  async update(id, payload) {
    return http.put(`/core/activity-types/${id}`, payload);
  },
  async remove(id) {
    return http.delete(`/core/activity-types/${id}`);
  }
};
