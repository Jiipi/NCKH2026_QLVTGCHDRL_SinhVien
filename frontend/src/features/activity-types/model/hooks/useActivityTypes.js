import React from 'react';
import { activityTypesApi } from '../../services';
import { useDataChangeListener, useAutoRefresh, emitActivityTypesChange } from '../../../../shared/lib/dataRefresh';

export function useActivityTypes() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    try {
      setLoading(true); setError('');
      const list = await activityTypesApi.list();
      setItems(list);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Không thể tải loại hoạt động');
    } finally { setLoading(false); }
  }, []);

  const create = async (data) => { 
    await activityTypesApi.create(data); 
    await load(); 
    emitActivityTypesChange({ action: 'create' });
  };
  const update = async (id, data) => { 
    await activityTypesApi.update(id, data); 
    await load(); 
    emitActivityTypesChange({ action: 'update', id });
  };
  const remove = async (id) => { 
    await activityTypesApi.remove(id); 
    await load(); 
    emitActivityTypesChange({ action: 'delete', id });
  };

  React.useEffect(() => { load(); }, [load]);

  // Auto-reload when activity types data changes from other components (same tab)
  useDataChangeListener(['ACTIVITY_TYPES'], load, { debounceMs: 500 });

  // Auto-refresh for cross-user sync
  useAutoRefresh(load, { 
    intervalMs: 60000, // Activity types change rarely, poll every 60s
    enabled: true,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  return { items, loading, error, load, create, update, remove };
}
