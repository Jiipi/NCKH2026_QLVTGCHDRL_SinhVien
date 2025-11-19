/**
 * Teacher Dashboard Service
 * Handles teacher dashboard data aggregation
 * Follows Single Responsibility Principle (SRP)
 */

const teachersRepo = require('../teachers.repo');
const registrationsService = require('../../registrations/registrations.service');
const { ForbiddenError } = require('../../../core/errors/AppError');

const getUserId = (user) => user?.sub || user?.id;

class TeacherDashboardService {
  /**
   * Get teacher dashboard data (V1 compatible)
   * @param {Object} user - User object with id and role
   * @param {string} semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   */
  async getDashboard(user, semester = null, classId = null) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Use user.sub (from JWT) or user.id (from middleware)
    const userId = getUserId(user);

    const [stats, classes, pendingActivities, pendingRegistrations, students] = await Promise.all([
      teachersRepo.getDashboardStats(userId, semester, classId),
      teachersRepo.getTeacherClasses(userId),
      teachersRepo.getPendingActivitiesList(userId, semester, 5, classId),
      registrationsService.list(user, { status: 'PENDING' }, { page: 1, limit: 5 }),
      teachersRepo.getTeacherStudents(userId, { classId, semester })
    ]);

    return {
      summary: stats,
      pendingActivities,
      pendingRegistrations: pendingRegistrations.data || [],
      classes: classes.map(c => ({
        id: c.id,
        ten_lop: c.ten_lop
      })),
      students: students.map(s => {
        const totalPoints = s.dang_ky_hd?.reduce((sum, dk) => {
          const points = parseFloat(dk.hoat_dong?.diem_rl || 0);
          return sum + points;
        }, 0) || 0;
        
        return {
          id: s.nguoi_dung?.id,
          ho_ten: s.nguoi_dung?.ho_ten,
          avatar: s.nguoi_dung?.anh_dai_dien,
          mssv: s.mssv,
          lop: s.lop?.ten_lop,
          diem_rl: totalPoints
        };
      })
    };
  }
}

module.exports = TeacherDashboardService;

