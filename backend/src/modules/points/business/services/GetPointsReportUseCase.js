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

      const pointsByType = {};
      let totalPoints = 0;

      registrations.forEach(reg => {
        const activity = reg.hoat_dong;
        const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
        const points = calculateActivityPoints(activity);

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

