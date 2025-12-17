/**
 * GetPointsReportUseCase
 * Use case for generating points report for academic year
 */
import { NotFoundError } from '../../../../core/errors/AppError';
import type { IPointsRepository, RegistrationWithActivity } from '../interfaces/IPointsRepository';

interface Activity {
  diem_rl?: number | null;
  loai_hd?: {
    ten_loai_hd?: string;
    diem_mac_dinh?: number | null;
  } | null;
}

interface PointsByTypeItem {
  ten_loai: string;
  so_hoat_dong: number;
  tong_diem: number;
}

interface SemesterReport {
  hoc_ky: string;
  tong_diem: number;
  tong_hoat_dong: number;
  diem_theo_loai: PointsByTypeItem[];
}

class GetPointsReportUseCase {
  private pointsRepository: IPointsRepository;

  constructor(pointsRepository: IPointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  async execute(userId: string, namHoc: string | null = null): Promise<unknown> {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const reportData: Record<string, SemesterReport> = {};

    for (const hoc_ky of ['hoc_ky_1', 'hoc_ky_2']) {
      const registrations = await this.pointsRepository.findCompletedRegistrationsForSemester(
        sinhVien.id,
        hoc_ky,
        namHoc
      );

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

      const pointsByType: Record<string, PointsByTypeItem> = {};
      let totalPoints = 0;

      registrations.forEach((reg: RegistrationWithActivity) => {
        const activity = reg.hoat_dong;
        if (!activity) return;

        const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
        const points = calculateActivityPoints(activity);

        if (!pointsByType[activityType]) {
          pointsByType[activityType] = {
            ten_loai: activityType,
            so_hoat_dong: 0,
            tong_diem: 0,
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
        diem_theo_loai: Object.values(pointsByType),
      };
    }

    return {
      sinh_vien: {
        mssv: sinhVien.mssv,
        ho_ten: sinhVien.nguoi_dung?.ho_ten,
        email: sinhVien.nguoi_dung?.email,
        lop: sinhVien.lop,
      },
      nam_hoc: namHoc || new Date().getFullYear().toString(),
      bao_cao: reportData,
    };
  }
}

export default GetPointsReportUseCase;
module.exports = GetPointsReportUseCase;
