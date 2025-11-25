const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetPointsSummaryUseCase
 * Use case for getting points summary for student
 * Follows Single Responsibility Principle (SRP)
 */
class GetPointsSummaryUseCase {
  constructor(pointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  /**
   * Tính điểm cho hoạt động
   * Ưu tiên diem_rl của hoạt động, nếu null/undefined hoặc = 0 thì dùng diem_mac_dinh của loại hoạt động
   */
  _calculateActivityPoints(activity) {
    if (!activity) return 0;
    
    // Xử lý diem_rl (có thể là Decimal, Number, hoặc String)
    let diemRl = null;
    if (activity.diem_rl != null && activity.diem_rl !== undefined) {
      // Xử lý Decimal type từ Prisma
      if (typeof activity.diem_rl === 'object' && activity.diem_rl.toNumber) {
        diemRl = activity.diem_rl.toNumber();
      } else {
        diemRl = parseFloat(activity.diem_rl);
      }
      
      // Nếu parseFloat trả về NaN hoặc không phải số hợp lệ, coi như null
      if (isNaN(diemRl) || !isFinite(diemRl)) {
        diemRl = null;
      }
    }
    
    // Nếu hoạt động có điểm được set và > 0, dùng điểm đó
    if (diemRl != null && diemRl > 0) {
      return diemRl;
    }
    
    // Nếu không có điểm hoặc = 0, dùng điểm mặc định của loại hoạt động
    if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
      let diemMacDinh = 0;
      
      // Xử lý Decimal type từ Prisma
      if (typeof activity.loai_hd.diem_mac_dinh === 'object' && activity.loai_hd.diem_mac_dinh.toNumber) {
        diemMacDinh = activity.loai_hd.diem_mac_dinh.toNumber();
      } else {
        diemMacDinh = parseFloat(activity.loai_hd.diem_mac_dinh) || 0;
      }
      
      // Nếu parseFloat trả về NaN, trả về 0
      return isNaN(diemMacDinh) || !isFinite(diemMacDinh) ? 0 : diemMacDinh;
    }
    
    return 0;
  }

  _calculatePointsByType(registrations) {
    const pointsByType = {};
    let totalPoints = 0;
    let totalActivities = 0;

    registrations.forEach(reg => {
      const activity = reg.hoat_dong;
      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      const points = this._calculateActivityPoints(activity);

      if (!pointsByType[activityType]) {
        pointsByType[activityType] = {
          ten_loai: activityType,
          so_hoat_dong: 0,
          tong_diem: 0,
          hoat_dong: []
        };
      }

      pointsByType[activityType].so_hoat_dong++;
      pointsByType[activityType].tong_diem += points;
      pointsByType[activityType].hoat_dong.push({
        id: activity.id,
        ten_hd: activity.ten_hd,
        diem_rl: points,
        ngay_tham_gia: reg.ngay_duyet,
        trang_thai: reg.trang_thai_dk
      });

      totalPoints += points;
      totalActivities++;
    });

    return {
      pointsByType: Object.values(pointsByType),
      totalPoints,
      totalActivities
    };
  }

  _formatStatusSummary(statusCounts) {
    const statusSummary = {
      cho_duyet: 0,
      da_duyet: 0,
      tu_choi: 0,
      da_tham_gia: 0
    };

    statusCounts.forEach(item => {
      statusSummary[item.trang_thai_dk] = item._count.id;
    });

    return statusSummary;
  }

  async execute(userId, filters = {}) {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const registrations = await this.pointsRepository.findAttendedRegistrations(sinhVien.id, filters);
    const { pointsByType, totalPoints, totalActivities } = this._calculatePointsByType(registrations);
    const recentActivities = await this.pointsRepository.findAllRegistrations(sinhVien.id);
    const statusCounts = await this.pointsRepository.getRegistrationStatusCounts(sinhVien.id);
    const statusSummary = this._formatStatusSummary(statusCounts);

    return {
      sinh_vien: {
        mssv: sinhVien.mssv,
        ho_ten: sinhVien.nguoi_dung.ho_ten,
        email: sinhVien.nguoi_dung.email,
        lop: sinhVien.lop
      },
      thong_ke: {
        tong_diem: totalPoints,
        tong_diem_lam_tron: Math.round(totalPoints),
        tong_hoat_dong: totalActivities,
        diem_theo_loai: pointsByType,
        trang_thai_dang_ky: statusSummary
      },
      hoat_dong_gan_day: recentActivities.map(reg => ({
        id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: this._calculateActivityPoints(reg.hoat_dong),
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai: reg.trang_thai_dk,
        ly_do_tu_choi: reg.ly_do_tu_choi
      }))
    };
  }
}

module.exports = GetPointsSummaryUseCase;

