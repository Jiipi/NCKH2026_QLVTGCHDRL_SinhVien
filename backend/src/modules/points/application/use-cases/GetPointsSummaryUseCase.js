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

  _calculatePointsByType(registrations) {
    const pointsByType = {};
    let totalPoints = 0;
    let totalActivities = 0;

    registrations.forEach(reg => {
      const activity = reg.hoat_dong;
      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      const points = parseFloat(activity.diem_rl || 0);

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
        diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai: reg.trang_thai_dk,
        ly_do_tu_choi: reg.ly_do_tu_choi
      }))
    };
  }
}

module.exports = GetPointsSummaryUseCase;

