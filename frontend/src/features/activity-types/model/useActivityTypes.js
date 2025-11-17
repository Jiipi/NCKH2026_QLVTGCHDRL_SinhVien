import React from 'react';
import { activityTypesApi } from '../services/activityTypesApi';

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

  const create = async (data) => { await activityTypesApi.create(data); await load(); };
  const update = async (id, data) => { await activityTypesApi.update(id, data); await load(); };
  const remove = async (id) => { await activityTypesApi.remove(id); await load(); };
  const uploadImage = async (file) => activityTypesApi.uploadImage(file);

  React.useEffect(() => { load(); }, [load]);

  return { items, loading, error, load, create, update, remove, uploadImage };
}
