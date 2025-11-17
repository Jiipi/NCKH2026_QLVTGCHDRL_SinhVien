import { useState, useEffect } from 'react';
import { teacherAttendanceApi } from '../services/teacherAttendanceApi';

export function useTeacherAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    teacherAttendanceApi.list().then(data => {
      if (mounted) setRecords(data);
    }).catch(e => setError(e)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { state: { records, loading, error }, actions: { refresh: async () => {
    setLoading(true);
    try { const data = await teacherAttendanceApi.list(); setRecords(data); } catch (e) { setError(e); } finally { setLoading(false); }
  }} };
}
