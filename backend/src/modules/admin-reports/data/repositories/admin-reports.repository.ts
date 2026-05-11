/**
 * Admin Reports Repository
 * Data access layer for admin reports
 */
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { Prisma } from '@prisma/client';
import type {
  IAdminReportsRepository,
  AttendanceRecord,
  AttendanceStats,
  AttendanceAuditSummary,
  ClassInfo,
  StudentRegistration,
  StudentAttendance,
} from '../../business/interfaces/IAdminReportsRepository';
import type {
  ActivityStatusGroup,
  TopActivity,
  RegistrationDateGroup,
  ActivityExportData,
  RegistrationExportData,
  UserWithStudent,
  ActivityReportFilter,
} from '../../admin-reports.types';

class AdminReportsRepository implements IAdminReportsRepository {
  async groupActivitiesByStatus(where: ActivityReportFilter): Promise<unknown[]> {
    const activityWhere = where as Prisma.HoatDongWhereInput;
    return prisma.hoatDong.groupBy({
      by: ['trang_thai'],
      where: activityWhere,
      _count: { _all: true },
    }) as unknown as Promise<unknown[]>;
  }

  async findTopActivities(where: ActivityReportFilter): Promise<unknown[]> {
    const activityWhere = where as Prisma.HoatDongWhereInput;
    const results = await prisma.hoatDong.findMany({
      where: activityWhere,
      select: { id: true, ten_hd: true, ngay_bd: true, dang_ky_hd: { select: { id: true } } },
      orderBy: { ngay_bd: 'desc' },
      take: 20,
    });
    return results as unknown[];
  }

  async groupRegistrationsByDate(where: ActivityReportFilter): Promise<unknown[]> {
    const activityWhere = where as Prisma.HoatDongWhereInput;
    return prisma.dangKyHoatDong.groupBy({
      by: ['ngay_dang_ky'],
      where: { hoat_dong: activityWhere },
      _count: { _all: true },
    }) as unknown as Promise<unknown[]>;
  }

  async findActivitiesForExport(where: ActivityReportFilter): Promise<unknown[]> {
    const activityWhere = where as Prisma.HoatDongWhereInput;
    try {
      const results = await prisma.hoatDong.findMany({
        where: activityWhere,
        select: {
          id: true,
          ma_hd: true,
          ten_hd: true,
          diem_rl: true,
          trang_thai: true,
          ngay_bd: true,
          ngay_kt: true,
          loai_hd: { select: { ten_loai_hd: true } },
        },
        orderBy: { ngay_bd: 'desc' },
      });
      return results as unknown[];
    } catch (qErr: unknown) {
      const errorMessage = qErr instanceof Error ? qErr.message : String(qErr);
      console.warn('findActivitiesForExport query failed, retrying without orderBy', errorMessage);
      const results = await prisma.hoatDong.findMany({
        where: activityWhere,
        select: {
          id: true,
          ma_hd: true,
          ten_hd: true,
          diem_rl: true,
          trang_thai: true,
          ngay_bd: true,
          ngay_kt: true,
          loai_hd: { select: { ten_loai_hd: true } },
        },
      });
      return results as unknown[];
    }
  }

  async findRegistrationsForExport(where: ActivityReportFilter): Promise<unknown[]> {
    const activityWhere = where as Prisma.HoatDongWhereInput;
    const results = await prisma.dangKyHoatDong.findMany({
      where: { hoat_dong: activityWhere },
      include: { sinh_vien: { include: { nguoi_dung: true } }, hoat_dong: true },
      orderBy: { ngay_dang_ky: 'desc' },
      take: 5000,
    });
    return results as unknown[];
  }

  async findUserWithStudent(userId: string): Promise<UserWithStudent | null> {
    const result = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: {
          include: {
            lop: true,
          },
        },
      },
    });
    return result as UserWithStudent | null;
  }

  async findRegistrationsByStudent(svId: string): Promise<StudentRegistration[]> {
    const results = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId,
        trang_thai_dk: { in: ['da_tham_gia', 'da_duyet'] },
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true,
          },
        },
      },
      orderBy: { ngay_dang_ky: 'desc' },
    });
    return results as unknown as StudentRegistration[];
  }

  async findAttendanceByStudent(svId: string): Promise<StudentAttendance[]> {
    const results = await prisma.diemDanh.findMany({
      where: {
        sv_id: svId,
      },
      include: {
        hoat_dong: true,
      },
      orderBy: { tg_diem_danh: 'desc' },
    });
    return results as unknown as StudentAttendance[];
  }

  async findAttendanceWithFilters(
    whereCondition: Record<string, unknown>,
    skip: number,
    take: number
  ): Promise<{ attendanceList: AttendanceRecord[]; total: number }> {
    const attendanceWhere = whereCondition as Prisma.DiemDanhWhereInput;
    const [attendanceList, total] = await Promise.all([
      prisma.diemDanh.findMany({
        where: attendanceWhere,
        include: {
          sinh_vien: {
            include: {
              nguoi_dung: true,
              lop: true,
            },
          },
          hoat_dong: {
            include: {
              loai_hd: true,
            },
          },
          nguoi_diem_danh: true,
        },
        skip,
        take,
        orderBy: { tg_diem_danh: 'desc' },
      }),
      prisma.diemDanh.count({ where: attendanceWhere }),
    ]);

    return { attendanceList: attendanceList as unknown as AttendanceRecord[], total };
  }

  async findAllClasses(): Promise<unknown[]> {
    const results = await prisma.lop.findMany({
      select: {
        id: true,
        ten_lop: true,
        khoa: true,
        nien_khoa: true,
        _count: {
          select: { sinh_viens: true },
        },
      },
      orderBy: [{ khoa: 'asc' }, { ten_lop: 'asc' }],
    });
    return results as unknown[];
  }

  async getAttendanceStats(): Promise<AttendanceStats> {
    const [total, coMat, vangMat, muon, veSom] = await Promise.all([
      prisma.diemDanh.count(),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 'co_mat' } }),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 'vang_mat' } }),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 'muon' } }),
      prisma.diemDanh.count({ where: { trang_thai_tham_gia: 've_som' } }),
    ]);
    return { total, coMat, vangMat, muon, veSom };
  }

  async findAttendanceAuditWithFilters(
    whereCondition: Prisma.NhatKyDiemDanhWhereInput,
    skip: number,
    take: number
  ): Promise<{ items: unknown[]; total: number }> {
    const [items, total] = await Promise.all([
      prisma.nhatKyDiemDanh.findMany({
        where: whereCondition,
        include: {
          nguoi_thuc_hien: { select: { id: true, ho_ten: true, ten_dn: true, email: true } },
          sinh_vien: { include: { nguoi_dung: { select: { id: true, ho_ten: true, email: true } }, lop: true } },
          hoat_dong: { include: { loai_hd: true, lop: true } },
          phien_qr: true,
          ma_qr: { select: { id: true, phien_id: true, het_han_luc: true, da_su_dung_luc: true, ngay_tao: true } },
          diem_danh: true
        },
        skip,
        take,
        orderBy: { thoi_gian: 'desc' }
      }),
      prisma.nhatKyDiemDanh.count({ where: whereCondition })
    ]);

    return { items, total };
  }

  async getAttendanceAuditSummary(whereCondition: Prisma.NhatKyDiemDanhWhereInput): Promise<AttendanceAuditSummary> {
    const [totalEvents, failedScans, successfulScans, duplicateAttemptCount, tokenIssueCount, suspiciousIps] = await Promise.all([
      prisma.nhatKyDiemDanh.count({ where: whereCondition }),
      prisma.nhatKyDiemDanh.count({ where: { ...whereCondition, hanh_dong: 'SCAN_FAILED' } }),
      prisma.nhatKyDiemDanh.count({ where: { ...whereCondition, hanh_dong: 'SCAN_SUCCESS' } }),
      prisma.nhatKyDiemDanh.count({ where: { ...whereCondition, ly_do: 'duplicate_attendance' } }),
      prisma.nhatKyDiemDanh.count({ where: { ...whereCondition, ly_do: { in: ['invalid_token', 'expired_token', 'token_mismatch', 'missing_token'] } } }),
      prisma.nhatKyDiemDanh.groupBy({
        by: ['dia_chi_ip'],
        where: { ...whereCondition, hanh_dong: 'SCAN_FAILED', dia_chi_ip: { not: null } },
        _count: { _all: true },
        having: { dia_chi_ip: { _count: { gte: 5 } } }
      })
    ]);

    return {
      totalEvents,
      failedScans,
      successfulScans,
      duplicateAttemptCount,
      tokenIssueCount,
      suspiciousIpCount: suspiciousIps.length
    };
  }
}

const adminReportsRepository = new AdminReportsRepository();

export { AdminReportsRepository, adminReportsRepository };
export default adminReportsRepository;
module.exports = adminReportsRepository;
