import http from '../../../shared/api/http';
export const monitorStudentManagementApi = {
  async list(){
    try {
      const r = await http.get('/core/monitor/students');
      const payload = r.data?.data ?? r.data ?? [];
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
      return items;
    } catch(e){ return []; }
  }
};
