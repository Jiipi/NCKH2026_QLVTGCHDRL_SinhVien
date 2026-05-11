/**
 * Classes API Service
 * Single Responsibility: Handle all classes-related API calls
 */

import http from '../../../shared/api/http';

const classesApi = {
  /**
   * Get list of classes for teacher
   */
  getTeacherClasses: async () => {
    const response = await http.get('/teacher/classes');
    return response.data?.data?.classes || [];
  },

  /**
   * Get students of a class
   */
  getClassStudents: async (classId, params = {}) => {
    const response = await http.get('/teacher/students', {
      params: { classFilter: classId, classId, ...params }
    });
    return response.data?.data || response.data || { students: [] };
  },

  /**
   * Get class statistics
   */
  getClassStatistics: async (classId) => {
    const response = await http.get(`/teacher/classes/${classId}/statistics`);
    return response.data?.data || {};
  },

  /**
   * Assign monitor (lớp trưởng) to a class
   */
  assignMonitor: async (classId, studentId) => {
    const response = await http.patch(`/teacher/classes/${classId}/monitor`, {
      sinh_vien_id: studentId
    });
    return response.data;
  },

  /**
   * Import students from previewed job
   */
  importStudents: async (_classId: string | null, jobId: string) => {
    const response = await http.post('/teacher/students/import', { jobId });
    return response.data;
  },

  previewImportStudents: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post('/teacher/students/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getImportJobs: async () => {
    const response = await http.get('/teacher/students/import/jobs');
    return response.data;
  },

  getImportJob: async (jobId: string) => {
    const response = await http.get(`/teacher/students/import/jobs/${jobId}`);
    return response.data;
  },

  deleteTeacherStudent: async (studentId) => {
    const response = await http.delete(`/teacher/students/${studentId}`);
    return response.data;
  },

  updateTeacherStudent: async (studentId, studentData) => {
    const response = await http.put(`/teacher/students/${studentId}`, studentData);
    return response.data;
  },

  createTeacherStudent: async (studentData) => {
    const response = await http.post('/teacher/students', studentData);
    return response.data;
  },

  exportTeacherStudents: async (params) => {
    const response = await http.get('/teacher/students/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  getStudentsByEndpoint: async (endpoint, params = {}) => {
    const response = await http.get(endpoint, { params });
    return response.data?.data || response.data || {};
  },

  /**
   * Get all students (admin)
   */
  getAllStudents: async (params = {}) => {
    const response = await http.get('/admin/students', { params });
    return response.data?.data || { students: [], total: 0 };
  },

  /**
   * Create student
   */
  createStudent: async (studentData) => {
    const response = await http.post('/admin/students', studentData);
    return response.data;
  },

  /**
   * Update student
   */
  updateStudent: async (studentId, studentData) => {
    const response = await http.put(`/admin/students/${studentId}`, studentData);
    return response.data;
  },

  /**
   * Delete student
   */
  deleteStudent: async (studentId) => {
    const response = await http.delete(`/admin/students/${studentId}`);
    return response.data;
  }
};

export default classesApi;
