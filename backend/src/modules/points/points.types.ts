/**
 * Points Module - Type Definitions
 * Student points and training score types
 */

import type { SinhVien, NguoiDung, Lop, DangKyHoatDong, HoatDong, LoaiHoatDong } from '@prisma/client';

// ============== Student Types ==============

/**
 * Student with user and class info
 */
export interface StudentWithDetails {
  id: number;
  mssv: string;
  nguoi_dung_id: number;
  lop_id: number | null;
  nguoi_dung?: {
    ho_ten: string | null;
    email: string | null;
  };
  lop?: {
    ten_lop: string;
    khoa: string | null;
    nien_khoa: string | null;
  };
}

// ============== Points Types ==============

/**
 * Activity type with points info
 */
export interface ActivityTypePoints {
  id: number;
  ten_loai_hd: string;
  diem_mac_dinh: number | null;
  diem_toi_da: number | null;
  mau_sac: string | null;
}

/**
 * Attended registration with activity details
 */
export interface AttendedRegistration {
  id: string;
  sv_id: number;
  hd_id: number;
  trang_thai_dk: string;
  ngay_dang_ky: Date;
  hoat_dong?: HoatDong & {
    loai_hd?: ActivityTypePoints;
  };
}

/**
 * Points by activity type/category
 */
export interface PointsByCategory {
  categoryId: number;
  categoryName: string;
  color: string | null;
  earnedPoints: number;
  maxPoints: number;
  activitiesCount: number;
  percentage: number;
}

/**
 * Student points summary
 */
export interface StudentPointsSummary {
  studentId: number;
  mssv: string;
  studentName: string | null;
  className: string | null;
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  ranking: string;
  pointsByCategory: PointsByCategory[];
  semester?: string;
}

/**
 * Points calculation result
 */
export interface PointsCalculationResult {
  totalPoints: number;
  byCategory: Record<number, {
    points: number;
    maxPoints: number;
    count: number;
  }>;
}

// ============== Ranking Types ==============

/**
 * Training score ranking level
 */
export type RankingLevel = 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu' | 'Kém';

/**
 * Ranking thresholds
 */
export interface RankingThresholds {
  excellent: number;  // >= 90
  good: number;       // >= 80
  fair: number;       // >= 65
  average: number;    // >= 50
  weak: number;       // >= 35
}

/**
 * Class ranking entry
 */
export interface ClassRankingEntry {
  rank: number;
  studentId: number;
  mssv: string;
  studentName: string | null;
  totalPoints: number;
  ranking: RankingLevel;
}

// ============== Filter Types ==============

/**
 * Points filter options
 */
export interface PointsFilterOptions {
  semester?: string;
  classId?: number;
  categoryId?: number;
}

/**
 * Parsed semester for points queries
 */
export interface ParsedSemesterFilter {
  semester: string;
  year: string;
}

/**
 * Registration status counts
 */
export interface RegistrationStatusCount {
  trang_thai_dk: string;
  _count: {
    id: number;
  };
}

// ============== Pagination Types ==============

/**
 * Points pagination options
 */
export interface PointsPaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Paginated points history
 */
export interface PaginatedPointsHistory {
  items: AttendedRegistration[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== Repository Interface ==============

/**
 * Points Repository Interface
 */
export interface IPointsRepository {
  findStudentByUserId(userId: number): Promise<StudentWithDetails | null>;
  findAttendedRegistrations(studentId: number, filters?: PointsFilterOptions): Promise<AttendedRegistration[]>;
  findAllRegistrations(studentId: number): Promise<AttendedRegistration[]>;
  getRegistrationStatusCounts(studentId: number): Promise<RegistrationStatusCount[]>;
  findRegistrationsWithPagination(
    studentId: number, 
    filters: PointsFilterOptions, 
    pagination: PointsPaginationOptions
  ): Promise<PaginatedPointsHistory>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Student Points UseCase Interface
 */
export interface IGetStudentPointsUseCase {
  execute(userId: number, semester?: string): Promise<StudentPointsSummary>;
}

/**
 * Get Points History UseCase Interface
 */
export interface IGetPointsHistoryUseCase {
  execute(userId: number, filters: PointsFilterOptions, pagination: PointsPaginationOptions): Promise<PaginatedPointsHistory>;
}

/**
 * Get Class Ranking UseCase Interface
 */
export interface IGetClassRankingUseCase {
  execute(classId: number, semester?: string): Promise<ClassRankingEntry[]>;
}

/**
 * Calculate Points UseCase Interface
 */
export interface ICalculatePointsUseCase {
  execute(registrations: AttendedRegistration[]): PointsCalculationResult;
}

// ============== Controller Interface ==============

/**
 * Points Controller Interface
 */
export interface IPointsController {
  getMyPoints(req: unknown, res: unknown): Promise<void>;
  getPointsHistory(req: unknown, res: unknown): Promise<void>;
  getClassRanking?(req: unknown, res: unknown): Promise<void>;
  getStudentPoints?(req: unknown, res: unknown): Promise<void>;
}

// ============== Utility Functions Interface ==============

/**
 * Points utility functions
 */
export interface IPointsUtils {
  calculateRanking(percentage: number): RankingLevel;
  calculatePercentage(earned: number, max: number): number;
  formatPoints(points: number): string;
}

// ============== Module Exports ==============
module.exports = {};
