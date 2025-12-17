import { useState, useCallback, useEffect } from 'react';
import { activityTypesApi } from '../../services';
import { useDataChangeListener, useAutoRefresh, emitActivityTypesChange } from '../../../../shared/lib/dataRefresh';

/**
 * Activity Type item returned from the API
 */
export interface ActivityTypeItem {
  id: string;
  ten_loai_hd: string;
  mo_ta?: string;
  diem_mac_dinh?: number;
  diem_toi_da?: number;
  mau_sac?: string;
  ngay_tao?: string;
}

/**
 * Payload for creating or updating an activity type
 */
export interface ActivityTypePayload {
  ten_loai_hd: string;
  mo_ta?: string;
  diem_mac_dinh?: number;
  diem_toi_da?: number;
  mau_sac?: string;
}

/**
 * Return type of useActivityTypes hook
 */
export interface UseActivityTypesReturn {
  items: ActivityTypeItem[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  create: (data: ActivityTypePayload) => Promise<void>;
  update: (id: string, data: ActivityTypePayload) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useActivityTypes(): UseActivityTypesReturn {
  const [items, setItems] = useState<ActivityTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const list = await activityTypesApi.list();
      setItems(list);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message || err?.message || 'Không thể tải loại hoạt động');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data: ActivityTypePayload): Promise<void> => {
    await activityTypesApi.create(data);
    await load();
    emitActivityTypesChange({ action: 'create' });
  };

  const update = async (id: string, data: ActivityTypePayload): Promise<void> => {
    await activityTypesApi.update(id, data);
    await load();
    emitActivityTypesChange({ action: 'update', id });
  };

  const remove = async (id: string): Promise<void> => {
    await activityTypesApi.remove(id);
    await load();
    emitActivityTypesChange({ action: 'delete', id });
  };

  useEffect(() => {
    load();
  }, [load]);

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
