import http from '../../../shared/api/http';

// Service: Phê duyệt hoạt động cho giáo viên
// Endpoints dựa trên trang legacy ModernActivityApproval

export async function getPending({ semester, search }) {
  const params = { page: 1, limit: 100 };
  if (semester) params.semester = semester;
  if (search) params.search = search;
  const res = await http.get('/teacher/activities/pending', { params });
  const data = res.data?.data || res.data || {};
  const items = data.items || data.data || data || [];
  return {
    items: Array.isArray(items) ? items : [],
    stats: data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
  };
}

export async function getHistory({ semester, search, status }) {
  const params = { page: 1, limit: 100 };
  if (semester) params.semester = semester;
  if (search) params.search = search;
  if (status && status !== 'all') params.status = status;
  const res = await http.get('/teacher/activities/history', { params });
  const data = res.data?.data || res.data || {};
  const items = data.items || data.data || data || [];
  return Array.isArray(items) ? items : [];
}

export async function approve(id) {
  await http.post(`/teacher/activities/${id}/approve`);
  return true;
}

export async function reject(id, reason) {
  await http.post(`/teacher/activities/${id}/reject`, { reason });
  return true;
}

export default { getPending, getHistory, approve, reject };
