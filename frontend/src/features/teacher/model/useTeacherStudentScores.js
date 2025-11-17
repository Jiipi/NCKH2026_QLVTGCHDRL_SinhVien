import { useState, useEffect } from 'react';
import { teacherStudentScoresApi } from '../services/teacherStudentScoresApi';

export function useTeacherStudentScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    teacherStudentScoresApi.list().then(data => { if (mounted) setScores(data); })
      .catch(e => setError(e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { state: { scores, loading, error }, actions: { refresh: async () => {
    setLoading(true);
    try { const data = await teacherStudentScoresApi.list(); setScores(data); } catch (e) { setError(e); } finally { setLoading(false); }
  }} };
}
