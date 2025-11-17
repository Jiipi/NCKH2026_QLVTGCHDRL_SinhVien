import http from '../../../shared/api/http';

export const teacherAttendanceApi = {
  async list() {
    // Placeholder endpoint – adjust once backend route confirmed
    try {
      const res = await http.get('/api/teacher/attendance');
      return res.data || [];
    } catch (e) {
      return [];
    }
  },
};
