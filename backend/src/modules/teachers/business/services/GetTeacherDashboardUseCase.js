const { ForbiddenError } = require('../../../../core/errors/AppError');
const ListRegistrationsDto = require('../../../registrations/business/dto/ListRegistrationsDto');

/**
 * GetTeacherDashboardUseCase
 * Use case for getting teacher dashboard data
 * Follows Single Responsibility Principle (SRP)
 */
class GetTeacherDashboardUseCase {
  constructor(teacherRepository, listRegistrationsUseCase) {
    this.teacherRepository = teacherRepository;
    this.listRegistrationsUseCase = listRegistrationsUseCase;
  }

  async execute(user, semester = null, classId = null) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = user.sub || user.id;

    // Create DTO for pending registrations
    // Dashboard cần hiển thị nhiều hơn 5 đăng ký để người dùng có cái nhìn tổng quan tốt hơn
    const registrationsDto = new ListRegistrationsDto({
      status: 'cho_duyet',
      page: 1,
      limit: null,
      semester
    });

    const [stats, classes, pendingRegistrationsResult, students] = await Promise.all([
      this.teacherRepository.getDashboardStats(userId, semester, classId),
      this.teacherRepository.getTeacherClasses(userId),
      this.listRegistrationsUseCase.execute(registrationsDto, user),
      this.teacherRepository.getTeacherStudents(userId, { classId, semester })
    ]);

    const pendingRegistrations = pendingRegistrationsResult?.data || [];
    const pendingActivities = pendingRegistrations
      .map(registration => {
        if (!registration?.hoat_dong) {
          return null;
        }
        return {
          ...registration.hoat_dong,
          registrationId: registration.id,
          registration
        };
      })
      .filter(Boolean);

    return {
      summary: stats,
      pendingActivities,
      pendingRegistrations,
      classes: classes.map(c => ({
        id: c.id,
        ten_lop: c.ten_lop
      })),
      students: students.map(s => {
        /**
         * Tính điểm cho hoạt động
         * Ưu tiên diem_rl của hoạt động, nếu null/undefined hoặc = 0 thì dùng diem_mac_dinh của loại hoạt động
         */
        const calculateActivityPoints = (activity) => {
          if (!activity) return 0;
          
          // Xử lý diem_rl (có thể là Decimal, Number, hoặc String)
          let diemRl = null;
          if (activity.diem_rl != null && activity.diem_rl !== undefined) {
            diemRl = typeof activity.diem_rl === 'object' && activity.diem_rl.toNumber 
              ? activity.diem_rl.toNumber() 
              : parseFloat(activity.diem_rl);
            
            // Nếu parseFloat trả về NaN, coi như null
            if (isNaN(diemRl)) {
              diemRl = null;
            }
          }
          
          // Nếu hoạt động có điểm được set và > 0, dùng điểm đó
          if (diemRl != null && diemRl > 0) {
            return diemRl;
          }
          
          // Nếu không có điểm hoặc = 0, dùng điểm mặc định của loại hoạt động
          if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
            const diemMacDinh = typeof activity.loai_hd.diem_mac_dinh === 'object' && activity.loai_hd.diem_mac_dinh.toNumber
              ? activity.loai_hd.diem_mac_dinh.toNumber()
              : parseFloat(activity.loai_hd.diem_mac_dinh);
            
            // Nếu parseFloat trả về NaN, trả về 0
            return isNaN(diemMacDinh) ? 0 : diemMacDinh;
          }
          
          return 0;
        };

        const totalPoints = s.dang_ky_hd?.reduce((sum, dk) => {
          const points = calculateActivityPoints(dk.hoat_dong);
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

