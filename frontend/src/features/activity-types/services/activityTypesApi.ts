import http from '../../../shared/api/http';
import type { ActivityTypeItem, ActivityTypePayload } from '../model/hooks/useActivityTypes';

export interface ActivityTypesApiResponse {
  data?: {
    items?: ActivityTypeItem[];
  } | ActivityTypeItem[];
}

export const activityTypesApi = {
  async list(): Promise<ActivityTypeItem[]> {
    const res = await http.get<ActivityTypesApiResponse>('/core/activity-types').catch(() => ({
      data: { data: { items: [] } }
    }));
    const data = (res.data as { data?: { items?: ActivityTypeItem[] } })?.data?.items 
      || (res.data as { data?: ActivityTypeItem[] })?.data 
      || [];
    return Array.isArray(data) ? data : [];
  },

  async create(payload: ActivityTypePayload): Promise<void> {
    await http.post('/core/activity-types', payload);
  },

  async update(id: string, payload: ActivityTypePayload): Promise<void> {
    await http.put(`/core/activity-types/${id}`, payload);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/core/activity-types/${id}`);
  }
};
