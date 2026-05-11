import http from '../../../shared/api/http';

function unwrap(response: any) {
  return response?.data?.data || response?.data || {};
}

export async function getAdminAttendanceAudit(params = {}) {
  const response = await http.get('/core/admin/reports/attendance-audit', { params });
  return unwrap(response);
}

export async function getMonitorAttendanceAudit(params = {}) {
  const response = await http.get('/core/monitor/reports/attendance-audit', { params });
  return unwrap(response);
}

export default {
  getAdminAttendanceAudit,
  getMonitorAttendanceAudit
};
