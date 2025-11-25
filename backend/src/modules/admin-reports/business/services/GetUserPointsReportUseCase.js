const { logInfo } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

class GetUserPointsReportUseCase {
  constructor(adminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  _classifyPoints(points) {
    if (points >= 80) return 'Xuất sắc';
    if (points >= 60) return 'Khá';
    if (points >= 40) return 'Trung bình';
    return 'Yếu';
  }

  async execute(userId, query = {}) {
    const { semester } = query;

    // Fetch user with student and class info
    const user = await this.repository.findUserWithStudent(userId);

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    // If not a student, return empty report
    if (!user.sinh_vien) {
      return {
        summary: {
          totalPoints: 0,
          currentSemester: 'N/A',
          activities: 0,
          avgPoints: 0,
          rank: 'Không có dữ liệu'
        },
        details: [],
        attendance: []
      };
    }

    // Fetch approved/participated activity registrations
    const registrations = await this.repository.findRegistrationsByStudent(user.sinh_vien.id);

    // Fetch attendance records
    const attendance = await this.repository.findAttendanceByStudent(user.sinh_vien.id);

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

    // Calculate total points and activity details
    let totalPoints = 0;
    const activityDetails = [];

    registrations.forEach(reg => {
      if (reg.hoat_dong) {
        const points = calculateActivityPoints(reg.hoat_dong);
        if (points > 0) {
          totalPoints += points;
          activityDetails.push({
            id: reg.id,
            name: reg.hoat_dong.ten_hd,
            type: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Không xác định',
            points: points,
            date: reg.ngay_dang_ky,
            status: 'completed',
            semester: reg.hoat_dong.hoc_ky || 'hoc_ky_1'
          });
        }
      }
    });

    // Transform attendance records
    const attendanceDetails = attendance.map(att => ({
      id: att.id,
      activity: att.hoat_dong?.ten_hd || 'Không xác định',
      date: att.tg_diem_danh,
      status: att.trang_thai_tham_gia === 'co_mat' ? 'present' : 'absent',
      points: att.trang_thai_tham_gia === 'co_mat' ? 
        calculateActivityPoints(att.hoat_dong) : 0
    }));

    // Calculate summary
    const summary = {
      totalPoints,
      currentSemester: semester || 'HK1 2024-2025',
      activities: registrations.length,
      avgPoints: registrations.length > 0 ? 
        parseFloat((totalPoints / registrations.length).toFixed(1)) : 0,
      rank: this._classifyPoints(totalPoints)
    };

    logInfo('User points report generated', { userId, totalPoints, activitiesCount: registrations.length });

    return {
      summary,
      details: activityDetails,
      attendance: attendanceDetails
    };
  }
}

module.exports = GetUserPointsReportUseCase;

