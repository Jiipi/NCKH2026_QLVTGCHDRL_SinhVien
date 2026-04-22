/**
 * Dashboard Module - Type Definitions
 * Dashboard statistics and student info types
 */

import type { SinhVien, NguoiDung, Lop, HoatDong, DangKyHoatDong, LoaiHoatDong, HocKy } from '@prisma/client';

// ============== Student Info Types ==============

/**
 * Student info with relations
 */
export interface StudentInfo {
  id: string;
  mssv: string;
  nguoi_dung_id: string;
  lop_id: string | null;
  nguoi_dung?: {
    ho_ten: string | null;
    email: string | null;
  };
  lop?: {
    id: string;
    ten_lop: string;
    khoa: string | null;
    nien_khoa: string | null;
    chu_nhiem: string | null;
  };
}

/**
 * Class student basic info
 */
export interface ClassStudentInfo {
  id: string;
  nguoi_dung_id: string;
  mssv: string;
  lop_id: string | null;
}

// ============== Activity Types ==============

/**
 * Activity type summary for dashboard
 */
export interface ActivityTypeSummary {
  id: string;
  ten_loai_hd: string;
  diem_toi_da: number | null;
  diem_mac_dinh?: number | null;
  mau_sac?: string | null;
}

/**
 * Student registration with activity details
 */
export interface StudentRegistration {
  id: string;
  sv_id: string;
  hd_id: string;
  trang_thai_dk: string;
  ngay_dang_ky: Date;
  ngay_duyet?: Date | null;
  ly_do_tu_choi?: string | null;
  hoat_dong?: HoatDong & {
    loai_hd?: ActivityTypeSummary;
    hinh_anh?: string[];
  };
}

/**
 * Upcoming activity for dashboard
 */
export interface UpcomingActivity {
  id: string;
  ten_hd: string;
  mo_ta: string | null;
  ngay_bd: Date;
  ngay_kt: Date | null;
  dia_diem: string | null;
  trang_thai: string;
  loai_hd_id: string | null;
  loai_hd?: LoaiHoatDong;
  dang_ky_hd?: Array<{
    id: string;
    trang_thai_dk: string;
  }>;
}

// ============== Dashboard Statistics ==============

/**
 * Dashboard statistics summary
 */
export interface DashboardStats {
  totalActivities: number;
  attendedActivities: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  totalPoints: number;
  pointsByCategory: PointsByCategory[];
}

/**
 * Points by activity category
 */
export interface PointsByCategory {
  categoryId: string;
  categoryName: string;
  points: number;
  maxPoints: number;
}

/**
 * Activity filter for dashboard queries
 */
export interface DashboardActivityFilter {
  hoc_ky?: HocKy;
  nam_hoc?: string;
  trang_thai?: string;
}

/**
 * Semester filter for dashboard
 */
export interface SemesterFilter {
  hoc_ky?: HocKy;
  nam_hoc?: string;
}

// ============== Repository Interface ==============

/**
 * Dashboard Repository Interface
 */
export interface IDashboardRepository {
  getStudentInfo(userId: string): Promise<StudentInfo | null>;
  getClassStudents(lopId: string): Promise<ClassStudentInfo[]>;
  getActivityTypes(): Promise<ActivityTypeSummary[]>;
  getStudentRegistrations(svId: string, activityFilter?: DashboardActivityFilter): Promise<StudentRegistration[]>;
  getUpcomingActivities(svId: string, classCreators?: string[], semesterFilter?: SemesterFilter): Promise<UpcomingActivity[]>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Dashboard Stats UseCase Interface
 */
export interface IGetDashboardStatsUseCase {
  execute(userId: string, semester?: string): Promise<DashboardStats>;
}

/**
 * Get Upcoming Activities UseCase Interface
 */
export interface IGetUpcomingActivitiesUseCase {
  execute(userId: string, semester?: string): Promise<UpcomingActivity[]>;
}

// ============== Controller Interface ==============

/**
 * Dashboard Controller Interface
 */
export interface IDashboardController {
  getStats(req: unknown, res: unknown): Promise<void>;
  getUpcomingActivities(req: unknown, res: unknown): Promise<void>;
  getRecentRegistrations?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
