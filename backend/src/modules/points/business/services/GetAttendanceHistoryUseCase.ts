/**
 * GetAttendanceHistoryUseCase
 * Use case for getting attendance history
 */
import { NotFoundError } from '../../../../core/errors/AppError';
import type { IPointsRepository, PaginationParams, AttendanceWithDetails } from '../interfaces/IPointsRepository';

interface Activity {
  diem_rl?: number | null;
  loai_hd?: {
    diem_mac_dinh?: number | null;
  } | null;
}

class GetAttendanceHistoryUseCase {
  private pointsRepository: IPointsRepository;

  constructor(pointsRepository: IPointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId: string, pagination: PaginationParams): Promise<unknown> {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const { attendances, total } = await this.pointsRepository.findAttendanceRecords(sinhVien.id, pagination);

    /**
     * Calculate points for activity
     */
    const calculateActivityPoints = (activity: Activity | undefined | null): number => {
      if (!activity) return 0;

      let diemRl: number | null = null;
      if (activity.diem_rl != null && activity.diem_rl !== undefined) {
        const diemRlValue = activity.diem_rl as unknown;
        diemRl =
          typeof diemRlValue === 'object' && diemRlValue !== null && 'toNumber' in diemRlValue
            ? (diemRlValue as { toNumber: () => number }).toNumber()
            : parseFloat(String(activity.diem_rl));

        if (isNaN(diemRl)) {
          diemRl = null;
        }
      }

      if (diemRl != null && diemRl > 0) {
        return diemRl;
      }

      if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
        const diemMacDinhValue = activity.loai_hd.diem_mac_dinh as unknown;
        const diemMacDinh =
          typeof diemMacDinhValue === 'object' && diemMacDinhValue !== null && 'toNumber' in diemMacDinhValue
            ? (diemMacDinhValue as { toNumber: () => number }).toNumber()
            : parseFloat(String(activity.loai_hd.diem_mac_dinh));

        return isNaN(diemMacDinh) ? 0 : diemMacDinh;
      }

      return 0;
    };

    const attendanceData = attendances.map((att: AttendanceWithDetails) => ({
      id: att.id,
      hoat_dong: {
        id: att.hoat_dong.id,
        ten_hd: att.hoat_dong.ten_hd,
        loai_hd: att.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: calculateActivityPoints(att.hoat_dong),
      },
      diem_danh: {
        thoi_gian: att.tg_diem_danh,
        phuong_thuc: att.phuong_thuc,
        trang_thai_tham_gia: att.trang_thai_tham_gia,
        ghi_chu: att.ghi_chu,
        nguoi_diem_danh: att.nguoi_diem_danh.ho_ten,
      },
    }));

    const pageNum = parseInt(String(pagination.page || 1));
    const limitNum = parseInt(String(pagination.limit || 10));

    return {
      data: attendanceData,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }
}

export default GetAttendanceHistoryUseCase;
module.exports = GetAttendanceHistoryUseCase;
