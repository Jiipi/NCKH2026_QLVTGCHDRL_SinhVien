import { useState, useEffect } from 'react';
import { monitorActivityOversightApi } from '../services/monitorActivityOversightApi';

export function useMonitorActivityOversight() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { let m=true; setLoading(true); Promise.all([
    monitorActivityOversightApi.list(),
    monitorActivityOversightApi.metrics()
  ]).then(([acts, met]) => { if(m){ setActivities(acts); setMetrics(met);} }).catch(e=>setError(e)).finally(()=>m&&setLoading(false)); return ()=>{m=false}; }, []);

  return { state:{ activities, metrics, loading, error }, actions:{ refresh: async () => { setLoading(true); try { const acts = await monitorActivityOversightApi.list(); setActivities(acts); } catch(e){ setError(e); } finally { setLoading(false); } } } };
}
