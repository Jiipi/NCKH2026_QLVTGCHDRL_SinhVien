/**
 * IExportRepository
 * Interface for export data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { Prisma } from '@prisma/client';

export interface StatusGroupResult {
  trang_thai: string;
  _count: { _all: number };
}

export interface TopActivityResult {
  id: string;
  ten_hd: string;
  ngay_bd?: Date;
  dang_ky_hd: { id: string }[];
}

export interface DailyRegResult {
  ngay_dang_ky: Date;
  _count: { _all: number };
}

export interface ActivityExportRow {
  id: string;
  ma_hd?: string | null;
  ten_hd: string;
  diem_rl?: number | null;
  trang_thai?: string;
  ngay_bd?: Date;
  ngay_kt?: Date;
  loai_hd?: { ten_loai_hd?: string } | null;
}

export interface RegistrationExportRow {
  id: string;
  trang_thai_dk?: string;
  ngay_dang_ky?: Date;
  sinh_vien?: {
    nguoi_dung?: {
      ho_ten?: string | null;
      email?: string;
    };
  } | null;
  hoat_dong?: {
    ten_hd?: string;
  } | null;
}

export type ActivityWhereInput = Prisma.HoatDongWhereInput;

export interface IExportRepository {
  groupActivitiesByStatus(activityWhere: ActivityWhereInput): Promise<StatusGroupResult[]>;
  findTopActivities(activityWhere: ActivityWhereInput, limit?: number): Promise<TopActivityResult[]>;
  groupRegistrationsByDate(activityWhere: ActivityWhereInput): Promise<DailyRegResult[]>;
  findActivitiesForExport(activityWhere: ActivityWhereInput, useOrderBy?: boolean): Promise<ActivityExportRow[]>;
  findRegistrationsForExport(activityWhere: ActivityWhereInput, limit?: number): Promise<RegistrationExportRow[]>;
}

/**
 * Abstract base class for export repository implementations
 */
abstract class ExportRepositoryBase implements IExportRepository {
  abstract groupActivitiesByStatus(activityWhere: ActivityWhereInput): Promise<StatusGroupResult[]>;
  abstract findTopActivities(activityWhere: ActivityWhereInput, limit?: number): Promise<TopActivityResult[]>;
  abstract groupRegistrationsByDate(activityWhere: ActivityWhereInput): Promise<DailyRegResult[]>;
  abstract findActivitiesForExport(activityWhere: ActivityWhereInput, useOrderBy?: boolean): Promise<ActivityExportRow[]>;
  abstract findRegistrationsForExport(activityWhere: ActivityWhereInput, limit?: number): Promise<RegistrationExportRow[]>;
}

export default ExportRepositoryBase;
module.exports = ExportRepositoryBase;
