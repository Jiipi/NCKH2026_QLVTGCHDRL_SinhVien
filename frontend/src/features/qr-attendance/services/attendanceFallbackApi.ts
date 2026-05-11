import http from '../../../shared/api/http';

export interface AttendanceFallbackPayload {
  ly_do: string;
  minh_chung?: string[];
  location?: {
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
  } | null;
}

export async function createAttendanceFallbackRequest(activityId: string, payload: AttendanceFallbackPayload) {
  const res = await http.post(`/activities/${activityId}/attendance/fallback-requests`, payload);
  return res?.data?.data || res?.data || {};
}

export async function listMyAttendanceFallbackRequests() {
  const res = await http.get('/activities/attendance/fallback-requests/my');
  return res?.data?.data || res?.data || [];
}

export async function listActivityAttendanceFallbackRequests(activityId: string) {
  const res = await http.get(`/activities/${activityId}/attendance/fallback-requests`);
  return res?.data?.data || res?.data || [];
}

export async function approveAttendanceFallbackRequest(requestId: string, note?: string) {
  const res = await http.post(`/activities/attendance/fallback-requests/${requestId}/approve`, { ghi_chu_duyet: note });
  return res?.data?.data || res?.data || {};
}

export async function rejectAttendanceFallbackRequest(requestId: string, note: string) {
  const res = await http.post(`/activities/attendance/fallback-requests/${requestId}/reject`, { ghi_chu_duyet: note });
  return res?.data?.data || res?.data || {};
}

export async function cancelAttendanceFallbackRequest(requestId: string) {
  const res = await http.post(`/activities/attendance/fallback-requests/${requestId}/cancel`);
  return res?.data?.data || res?.data || {};
}
