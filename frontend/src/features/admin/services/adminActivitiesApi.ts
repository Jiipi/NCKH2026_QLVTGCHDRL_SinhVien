import http from '../../../shared/api/http';
import { emitActivitiesChange } from '../../../shared/lib/dataRefresh';
import { AxiosResponse } from 'axios';

interface ListActivitiesParams {
  page?: number;
  limit?: number | string;
  search?: string;
  status?: string;
  typeId?: string;
  type?: string;
  semesterValue?: string;
  from?: string;
  to?: string;
  lop_id?: string;
}

interface ActivityTypesResponse {
  activityTypes?: unknown[];
  items?: unknown[];
  [key: string]: unknown;
}

const adminActivitiesApi = {
  async listActivities(params: ListActivitiesParams): Promise<AxiosResponse> {
    // Sử dụng API endpoint mới /core/activities (thay vì /admin/activities đã deprecated)
    const res = await http.get('/core/activities', { params });
    return res;
  },

  async getActivityTypes(): Promise<ActivityTypesResponse> {
    // Sử dụng API endpoint mới /core/activity-types
    const res = await http.get('/core/activity-types');
    return res?.data?.data || res?.data || {};
  },

  async listCoreClasses() {
    const res = await http.get('/core/classes');
    const payload = res.data?.data;
    return Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : Array.isArray(res.data)
            ? res.data
            : [];
  },

  async deleteActivity(id: string): Promise<AxiosResponse> {
    const res = await http.delete(`/core/activities/${id}`);
    emitActivitiesChange({ action: 'delete', id });
    return res;
  },

  async approveActivity(id: string): Promise<AxiosResponse> {
    const res = await http.post(`/core/activities/${id}/approve`);
    emitActivitiesChange({ action: 'approve', id });
    return res;
  },

  async rejectActivity(id: string, reason?: string): Promise<AxiosResponse> {
    const res = await http.post(`/core/activities/${id}/reject`, { reason });
    emitActivitiesChange({ action: 'reject', id });
    return res;
  },
};

export default adminActivitiesApi;
