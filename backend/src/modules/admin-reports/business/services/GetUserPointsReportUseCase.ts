/**
 * Get User Points Report Use Case
 * Retrieves detailed points report for a specific user
 */
import { logInfo } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type { IAdminReportsRepository, StudentRegistration, StudentAttendance } from '../interfaces/IAdminReportsRepository';

interface PointsQuery {
  semester?: string;
}

interface ActivityDetail {
  id: string;
  name: string;
  type: string;
  points: number;
  date: Date;
  status: string;
  semester: string;
}

interface AttendanceDetail {
  id: string;
  activity: string;
  date: Date;
  status: string;
  points: number;
}

interface PointsSummary {
  totalPoints: number;
  currentSemester: string;
  activities: number;
  avgPoints: number;
  rank: string;
}

interface UserPointsReportResult {
  summary: PointsSummary;
  details: ActivityDetail[];
  attendance: AttendanceDetail[];
}

interface ActivityWithPoints {
  diem_rl?: number | null;
  loai_hd?: {
    diem_mac_dinh?: number | null;
  } | null;
}

class GetUserPointsReportUseCase {
  private repository: IAdminReportsRepository;

  constructor(adminReportsRepository: IAdminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  private _classifyPoints(points: number): string {
    if (points >= 80) return 'Xuất sắc';
    if (points >= 60) return 'Khá';
    if (points >= 40) return 'Trung bình';
    return 'Yếu';
  }

  async execute(userId: string, query: PointsQuery = {}): Promise<UserPointsReportResult> {
    const { semester } = query;

    // Fetch user with student and class info
    const user = await this.repository.findUserWithStudent(userId);

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    // If not a student, return empty report
    if (!user.sinh_vien) {
      return {
        summary: {
          totalPoints: 0,
          currentSemester: 'N/A',
          activities: 0,
          avgPoints: 0,
          rank: 'Không có dữ liệu',
        },
        details: [],
        attendance: [],
      };
    }

    // Fetch approved/participated activity registrations
    const registrations = await this.repository.findRegistrationsByStudent(user.sinh_vien.id);

    // Fetch attendance records
    const attendance = await this.repository.findAttendanceByStudent(user.sinh_vien.id);

    /**
     * Calculate points for activity
     * Priority: diem_rl of activity, if null/undefined or = 0, use diem_mac_dinh of activity type
     */
    const calculateActivityPoints = (activity: ActivityWithPoints | null): number => {
      if (!activity) return 0;

      // Handle diem_rl (can be Decimal, Number, or String)
      let diemRl: number | null = null;
      if (activity.diem_rl != null && activity.diem_rl !== undefined) {
        const diemRlValue = activity.diem_rl as unknown;
        diemRl =
          typeof diemRlValue === 'object' && diemRlValue !== null && 'toNumber' in diemRlValue
            ? (diemRlValue as { toNumber: () => number }).toNumber()
            : parseFloat(String(activity.diem_rl));

        // If parseFloat returns NaN, treat as null
        if (isNaN(diemRl)) {
          diemRl = null;
        }
      }

      // If activity has points set and > 0, use that
      if (diemRl != null && diemRl > 0) {
        return diemRl;
      }

      // If no points or = 0, use default points from activity type
      if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
        const diemMacDinhValue = activity.loai_hd.diem_mac_dinh as unknown;
        const diemMacDinh =
          typeof diemMacDinhValue === 'object' && diemMacDinhValue !== null && 'toNumber' in diemMacDinhValue
            ? (diemMacDinhValue as { toNumber: () => number }).toNumber()
            : parseFloat(String(activity.loai_hd.diem_mac_dinh));

        // If parseFloat returns NaN, return 0
        return isNaN(diemMacDinh) ? 0 : diemMacDinh;
      }

      return 0;
    };

    // Calculate total points and activity details
    let totalPoints = 0;
    const activityDetails: ActivityDetail[] = [];

    registrations.forEach((reg: StudentRegistration) => {
      if (reg.hoat_dong) {
        const points = calculateActivityPoints(reg.hoat_dong);
        if (points > 0) {
          totalPoints += points;
          activityDetails.push({
            id: reg.id,
            name: reg.hoat_dong.ten_hd,
            type: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Không xác định',
            points: points,
            date: reg.ngay_dang_ky,
            status: 'completed',
            semester: reg.hoat_dong.hoc_ky || 'hoc_ky_1',
          });
        }
      }
    });

    // Transform attendance records
    const attendanceDetails: AttendanceDetail[] = attendance.map((att: StudentAttendance) => ({
      id: att.id,
      activity: att.hoat_dong?.ten_hd || 'Không xác định',
      date: att.tg_diem_danh,
      status: att.trang_thai_tham_gia === 'co_mat' ? 'present' : 'absent',
      points: att.trang_thai_tham_gia === 'co_mat' ? calculateActivityPoints(att.hoat_dong) : 0,
    }));

    // Calculate summary
    const summary: PointsSummary = {
      totalPoints,
      currentSemester: semester || 'HK1 2024-2025',
      activities: registrations.length,
      avgPoints: registrations.length > 0 ? parseFloat((totalPoints / registrations.length).toFixed(1)) : 0,
      rank: this._classifyPoints(totalPoints),
    };

    logInfo('User points report generated', { userId, totalPoints, activitiesCount: registrations.length });

    return {
      summary,
      details: activityDetails,
      attendance: attendanceDetails,
    };
  }
}

export default GetUserPointsReportUseCase;
module.exports = GetUserPointsReportUseCase;
