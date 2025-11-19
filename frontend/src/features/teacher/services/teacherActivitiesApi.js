import http from '../../../shared/api/http';

// Service cho hoạt động giáo viên
// Đảm bảo giữ đúng parity với trang legacy TeacherActivities

export async function listActivities({ page = 1, limit = 100, semester }) {
  const params = { page, limit };
  if (semester) params.semester = semester;
  const res = await http.get('/activities', { params });
  const root = res.data?.data || res.data || {};
  const items = root.items || root.data || root || [];
  const arr = Array.isArray(items) ? items : [];
  const pagination = root.pagination || {};
  return {
    items: arr,
    total: typeof pagination.total === 'number' ? pagination.total : arr.length
  };
}

export async function getActivity(id) {
  const res = await http.get(`/activities/${id}`);
  return res.data?.data || res.data || null;
}

export async function approveActivity(id) {
  await http.post(`/teacher/activities/${id}/approve`);
  return true;
}

export async function rejectActivity(id, reason) {
  await http.post(`/teacher/activities/${id}/reject`, { reason });
  return true;
}

export default {
  listActivities,
  getActivity,
  approveActivity,
  rejectActivity
};
