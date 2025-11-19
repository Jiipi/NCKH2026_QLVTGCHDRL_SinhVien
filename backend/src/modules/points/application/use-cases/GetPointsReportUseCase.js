const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetPointsReportUseCase
 * Use case for generating points report for academic year
 * Follows Single Responsibility Principle (SRP)
 */
class GetPointsReportUseCase {
  constructor(pointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId, namHoc = null) {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const reportData = {};

    for (const hoc_ky of ['hoc_ky_1', 'hoc_ky_2']) {
      const registrations = await this.pointsRepository.findCompletedRegistrationsForSemester(
        sinhVien.id,
        hoc_ky,
        namHoc
      );

      const pointsByType = {};
      let totalPoints = 0;

      registrations.forEach(reg => {
        const activity = reg.hoat_dong;
        const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
        const points = parseFloat(activity.diem_rl || 0);

        if (!pointsByType[activityType]) {
          pointsByType[activityType] = {
            ten_loai: activityType,
            so_hoat_dong: 0,
            tong_diem: 0
          };
        }

        pointsByType[activityType].so_hoat_dong++;
        pointsByType[activityType].tong_diem += points;
        totalPoints += points;
      });

      reportData[hoc_ky] = {
        hoc_ky: hoc_ky === 'hoc_ky_1' ? 'Học kỳ 1' : 'Học kỳ 2',
        tong_diem: totalPoints,
        tong_hoat_dong: registrations.length,
        diem_theo_loai: Object.values(pointsByType)
      };
    }

    return {
      sinh_vien: {
        mssv: sinhVien.mssv,
        ho_ten: sinhVien.nguoi_dung.ho_ten,
        email: sinhVien.nguoi_dung.email,
        lop: sinhVien.lop
      },
      nam_hoc: namHoc || new Date().getFullYear().toString(),
      bao_cao: reportData
    };
  }
}

module.exports = GetPointsReportUseCase;

