/**
 * GetPointsDetailUseCase
 * Use case for getting detailed points with pagination
 */
import { NotFoundError } from '../../../../core/errors/AppError';
import type { IPointsRepository, PointsFilters, PaginationParams } from '../interfaces/IPointsRepository';

interface Activity {
  diem_rl?: number | null;
  loai_hd?: {
    diem_mac_dinh?: number | null;
  } | null;
}

class GetPointsDetailUseCase {
  private pointsRepository: IPointsRepository;

  constructor(pointsRepository: IPointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId: string, filters: PointsFilters, pagination: PaginationParams): Promise<unknown> {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const { registrations, total } = await this.pointsRepository.findRegistrationsWithPagination(
      sinhVien.id,
      filters,
      pagination
    );

    const validRegistrations = registrations.filter((reg) => reg.hoat_dong);

    /**
     * Calculate points for activity
     * Priority: diem_rl of activity, if null/undefined or = 0, use diem_mac_dinh of activity type
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

    const detailData = validRegistrations.map((reg) => ({
      id: reg.id,
      hoat_dong: {
        id: reg.hoat_dong!.id,
        ten_hd: reg.hoat_dong!.ten_hd,
        mo_ta: reg.hoat_dong!.mo_ta,
        loai_hd: reg.hoat_dong!.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: calculateActivityPoints(reg.hoat_dong),
        ngay_bd: reg.hoat_dong!.ngay_bd,
        ngay_kt: reg.hoat_dong!.ngay_kt,
        dia_diem: reg.hoat_dong!.dia_diem,
        hoc_ky: reg.hoat_dong!.hoc_ky,
        nam_hoc: reg.hoat_dong!.nam_hoc,
      },
      dang_ky: {
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai: reg.trang_thai_dk,
        ngay_duyet: reg.ngay_duyet,
        ly_do_tu_choi: reg.ly_do_tu_choi,
        ghi_chu: reg.ghi_chu,
      },
    }));

    const pageNum = parseInt(String(pagination.page || 1));
    const limitNum = parseInt(String(pagination.limit || 10));

    return {
      data: detailData,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    };
  }
}

export default GetPointsDetailUseCase;
module.exports = GetPointsDetailUseCase;
