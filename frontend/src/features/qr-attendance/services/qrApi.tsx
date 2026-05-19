import http from '../../../shared/api/http';

export async function fetchAdminAttendance() {
  const res = await http.get('/core/admin/reports/attendance');
  const data = res?.data?.data || res?.data || {};
  return Array.isArray(data?.attendance) ? data.attendance : (Array.isArray(data) ? data : []);
}

export async function fetchAdminActivities() {
  const res = await http.get('/activities');
  const data = res?.data?.data || res?.data || {};
  return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
}

export async function fetchActivityQRData(activityId) {
  if (!activityId) throw new Error('activityId is required');
  const res = await http.get(`/activities/${activityId}/qr-data`);
  return res?.data?.data || res?.data || {};
}

export async function postAttendanceScan(activityId, token, sessionId, location) {
  if (!activityId || !token) throw new Error('activityId and token are required');
  const res = await http.post(`/activities/${activityId}/attendance/scan`, { token, sessionId, location });
  return res?.data?.data || res?.data || {};
}

export async function createAttendanceSession(activityId) {
  if (!activityId) throw new Error('activityId is required');
  const res = await http.post(`/activities/${activityId}/attendance/session`);
  return res?.data?.data || res?.data || {};
}

export async function getCurrentAttendanceSession(activityId) {
  if (!activityId) throw new Error('activityId is required');
  try {
    const res = await http.get(`/activities/${activityId}/attendance/session/current`);
    return res?.data?.data || res?.data || null;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export async function fetchDynamicQrToken(activityId, sessionId) {
  if (!activityId || !sessionId) throw new Error('activityId and sessionId are required');
  const res = await http.post(`/activities/${activityId}/attendance/session/${sessionId}/token`);
  return res?.data?.data || res?.data || {};
}

export async function closeAttendanceSession(activityId, sessionId) {
  if (!activityId || !sessionId) throw new Error('activityId and sessionId are required');
  const res = await http.post(`/activities/${activityId}/attendance/session/${sessionId}/close`);
  return res?.data?.data || res?.data || {};
}

export async function fetchActivities() {
  const res = await http.get('/activities');
  return res?.data?.data || res?.data || [];
}

export async function fetchActivityAttendance(activityId) {
  const res = await http.get(`/activities/${activityId}/attendance`);
  return res?.data?.data || res?.data || [];
}

export async function fetchActivityQRImage(activityId) {
  const res = await http.get(`/activities/${activityId}/qr`, { params: { image: 1 } });
  return res?.data?.data?.image || '';
}

export async function markActivityAttendance(activityId) {
  const res = await http.post(`/activities/${activityId}/attendance`);
  return res?.data?.data || res?.data || {};
}

export async function fetchCoreClasses() {
  const res = await http.get('/core/classes');
  const payload = res.data?.data;
  return Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : [];
}

export async function fetchAdminAttendanceReport(params = {}) {
  const res = await http.get('/core/admin/reports/attendance', { params });
  return res.data?.data || res.data || {};
}

export async function fetchActivity(activityId) {
  const res = await http.get(`/activities/${activityId}`);
  return res?.data?.data || res?.data || {};
}

export async function updateAdminAttendanceStatus(recordId, status) {
  // No legacy admin attendance update route on backend; rely on activity-scoped flows.
  const res = await http.patch(`/core/admin/reports/attendance/${recordId}`, { status });
  return res?.data?.data || res?.data || {};
}

export default {
  fetchAdminAttendance,
  fetchAdminActivities,
  fetchActivityQRData,
  postAttendanceScan,
  createAttendanceSession,
  getCurrentAttendanceSession,
  fetchDynamicQrToken,
  closeAttendanceSession,
  fetchActivities,
  fetchActivityAttendance,
  fetchActivityQRImage,
  markActivityAttendance,
  fetchCoreClasses,
  fetchAdminAttendanceReport,
  fetchActivity,
  updateAdminAttendanceStatus,
};
