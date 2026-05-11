/**
 * Teacher Student Scores API Service (Tier 3: Data/API Layer)
 * ===========================================================
 * Single Responsibility: HTTP calls for teacher student scores only
 * 
 * @module features/teacher/services/teacherStudentScoresApi
 */

import http from '../../../shared/api/http';
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
  extractApiData,
  extractArrayItems
} from './apiErrorHandler';
import { teacherStudentsApi } from './teacherStudentsApi';

const classifyScore = (score: number) => {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 65) return 'Khá';
  if (score >= 50) return 'Trung bình';
  return 'Yếu';
};

/**
 * Teacher Student Scores API
 */
export const teacherStudentScoresApi = {
  /**
   * Lấy danh sách điểm rèn luyện của sinh viên
   * @param {Object} [params] - Query params
   */
  async list(params = {}) {
    try {
      const response = await teacherStudentsApi.getStudents(params);
      const payload = response?.data ?? response ?? {};
      const rawItems = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload.students) ? payload.students : extractArrayItems(payload));
      const items = rawItems.map((student) => {
        const studentInfo = student.sinh_vien || student;
        const user = student.nguoi_dung || student.user || {};
        const score = Number(student.tong_diem ?? student.diem_rl ?? student.score ?? studentInfo.diem_rl ?? 0);
        const activities = student.hoat_dong || student.activities || [];

        return {
          id: student.id || studentInfo.id,
          sinh_vien: {
            id: studentInfo.id || student.id,
            mssv: studentInfo.mssv || student.mssv,
            ho_ten: user.ho_ten || student.ho_ten || student.name,
            lop: studentInfo.lop || student.lop || { ten_lop: student.className || student.ten_lop },
            ten_lop: student.className || student.ten_lop
          },
          tong_diem: score,
          tong_hoat_dong: Number(student.tong_hoat_dong ?? student.totalActivities ?? student.total_activities ?? activities.length ?? 0),
          xep_loai: student.xep_loai || classifyScore(score),
          hoat_dong: activities
        };
      });
      const pagination = (payload.pagination || {}) as Record<string, unknown>;

      return createSuccessResponse({
        items,
        total: typeof pagination.total === 'number' ? pagination.total : items.length,
        pagination
      });
    } catch (error) {
      return handleApiError(error, 'StudentScores.list');
    }
  },

  /**
   * Lấy chi tiết điểm rèn luyện của sinh viên
   * @param {string|number} studentId - ID sinh viên
   * @param {string} [semester] - Học kỳ
   */
  async getStudentScore(studentId, semester) {
    if (!studentId) {
      return createValidationError('studentId là bắt buộc');
    }
    
    try {
      const params = semester ? { semester } : {};
      const response = await http.get(`/teacher/students/${studentId}`, { params });
      return createSuccessResponse(extractApiData(response, null));
    } catch (error) {
      return handleApiError(error, 'StudentScores.getDetail');
    }
  }
};

/**
 * Export default
 */
export default teacherStudentScoresApi;
