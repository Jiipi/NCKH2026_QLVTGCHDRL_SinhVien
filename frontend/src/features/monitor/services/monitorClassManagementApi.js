import http from '../../../shared/api/http';
export const monitorClassManagementApi = {
  async list(){ try { const r = await http.get('/api/monitor/classes'); return r.data||[]; } catch(e){ return []; } }
};
