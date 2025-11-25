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

    const attendanceData = attendances.map(att => ({
      id: att.id,
      hoat_dong: {
        id: att.hoat_dong.id,
        ten_hd: att.hoat_dong.ten_hd,
        loai_hd: att.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: calculateActivityPoints(att.hoat_dong)
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

