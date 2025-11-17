import { useState, useEffect } from 'react';
import { monitorStudentManagementApi } from '../services/monitorStudentManagementApi';

export function useMonitorStudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { let m=true; setLoading(true); monitorStudentManagementApi.list().then(d=>m&&setStudents(d)).catch(e=>setError(e)).finally(()=>m&&setLoading(false)); return ()=>{m=false}; }, []);

  return { state:{ students, loading, error }, actions:{ refresh: async () => { setLoading(true); try { const d = await monitorStudentManagementApi.list(); setStudents(d); } catch(e){ setError(e); } finally { setLoading(false); } } } };
}
