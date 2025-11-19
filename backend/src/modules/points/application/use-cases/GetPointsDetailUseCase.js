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

    const detailData = validRegistrations.map(reg => ({
      id: reg.id,
      hoat_dong: {
        id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        mo_ta: reg.hoat_dong.mo_ta,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
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

