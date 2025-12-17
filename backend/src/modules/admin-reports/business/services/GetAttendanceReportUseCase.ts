/**
 * Get Attendance Report Use Case
 * Retrieves paginated attendance report with filters
 */
import { logInfo } from '../../../../core/logger';
import type { IAdminReportsRepository, AttendanceStats } from '../interfaces/IAdminReportsRepository';

interface AttendanceReportParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  activity_id?: number | string;
  status?: string;
}

interface TransformedAttendance {
  id: string;
  student: {
    id: string;
    mssv: string;
    name: string;
    class: string;
    email: string | null;
  };
  activity: {
    id: string;
    name: string;
    type: string;
    date: Date;
    points: number | null;
  };
  attendance: {
    method: string | null;
    status: string | null;
    time: Date;
    confirmed: boolean | null;
    notes: string | null;
    ip_address: string | null;
    gps_location: string | null;
  };
  checked_by: {
    id: string;
    name: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AttendanceReportResult {
  attendance: TransformedAttendance[];
  stats: AttendanceStats;
  pagination: PaginationInfo;
}

class GetAttendanceReportUseCase {
  private repository: IAdminReportsRepository;

  constructor(adminReportsRepository: IAdminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  async execute(params: AttendanceReportParams = {}): Promise<AttendanceReportResult> {
    const {
      page = 1,
      limit = 15,
      search,
      activity_id,
      status,
    } = params;

    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;
    const maxLimit = 50;
    const actualLimit = Math.min(limitNum, maxLimit);

    // Build where condition
    const whereCondition: Record<string, unknown> = {};

    if (activity_id) {
      whereCondition.hd_id = activity_id;
    }

    if (status) {
      whereCondition.trang_thai_tham_gia = status;
    }

    if (search) {
      whereCondition.sinh_vien = {
        OR: [
          { nguoi_dung: { ho_ten: { contains: search, mode: 'insensitive' } } },
          { mssv: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Fetch attendance records with related data
    const { attendanceList, total } = await this.repository.findAttendanceWithFilters(
      whereCondition,
      skip,
      actualLimit
    );

    // Transform to frontend-friendly format
    const transformedData: TransformedAttendance[] = attendanceList.map((record) => ({
      id: record.id,
      student: {
        id: record.sinh_vien.id,
        mssv: record.sinh_vien.mssv,
        name: record.sinh_vien.nguoi_dung.ho_ten,
        class: record.sinh_vien.lop?.ten_lop || '',
        email: record.sinh_vien.nguoi_dung.email,
      },
      activity: {
        id: record.hoat_dong.id,
        name: record.hoat_dong.ten_hd,
        type: record.hoat_dong.loai_hd?.ten_loai_hd || '',
        date: record.hoat_dong.ngay_bd,
        points: record.hoat_dong.diem_rl,
      },
      attendance: {
        method: record.phuong_thuc,
        status: record.trang_thai_tham_gia,
        time: record.tg_diem_danh,
        confirmed: record.xac_nhan_tham_gia,
        notes: record.ghi_chu,
        ip_address: record.dia_chi_ip,
        gps_location: record.vi_tri_gps,
      },
      checked_by: {
        id: record.nguoi_diem_danh.id,
        name: record.nguoi_diem_danh.ho_ten,
      },
    }));

    logInfo('Attendance report generated', { total, page: pageNum, limit: actualLimit });

    // Get overall stats
    const stats = await this.repository.getAttendanceStats();

    return {
      attendance: transformedData,
      stats,
      pagination: {
        page: pageNum,
        limit: actualLimit,
        total,
        totalPages: Math.ceil(total / actualLimit),
        hasNextPage: pageNum < Math.ceil(total / actualLimit),
        hasPrevPage: pageNum > 1,
      },
    };
  }
}

export default GetAttendanceReportUseCase;
module.exports = GetAttendanceReportUseCase;
