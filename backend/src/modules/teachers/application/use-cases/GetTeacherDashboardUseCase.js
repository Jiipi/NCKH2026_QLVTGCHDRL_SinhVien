const { ForbiddenError } = require('../../../../core/errors/AppError');
const registrationsService = require('../../../registrations/registrations.service');

/**
 * GetTeacherDashboardUseCase
 * Use case for getting teacher dashboard data
 * Follows Single Responsibility Principle (SRP)
 */
class GetTeacherDashboardUseCase {
  constructor(teacherRepository) {
    this.teacherRepository = teacherRepository;
  }

  async execute(user, semester = null, classId = null) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = user.sub || user.id;

    const [stats, classes, pendingActivities, pendingRegistrations, students] = await Promise.all([
      this.teacherRepository.getDashboardStats(userId, semester, classId),
      this.teacherRepository.getTeacherClasses(userId),
      this.teacherRepository.getPendingActivitiesList(userId, semester, 5, classId),
      registrationsService.list(user, { status: 'PENDING' }, { page: 1, limit: 5 }),
      this.teacherRepository.getTeacherStudents(userId, { classId, semester })
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

module.exports = GetTeacherDashboardUseCase;

