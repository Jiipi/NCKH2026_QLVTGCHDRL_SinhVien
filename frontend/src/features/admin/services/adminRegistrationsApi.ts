import http from '../../../shared/api/http';
import { AxiosResponse } from 'axios';

interface ListRegistrationsParams {
  status?: string;
  activityId?: string;
  classId?: string;
  semester?: string;
  page?: number;
  limit?: number;
}

interface ListActivitiesParams {
  semester?: string;
}

interface ExportUrlParams {
  status?: string;
  classId?: string;
  semester?: string;
}

interface Class {
  id: string;
  ten_lop?: string;
  name?: string;
}

interface RegistrationsResponse {
  items?: unknown[];
  total?: number | string;
  counts?: {
    cho_duyet: number;
    da_duyet: number;
    tu_choi: number;
    da_tham_gia: number;
  };
  [key: string]: unknown;
}

const adminRegistrationsApi = {
  async listRegistrations(params: ListRegistrationsParams): Promise<RegistrationsResponse> {
    const res = await http.get('/admin/registrations', { params });
    return res?.data?.data || res?.data || {};
  },

  async listCoreRegistrations(params: ListRegistrationsParams): Promise<RegistrationsResponse> {
    const res = await http.get('/core/admin/registrations', { params });
    return res?.data?.data || res?.data || {};
  },

  async listActivities(params: ListActivitiesParams): Promise<AxiosResponse> {
    const res = await http.get('/admin/activities', { params });
    return res;
  },

  async listClasses(): Promise<Class[]> {
    const res = await http.get('/admin/classes');
    return Array.isArray(res?.data?.data) ? res.data.data : (res?.data || []);
  },

  async approve(registrationId: string): Promise<AxiosResponse> {
    return http.post(`/admin/registrations/${registrationId}/approve`);
  },

  async reject(registrationId: string, reason?: string): Promise<AxiosResponse> {
    return http.post(`/admin/registrations/${registrationId}/reject`, { reason });
  },

  async bulkApprove(ids: string[]): Promise<AxiosResponse> {
    return http.post('/admin/registrations/bulk', { ids, action: 'approve' });
  },

  getExportUrl({ status, classId, semester }: ExportUrlParams): string {
    const params = new URLSearchParams({
      status: status || '',
      classId: classId || '',
      semester: semester || '',
    });
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    return `${baseURL}/admin/registrations/export?${params.toString()}`;
  },
};

export default adminRegistrationsApi;
