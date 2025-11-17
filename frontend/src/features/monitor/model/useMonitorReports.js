import { useState, useEffect } from 'react';
import { monitorReportsApi } from '../services/monitorReportsApi';

export function useMonitorReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(()=>{ let m=true; setLoading(true); monitorReportsApi.list().then(d=>m&&setReports(d)).catch(e=>setError(e)).finally(()=>m&&setLoading(false)); return ()=>{m=false}; }, []);

  return { state:{ reports, loading, error }, actions:{ refresh: async () => { setLoading(true); try { const d = await monitorReportsApi.list(); setReports(d); } catch(e){ setError(e); } finally { setLoading(false); } } } };
}
