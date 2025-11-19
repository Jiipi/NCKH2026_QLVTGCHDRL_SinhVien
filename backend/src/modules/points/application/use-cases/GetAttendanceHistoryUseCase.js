const { NotFoundError } = require('../../../../core/errors/AppError');

/**
 * GetAttendanceHistoryUseCase
 * Use case for getting attendance history
 * Follows Single Responsibility Principle (SRP)
 */
class GetAttendanceHistoryUseCase {
  constructor(pointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId, pagination) {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const { attendances, total } = await this.pointsRepository.findAttendanceRecords(sinhVien.id, pagination);

    const attendanceData = attendances.map(att => ({
      id: att.id,
      hoat_dong: {
        id: att.hoat_dong.id,
        ten_hd: att.hoat_dong.ten_hd,
        loai_hd: att.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: parseFloat(att.hoat_dong.diem_rl || 0)
      },
      diem_danh: {
        thoi_gian: att.tg_diem_danh,
        phuong_thuc: att.phuong_thuc,
        trang_thai_tham_gia: att.trang_thai_tham_gia,
        ghi_chu: att.ghi_chu,
        nguoi_diem_danh: att.nguoi_diem_danh.ho_ten
      }
    }));

    return {
      data: attendanceData,
      pagination: {
        current_page: parseInt(pagination.page || 1),
        per_page: parseInt(pagination.limit || 10),
        total,
        total_pages: Math.ceil(total / parseInt(pagination.limit || 10))
      }
    };
  }
}

module.exports = GetAttendanceHistoryUseCase;

