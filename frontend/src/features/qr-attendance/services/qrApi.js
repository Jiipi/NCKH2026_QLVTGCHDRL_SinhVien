import http from '../../../shared/api/http';

export async function fetchAdminAttendance() {
  const res = await http.get('/admin/attendance');
  return res?.data?.data || res?.data || [];
}

export async function fetchAdminActivities() {
  const res = await http.get('/admin/activities');
  return res?.data?.data || res?.data || [];
}

export async function fetchActivityQRData(activityId) {
  if (!activityId) throw new Error('activityId is required');
  const res = await http.get(`/activities/${activityId}/qr-data`);
  return res?.data?.data || res?.data || {};
}

export async function postAttendanceScan(activityId, token) {
  if (!activityId || !token) throw new Error('activityId and token are required');
  const res = await http.post(`/activities/${activityId}/attendance/scan`, { token });
  return res?.data?.data || res?.data || {};
}

export default {
  fetchAdminAttendance,
  fetchAdminActivities,
  fetchActivityQRData,
  postAttendanceScan,
};
