import http from '../../../shared/api/http';

export const teacherStudentScoresApi = {
  async list() {
    try {
      const res = await http.get('/api/teacher/student-scores');
      return res.data || [];
    } catch (e) {
      return [];
    }
  },
};
