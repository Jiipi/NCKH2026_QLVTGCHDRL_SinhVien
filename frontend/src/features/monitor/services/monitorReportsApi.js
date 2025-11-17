import http from '../../../shared/api/http';
export const monitorReportsApi = {
  async list(){
    try {
      const r = await http.get('/core/monitor/reports');
      const payload = r.data?.data ?? r.data ?? [];
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
      return items;
    } catch(e){ return []; }
  }
};
