import http from '../../../shared/api/http';

// Service: Teacher Dashboard API
// Provides focused endpoints used by the teacher dashboard FSD module.
// Keeps parity with legacy ModernTeacherDashboard interactions.

export async function getDashboard(semester, classId) {
  const params = {};
  if (semester) params.semester = semester;
  if (classId) params.classId = classId;
  const res = await http.get('/teacher/dashboard', Object.keys(params).length ? { params } : undefined);
  return res.data?.data || {};
}

export async function approveActivity(activityId) {
  if (!activityId) throw new Error('activityId required');
  await http.post(`/teacher/activities/${activityId}/approve`);
  return true;
}

export async function rejectActivity(activityId, reason) {
  if (!activityId) throw new Error('activityId required');
  if (!reason) throw new Error('reason required');
  await http.post(`/teacher/activities/${activityId}/reject`, { reason });
  return true;
}

export default {
  getDashboard,
  approveActivity,
  rejectActivity
};
