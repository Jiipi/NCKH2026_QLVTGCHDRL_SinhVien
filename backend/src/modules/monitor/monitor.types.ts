/**
 * Monitor Module - Type Definitions
 * Class monitor (Lớp trưởng) operations types
 */

import type { SinhVien, NguoiDung, Lop, DangKyHoatDong, HoatDong } from '@prisma/client';

// ============== Student Types ==============

/**
 * Student with user info for monitor view
 */
export interface MonitorStudentInfo {
  id: number;
  mssv: string;
  nguoi_dung_id: number;
  lop_id: number | null;
  nguoi_dung?: {
    ho_ten: string | null;
    email: string | null;
    anh_dai_dien: string | null;
  };
  lop?: {
    ten_lop: string;
    khoa: string | null;
  };
}

/**
 * Student registration for monitor
 */
export interface StudentRegistration {
  id: string;
  sv_id: number;
  trang_thai_dk: string;
  ngay_dang_ky: Date;
  hoat_dong?: {
    ten_hd: string;
    diem_rl: number | null;
    ngay_bd: Date;
    ngay_kt: Date | null;
  };
}

// ============== Points Types ==============

/**
 * Class registration for points calculation
 */
export interface ClassRegistrationForPoints {
  sv_id: number;
  ngay_dang_ky: Date;
  hoat_dong?: {
    id: number;
    diem_rl: number | null;
    ngay_bd: Date;
    loai_hd?: {
      ten_loai_hd: string;
    };
  };
  sinh_vien?: {
    id: number;
    mssv: string;
    nguoi_dung?: {
      ho_ten: string | null;
    };
  };
}

/**
 * Student points summary for monitor
 */
export interface StudentPointsSummary {
  studentId: number;
  mssv: string;
  name: string | null;
  totalPoints: number;
  activitiesCount: number;
  ranking?: string;
}

/**
 * Class points ranking
 */
export interface ClassPointsRanking {
  className: string;
  totalStudents: number;
  avgPoints: number;
  students: StudentPointsSummary[];
}

// ============== Activity Filter Types ==============

/**
 * Activity filter for monitor queries
 */
export interface MonitorActivityFilter {
  hoc_ky?: string;
  nam_hoc?: string;
  loai_hd_id?: string;
}

// ============== Repository Interface ==============

/**
 * Monitor Repository Interface
 */
export interface IMonitorRepository {
  findStudentsByClass(classId: number): Promise<MonitorStudentInfo[]>;
  findStudentRegistrations(studentId: number, activityFilter?: MonitorActivityFilter): Promise<StudentRegistration[]>;
  findClassRegistrationsForPoints(classId: number, activityFilter?: MonitorActivityFilter): Promise<ClassRegistrationForPoints[]>;
  getClassPointsRanking(classId: number, semester?: string): Promise<StudentPointsSummary[]>;
  findStudentById(studentId: number): Promise<MonitorStudentInfo | null>;
  findClassByMonitor(studentId: number): Promise<Lop | null>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Class Students UseCase Interface
 */
export interface IGetClassStudentsUseCase {
  execute(monitorUserId: number): Promise<MonitorStudentInfo[]>;
}

/**
 * Get Student Points UseCase Interface
 */
export interface IGetStudentPointsUseCase {
  execute(monitorUserId: number, studentId: number, semester?: string): Promise<StudentPointsSummary>;
}

/**
 * Get Class Ranking UseCase Interface
 */
export interface IGetClassRankingUseCase {
  execute(monitorUserId: number, semester?: string): Promise<ClassPointsRanking>;
}

/**
 * Get Student Activities UseCase Interface
 */
export interface IGetStudentActivitiesUseCase {
  execute(monitorUserId: number, studentId: number, filters?: MonitorActivityFilter): Promise<StudentRegistration[]>;
}

// ============== Controller Interface ==============

/**
 * Monitor Controller Interface
 */
export interface IMonitorController {
  getClassStudents(req: unknown, res: unknown): Promise<void>;
  getStudentPoints(req: unknown, res: unknown): Promise<void>;
  getClassRanking(req: unknown, res: unknown): Promise<void>;
  getStudentActivities(req: unknown, res: unknown): Promise<void>;
  exportClassReport?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
