/**
 * GetPointsSummaryUseCase
 * Use case for getting points summary for student
 */
import { NotFoundError } from '../../../../core/errors/AppError';
import type { IPointsRepository, PointsFilters, RegistrationWithActivity, StatusCount } from '../interfaces/IPointsRepository';

interface PointsByTypeItem {
  ten_loai: string;
  so_hoat_dong: number;
  tong_diem: number;
  hoat_dong: Array<{
    id: string;
    ten_hd: string;
    diem_rl: number;
    ngay_tham_gia: Date | null | undefined;
    trang_thai: string;
  }>;
}

interface StatusSummary {
  cho_duyet: number;
  da_duyet: number;
  tu_choi: number;
  da_tham_gia: number;
  [key: string]: number;
}

interface Activity {
  diem_rl?: number | null;
  loai_hd?: {
    diem_mac_dinh?: number | null;
  } | null;
}

class GetPointsSummaryUseCase {
  private pointsRepository: IPointsRepository;

  constructor(pointsRepository: IPointsRepository) {
    this.pointsRepository = pointsRepository;
  }

  /**
   * Calculate points for activity
   * Priority: diem_rl of activity, if null/undefined or = 0, use diem_mac_dinh of activity type
   */
  private _calculateActivityPoints(activity: Activity | undefined | null): number {
    if (!activity) return 0;

    // Handle diem_rl (can be Decimal, Number, or String)
    let diemRl: number | null = null;
    if (activity.diem_rl != null && activity.diem_rl !== undefined) {
      const diemRlValue = activity.diem_rl as unknown;
      if (typeof diemRlValue === 'object' && diemRlValue !== null && 'toNumber' in diemRlValue) {
        diemRl = (diemRlValue as { toNumber: () => number }).toNumber();
      } else {
        diemRl = parseFloat(String(activity.diem_rl));
      }

      if (isNaN(diemRl) || !isFinite(diemRl)) {
        diemRl = null;
      }
    }

    if (diemRl != null && diemRl > 0) {
      return diemRl;
    }

    if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
      const diemMacDinhValue = activity.loai_hd.diem_mac_dinh as unknown;
      let diemMacDinh: number;
      if (typeof diemMacDinhValue === 'object' && diemMacDinhValue !== null && 'toNumber' in diemMacDinhValue) {
        diemMacDinh = (diemMacDinhValue as { toNumber: () => number }).toNumber();
      } else {
        diemMacDinh = parseFloat(String(activity.loai_hd.diem_mac_dinh)) || 0;
      }

      return isNaN(diemMacDinh) || !isFinite(diemMacDinh) ? 0 : diemMacDinh;
    }

    return 0;
  }

  private _calculatePointsByType(registrations: RegistrationWithActivity[]): {
    pointsByType: PointsByTypeItem[];
    totalPoints: number;
    totalActivities: number;
  } {
    const pointsByType: Record<string, PointsByTypeItem> = {};
    let totalPoints = 0;
    let totalActivities = 0;

    registrations.forEach((reg) => {
      const activity = reg.hoat_dong;
      if (!activity) return;

      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      const points = this._calculateActivityPoints(activity);

      if (!pointsByType[activityType]) {
        pointsByType[activityType] = {
          ten_loai: activityType,
          so_hoat_dong: 0,
          tong_diem: 0,
          hoat_dong: [],
        };
      }

      pointsByType[activityType].so_hoat_dong++;
      pointsByType[activityType].tong_diem += points;
      pointsByType[activityType].hoat_dong.push({
        id: activity.id,
        ten_hd: activity.ten_hd,
        diem_rl: points,
        ngay_tham_gia: reg.ngay_duyet,
        trang_thai: reg.trang_thai_dk,
      });

      totalPoints += points;
      totalActivities++;
    });

    return {
      pointsByType: Object.values(pointsByType),
      totalPoints,
      totalActivities,
    };
  }

  private _formatStatusSummary(statusCounts: StatusCount[]): StatusSummary {
    const statusSummary: StatusSummary = {
      cho_duyet: 0,
      da_duyet: 0,
      tu_choi: 0,
      da_tham_gia: 0,
    };

    statusCounts.forEach((item) => {
      statusSummary[item.trang_thai_dk] = item._count.id;
    });

    return statusSummary;
  }

  async execute(
    userId: string, 
    filters: PointsFilters = {},
    scope?: { where: any; permissions: any },
    semester?: { hoc_ky: string; nam_hoc: string }
  ): Promise<unknown> {
    const sinhVien = await this.pointsRepository.findStudentByUserId(userId);
    if (!sinhVien) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Merge filters with scope - prioritize semester from middleware
    const finalFilters = {
      ...filters,
      ...(semester && { 
        semester: `${semester.hoc_ky}_${semester.nam_hoc.split('-')[0]}` 
      })
    };

    const registrations = await this.pointsRepository.findAttendedRegistrations(sinhVien.id, finalFilters);
    const { pointsByType, totalPoints, totalActivities } = this._calculatePointsByType(registrations);
    const recentActivities = await this.pointsRepository.findAllRegistrations(sinhVien.id);
    const statusCounts = await this.pointsRepository.getRegistrationStatusCounts(sinhVien.id);
    const statusSummary = this._formatStatusSummary(statusCounts);

    return {
      sinh_vien: {
        mssv: sinhVien.mssv,
        ho_ten: sinhVien.nguoi_dung?.ho_ten,
        email: sinhVien.nguoi_dung?.email,
        lop: sinhVien.lop,
      },
      thong_ke: {
        tong_diem: totalPoints,
        tong_diem_lam_tron: Math.round(totalPoints),
        tong_hoat_dong: totalActivities,
        diem_theo_loai: pointsByType,
        trang_thai_dang_ky: statusSummary,
      },
      hoat_dong_gan_day: recentActivities.map((reg) => ({
        id: reg.hoat_dong?.id,
        ten_hd: reg.hoat_dong?.ten_hd,
        loai_hd: reg.hoat_dong?.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: this._calculateActivityPoints(reg.hoat_dong),
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai: reg.trang_thai_dk,
        ly_do_tu_choi: reg.ly_do_tu_choi,
      })),
    };
  }
}

export default GetPointsSummaryUseCase;
module.exports = GetPointsSummaryUseCase;
