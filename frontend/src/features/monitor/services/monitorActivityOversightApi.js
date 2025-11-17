import http from '../../../shared/api/http';
export const monitorActivityOversightApi = {
  async list(){
    try {
      const r = await http.get('/core/monitor/activities');
      const payload = r.data?.data ?? r.data ?? [];
      const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
      return items;
    } catch(e){ return []; }
  },
  async metrics(){
    try {
      const r = await http.get('/core/monitor/activities/metrics');
      return r.data?.data ?? r.data ?? null;
    } catch(e){ return null; }
  }
};
