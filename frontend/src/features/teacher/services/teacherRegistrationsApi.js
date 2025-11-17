import http from '../../../shared/api/http';

// API adapter cho quản lý phê duyệt đăng ký của giảng viên
// Chuẩn hóa dữ liệu để hook dùng thống nhất

export async function listRegistrations(params = {}) {
  const response = await http.get('/teacher/registrations/pending', { params });
  const payload = response?.data?.data || response?.data || {};
  const itemsRaw = payload.items || payload.data || payload || [];
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];
  const pagination = payload.pagination || {};
  const total = typeof pagination.total === 'number' ? pagination.total : (payload.total || items.length);
  const counts = payload.counts || { cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 };
  return { items, total, counts };
}

export async function approveRegistration(id) {
  return http.post(`/teacher/registrations/${id}/approve`);
}

export async function rejectRegistration(id, reason) {
  return http.post(`/teacher/registrations/${id}/reject`, { reason });
}

export async function fetchTeacherClasses() {
  try {
    const res = await http.get('/teacher/classes');
    const payload = res?.data?.data || res?.data || {};
    const list = Array.isArray(payload?.classes) ? payload.classes : (Array.isArray(payload) ? payload : []);
    return list;
  } catch (_) {
    return [];
  }
}
