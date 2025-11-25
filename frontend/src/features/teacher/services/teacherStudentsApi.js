/**
 * Teacher Students API Service
 * ============================
 * Tier 3 - API Service Layer (SOLID: Single Responsibility)
 * 
 * Responsibilities:
 * - HTTP calls only (no business logic)
 * - Centralized API endpoints for teacher student management
 * - Clean separation from hooks and components
 * 
 * @module features/teacher/services/teacherStudentsApi
 */

import http from '../../../shared/api/http';

/**
 * API endpoints namespace
 */
const ENDPOINTS = {
  STUDENTS: '/teacher/students',
  CLASSES: '/teacher/classes',
  EXPORT: '/teacher/students/export',
};

/**
 * Student Management API Service
 */
const teacherStudentsApi = {
  /**
   * Get list of students with optional filters
   * @param {Object} params - Query parameters
   * @param {string} [params.search] - Search term
   * @param {string} [params.classFilter] - Class ID filter
   * @param {string} [params.classId] - Alternative class ID filter
   * @returns {Promise<Object>} Students data
   */
  getStudents: async (params = {}) => {
    const response = await http.get(ENDPOINTS.STUDENTS, { params });
    return response.data;
  },

  /**
   * Get student by ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Student data
   */
  getStudentById: async (studentId) => {
    const response = await http.get(`${ENDPOINTS.STUDENTS}/${studentId}`);
    return response.data;
  },

  /**
   * Add new student
   * @param {Object} studentData - Student information
   * @param {string} studentData.ho_ten - Full name
   * @param {string} studentData.email - Email
   * @param {string} studentData.mssv - Student ID
   * @param {string} studentData.ten_dn - Username
   * @param {string} studentData.mat_khau - Password
   * @param {string} studentData.lop_id - Class ID
   * @param {string} [studentData.ngay_sinh] - Birth date
   * @param {string} [studentData.gt] - Gender (nam/nu/khac)
   * @param {string} [studentData.dia_chi] - Address
   * @param {string} [studentData.sdt] - Phone number
   * @returns {Promise<Object>} Created student
   */
  addStudent: async (studentData) => {
    const response = await http.post(ENDPOINTS.STUDENTS, studentData);
    return response.data;
  },

  /**
   * Update student information
   * @param {string} studentId - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Updated student
   */
  updateStudent: async (studentId, studentData) => {
    const response = await http.put(`${ENDPOINTS.STUDENTS}/${studentId}`, studentData);
    return response.data;
  },

  /**
   * Delete student
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteStudent: async (studentId) => {
    const response = await http.delete(`${ENDPOINTS.STUDENTS}/${studentId}`);
    return response.data;
  },

  /**
   * Delete multiple students (bulk delete)
   * @param {string[]} studentIds - Array of student IDs
   * @returns {Promise<Object[]>} Array of deletion results
   */
  deleteStudents: async (studentIds) => {
    const results = await Promise.all(
      studentIds.map(id => http.delete(`${ENDPOINTS.STUDENTS}/${id}`))
    );
    return results.map(r => r.data);
  },

  /**
   * Export students to Excel/CSV
   * @param {Object} params - Export parameters
   * @param {string} [params.format='xlsx'] - Export format (xlsx/csv)
   * @param {string} [params.search] - Search filter
   * @param {string} [params.classFilter] - Class filter
   * @param {string} [params.classId] - Class ID filter
   * @returns {Promise<Blob>} File blob
   */
  exportStudents: async (params = {}) => {
    const { format = 'xlsx', search, classFilter, classId } = params;
    const queryParams = new URLSearchParams();
    queryParams.set('format', format);
    if (search) queryParams.set('search', search);
    if (classFilter) queryParams.set('classFilter', classFilter);
    if (classId) queryParams.set('classId', classId);

    const response = await http.get(`${ENDPOINTS.EXPORT}?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

/**
 * Class Management API Service
 */
const teacherClassesApi = {
  /**
   * Get list of classes assigned to teacher
   * @returns {Promise<Object>} Classes data
   */
  getClasses: async () => {
    const response = await http.get(ENDPOINTS.CLASSES);
    return response.data;
  },

  /**
   * Get class by ID
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Class data
   */
  getClassById: async (classId) => {
    const response = await http.get(`${ENDPOINTS.CLASSES}/${classId}`);
    return response.data;
  },

  /**
   * Get class statistics
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Statistics data
   */
  getClassStatistics: async (classId) => {
    const response = await http.get(`${ENDPOINTS.CLASSES}/${classId}/statistics`);
    return response.data;
  },

  /**
   * Assign class monitor (lớp trưởng)
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID to assign as monitor
   * @returns {Promise<Object>} Assignment result
   */
  assignMonitor: async (classId, studentId) => {
    const response = await http.patch(`${ENDPOINTS.CLASSES}/${classId}/monitor`, {
      sinh_vien_id: studentId
    });
    return response.data;
  },
};

export { teacherStudentsApi, teacherClassesApi };
export default teacherStudentsApi;
