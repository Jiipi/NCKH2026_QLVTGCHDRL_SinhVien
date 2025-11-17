import { useState, useEffect } from 'react';
import { monitorClassManagementApi } from '../services/monitorClassManagementApi';

export function useMonitorClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { let m=true; setLoading(true); monitorClassManagementApi.list().then(d=>m&&setClasses(d)).catch(e=>setError(e)).finally(()=>m&&setLoading(false)); return ()=>{m=false}; }, []);

  return { state:{ classes, loading, error }, actions:{ refresh: async () => { setLoading(true); try { const d = await monitorClassManagementApi.list(); setClasses(d); } catch(e){ setError(e); } finally { setLoading(false); } } } };
}
