/**
 * Admin Reports Module - Type Definitions
 * Admin reporting and analytics types
 */

import type { HoatDong, DangKyHoatDong, SinhVien, NguoiDung, Lop } from '@prisma/client';

// ============== Activity Report Types ==============

/**
 * Activity status group
 */
export interface ActivityStatusGroup {
  trang_thai: string;
  _count: {
    _all: number;
  };
}

/**
 * Top activity info
 */
export interface TopActivity {
  id: number;
  ten_hd: string;
  ngay_bd: Date;
  registrationCount: number;
  dang_ky_hd?: Array<{ id: string }>;
}

/**
 * Registration date group
 */
export interface RegistrationDateGroup {
  ngay_dang_ky: Date;
  _count: {
    _all: number;
  };
}

// ============== Export Types ==============

/**
 * Activity export data
 */
export interface ActivityExportData {
  id: number;
  ma_hd: string | null;
  ten_hd: string;
  diem_rl: number | null;
  trang_thai: string;
  ngay_bd: Date;
  ngay_kt: Date | null;
  loai_hd?: {
    ten_loai_hd: string;
  };
}

/**
 * Registration export data
 */
export interface RegistrationExportData {
  id: string;
  sv_id: number;
  trang_thai_dk: string;
  ngay_dang_ky: Date;
  sinh_vien?: SinhVien & {
    nguoi_dung?: NguoiDung;
  };
  hoat_dong?: HoatDong;
}

// ============== Report Query Types ==============

/**
 * Activity report filter
 */
export interface ActivityReportFilter {
  hoc_ky?: string;
  nam_hoc?: string;
  loai_hd_id?: string;
  trang_thai?: string;
  ngay_bd?: {
    gte?: Date;
    lte?: Date;
  };
}

/**
 * User with student info (for reports)
 */
export interface UserWithStudent extends NguoiDung {
  sinh_vien?: SinhVien & {
    lop?: Lop;
  };
}

// ============== Summary Types ==============

/**
 * Activity summary statistics
 */
export interface ActivitySummaryStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  avgRegistrations: number;
}

/**
 * Registration summary statistics
 */
export interface RegistrationSummaryStats {
  total: number;
  byStatus: Record<string, number>;
  byDate: Array<{
    date: string;
    count: number;
  }>;
  attendanceRate: number;
}

/**
 * Admin report response
 */
export interface AdminReportResponse {
  activities: ActivitySummaryStats;
  registrations: RegistrationSummaryStats;
  topActivities: TopActivity[];
  generatedAt: Date;
}

// ============== Repository Interface ==============

/**
 * Admin Reports Repository Interface
 */
export interface IAdminReportsRepository {
  groupActivitiesByStatus(where: ActivityReportFilter): Promise<ActivityStatusGroup[]>;
  findTopActivities(where: ActivityReportFilter): Promise<TopActivity[]>;
  groupRegistrationsByDate(where: ActivityReportFilter): Promise<RegistrationDateGroup[]>;
  findActivitiesForExport(where: ActivityReportFilter): Promise<ActivityExportData[]>;
  findRegistrationsForExport(where: ActivityReportFilter): Promise<RegistrationExportData[]>;
  findUserWithStudent(userId: number): Promise<UserWithStudent | null>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Admin Report UseCase Interface
 */
export interface IGetAdminReportUseCase {
  execute(filters: ActivityReportFilter): Promise<AdminReportResponse>;
}

/**
 * Export Activities UseCase Interface
 */
export interface IExportActivitiesUseCase {
  execute(filters: ActivityReportFilter): Promise<ActivityExportData[]>;
}

/**
 * Export Registrations UseCase Interface
 */
export interface IExportRegistrationsUseCase {
  execute(filters: ActivityReportFilter): Promise<RegistrationExportData[]>;
}

// ============== Controller Interface ==============

/**
 * Admin Reports Controller Interface
 */
export interface IAdminReportsController {
  getReport(req: unknown, res: unknown): Promise<void>;
  exportActivities(req: unknown, res: unknown): Promise<void>;
  exportRegistrations(req: unknown, res: unknown): Promise<void>;
  downloadReport?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
