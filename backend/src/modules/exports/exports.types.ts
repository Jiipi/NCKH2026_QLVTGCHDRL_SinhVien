/**
 * Exports Module - Type Definitions
 * Data export operations types
 */

import type { HoatDong, DangKyHoatDong, SinhVien, NguoiDung } from '@prisma/client';

// ============== Activity Export Types ==============

/**
 * Activity status group for export
 */
export interface ActivityStatusGroup {
  trang_thai: string;
  _count: {
    _all: number;
  };
}

/**
 * Top activity for export
 */
export interface TopActivityExport {
  id: number;
  ten_hd: string;
  ngay_bd: Date;
  dang_ky_hd?: Array<{ id: string }>;
}

/**
 * Activity for export
 */
export interface ActivityForExport {
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

// ============== Registration Export Types ==============

/**
 * Registration date group
 */
export interface RegistrationDateGroup {
  ngay_dang_ky: Date;
  _count: {
    _all: number;
  };
}

/**
 * Registration for export
 */
export interface RegistrationForExport {
  id: string;
  sv_id: number;
  trang_thai_dk: string;
  ngay_dang_ky: Date;
  sinh_vien?: SinhVien & {
    nguoi_dung?: NguoiDung;
  };
  hoat_dong?: HoatDong;
}

// ============== Export Filter Types ==============

/**
 * Activity export filter
 */
export interface ActivityExportFilter {
  hoc_ky?: string;
  nam_hoc?: string;
  loai_hd_id?: string;
  trang_thai?: string;
  ngay_bd?: {
    gte?: Date;
    lte?: Date;
  };
}

// ============== Export Format Types ==============

/**
 * Export format options
 */
export type ExportFormat = 'xlsx' | 'csv' | 'json';

/**
 * Export options
 */
export interface ExportOptions {
  format?: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
}

// ============== Repository Interface ==============

/**
 * Exports Repository Interface
 */
export interface IExportsRepository {
  groupActivitiesByStatus(activityWhere: ActivityExportFilter): Promise<ActivityStatusGroup[]>;
  findTopActivities(activityWhere: ActivityExportFilter, limit?: number): Promise<TopActivityExport[]>;
  groupRegistrationsByDate(activityWhere: ActivityExportFilter): Promise<RegistrationDateGroup[]>;
  findActivitiesForExport(activityWhere: ActivityExportFilter, useOrderBy?: boolean): Promise<ActivityForExport[]>;
  findRegistrationsForExport(activityWhere: ActivityExportFilter, limit?: number): Promise<RegistrationForExport[]>;
}

// ============== UseCase Interfaces ==============

/**
 * Export Activities UseCase Interface
 */
export interface IExportActivitiesUseCase {
  execute(filters: ActivityExportFilter, options?: ExportOptions): Promise<Buffer | ActivityForExport[]>;
}

/**
 * Export Registrations UseCase Interface
 */
export interface IExportRegistrationsUseCase {
  execute(filters: ActivityExportFilter, options?: ExportOptions): Promise<Buffer | RegistrationForExport[]>;
}

/**
 * Generate Report UseCase Interface
 */
export interface IGenerateReportUseCase {
  execute(filters: ActivityExportFilter): Promise<{
    statusGroups: ActivityStatusGroup[];
    topActivities: TopActivityExport[];
    registrationsByDate: RegistrationDateGroup[];
  }>;
}

// ============== Controller Interface ==============

/**
 * Exports Controller Interface
 */
export interface IExportsController {
  exportActivities(req: unknown, res: unknown): Promise<void>;
  exportRegistrations(req: unknown, res: unknown): Promise<void>;
  exportStudentPoints?(req: unknown, res: unknown): Promise<void>;
  generateReport?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
