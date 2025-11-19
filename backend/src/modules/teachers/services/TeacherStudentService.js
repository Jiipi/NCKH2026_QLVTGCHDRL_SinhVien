/**
 * Teacher Student Service
 * Handles student management operations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

const teachersRepo = require('../teachers.repo');
const { ForbiddenError, ValidationError } = require('../../../core/errors/AppError');

const getUserId = (user) => user?.sub || user?.id;

class TeacherStudentService {
  /**
   * Export students list
   */
  async exportStudents(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được export');
    }

    const userId = getUserId(user);
    return await teachersRepo.exportStudents(userId);
  }

  /**
   * Create a single student in teacher's class
   */
  async createStudent(user, payload) {
    if (user.role !== 'GIANG_VIEN' && user.role !== 'GIANG_VIÊN') {
      throw new ForbiddenError('Chỉ giảng viên mới được tạo sinh viên');
    }
    const userId = getUserId(user);
    return await teachersRepo.createStudent(userId, payload);
  }

  /**
   * Assign class monitor (teacher only)
   * @param {string} classId - Lop.id
   * @param {string} studentId - SinhVien.id
   * @param {Object} user - Auth user
   */
  async assignClassMonitor(classId, studentId, user) {
    if (user.role !== 'GIANG_VIÊN' && user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được gán lớp trưởng');
    }

    const teacherId = getUserId(user);
    if (!classId || !studentId) {
      throw new ValidationError('Thiếu classId hoặc sinh_vien_id');
    }

    const result = await teachersRepo.assignClassMonitor(String(teacherId), String(classId), String(studentId));
    return result;
  }
}

module.exports = TeacherStudentService;

