/**
 * Admin Reports Repository Interface
 */
import type {
  ActivityStatusGroup,
  TopActivity,
  RegistrationDateGroup,
  ActivityExportData,
  RegistrationExportData,
  UserWithStudent,
  ActivityReportFilter,
} from '../../admin-reports.types';
import type { DiemDanh, Lop } from '@prisma/client';

/**
 * Attendance record with related data
 */
export interface AttendanceRecord extends DiemDanh {
  sinh_vien: {
    id: string;
    mssv: string;
    nguoi_dung: {
      ho_ten: string;
      email: string | null;
    };
    lop?: Lop | null;
  };
  hoat_dong: {
    id: string;
    ten_hd: string;
    ngay_bd: Date;
    diem_rl: number | null;
    loai_hd?: {
      ten_loai_hd: string;
    } | null;
  };
  nguoi_diem_danh: {
    id: string;
    ho_ten: string;
  };
}

/**
 * Attendance stats
 */
export interface AttendanceStats {
  total: number;
  coMat: number;
  vangMat: number;
  muon: number;
  veSom: number;
}

/**
 * Class info for reports
 */
export interface ClassInfo {
  id: string;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  _count: {
    sinh_viens: number;
  };
}

/**
 * Student registration with activity
 */
export interface StudentRegistration {
  id: string;
  ngay_dang_ky: Date;
  hoat_dong: {
    id: string;
    ten_hd: string;
    hoc_ky?: string | null;
    diem_rl?: number | null;
    loai_hd?: {
      ten_loai_hd: string;
      diem_mac_dinh?: number | null;
    } | null;
  } | null;
}

/**
 * Student attendance record
 */
export interface StudentAttendance {
  id: string;
  tg_diem_danh: Date;
  trang_thai_tham_gia: string;
  hoat_dong: {
    id: string;
    ten_hd: string;
    diem_rl?: number | null;
    loai_hd?: {
      diem_mac_dinh?: number | null;
    } | null;
  } | null;
}

export interface IAdminReportsRepository {
  groupActivitiesByStatus(where: ActivityReportFilter): Promise<unknown[]>;
  findTopActivities(where: ActivityReportFilter): Promise<unknown[]>;
  groupRegistrationsByDate(where: ActivityReportFilter): Promise<unknown[]>;
  findActivitiesForExport(where: ActivityReportFilter): Promise<unknown[]>;
  findRegistrationsForExport(where: ActivityReportFilter): Promise<unknown[]>;
  findUserWithStudent(userId: string): Promise<UserWithStudent | null>;
  findRegistrationsByStudent(svId: string): Promise<StudentRegistration[]>;
  findAttendanceByStudent(svId: string): Promise<StudentAttendance[]>;
  findAttendanceWithFilters(
    whereCondition: Record<string, unknown>,
    skip: number,
    take: number
  ): Promise<{ attendanceList: AttendanceRecord[]; total: number }>;
  findAllClasses(): Promise<unknown[]>;
  getAttendanceStats(): Promise<AttendanceStats>;
}
