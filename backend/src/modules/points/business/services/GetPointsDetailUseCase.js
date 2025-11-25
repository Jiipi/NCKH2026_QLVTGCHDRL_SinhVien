const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetPointsDetailUseCase
 * Use case for getting detailed points with pagination
 * Follows Single Responsibility Principle (SRP)
 */
class GetPointsDetailUseCase {
  constructor(pointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId, filters, pagination) {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const { registrations, total } = await this.pointsRepository.findRegistrationsWithPagination(
      sinhVien.id,
      filters,
      pagination
    );

    const validRegistrations = registrations.filter(reg => reg.hoat_dong);

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

    const detailData = validRegistrations.map(reg => ({
      id: reg.id,
      hoat_dong: {
        id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        mo_ta: reg.hoat_dong.mo_ta,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: calculateActivityPoints(reg.hoat_dong),
        ngay_bd: reg.hoat_dong.ngay_bd,
        ngay_kt: reg.hoat_dong.ngay_kt,
        dia_diem: reg.hoat_dong.dia_diem,
        hoc_ky: reg.hoat_dong.hoc_ky,
        nam_hoc: reg.hoat_dong.nam_hoc
      },
      dang_ky: {
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai: reg.trang_thai_dk,
        ngay_duyet: reg.ngay_duyet,
        ly_do_tu_choi: reg.ly_do_tu_choi,
        ghi_chu: reg.ghi_chu
      }
    }));

    return {
      data: detailData,
      pagination: {
        current_page: parseInt(pagination.page || 1),
        per_page: parseInt(pagination.limit || 10),
        total,
        total_pages: Math.ceil(total / parseInt(pagination.limit || 10))
      }
    };
  }
}

module.exports = GetPointsDetailUseCase;

