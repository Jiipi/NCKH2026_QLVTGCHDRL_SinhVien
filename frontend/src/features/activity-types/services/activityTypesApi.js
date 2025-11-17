import http from '../../../shared/api/http';

export const activityTypesApi = {
  async list() {
    const res = await http.get('/teacher/activity-types').catch(()=>({ data:{ data:{ items:[] }}}));
    const data = res.data?.data?.items || res.data?.data || [];
    return Array.isArray(data) ? data : [];
  },
  async create(payload) {
    return http.post('/teacher/activity-types', payload);
  },
  async update(id, payload) {
    return http.put(`/teacher/activity-types/${id}`, payload);
  },
  async remove(id) {
    return http.delete(`/teacher/activity-types/${id}`);
  },
  async uploadImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await http.post('/teacher/activity-types/upload-image', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
    return res.data?.data || res.data;
  }
};
