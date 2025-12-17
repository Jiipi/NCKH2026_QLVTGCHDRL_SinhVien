/**
 * Teachers Module - Type Definitions
 * Teacher-specific operations types
 */

import type { NguoiDung, Lop, SinhVien, HoatDong, DangKyHoatDong } from '@prisma/client';

// ============== Dashboard Types ==============

/**
 * Teacher dashboard statistics
 */
export interface TeacherDashboardStats {
  totalClasses: number;
  totalStudents: number;
  pendingRegistrations: number;
  upcomingActivities: number;
  classStats?: ClassStats[];
}

/**
 * Class statistics
 */
export interface ClassStats {
  className?: string;
  studentCount?: number;
  attendanceRate?: number;
  avgPoints?: number;
  // Required fields for reports
  totalStudents: number;
  totalActivities: number;
  approvedActivities: number;
  totalRegistrations: number;
  approvedRegistrations: number;
}

// ============== Class Types ==============

/**
 * Teacher class info
 */
export interface TeacherClass {
  id: string;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  studentCount?: number;
  monitor?: {
    id: string;
    mssv: string;
    name: string | null;
  };
}

/**
 * Teacher class include options
 */
export interface TeacherClassIncludeOptions {
  students?: boolean;
  monitor?: boolean;
}

// ============== Student Types ==============

/**
 * Teacher student filters
 */
export interface TeacherStudentFilters {
  classId?: string;
  className?: string;
  search?: string;
  semester?: string;
}

/**
 * Teacher student info
 */
export interface TeacherStudent {
  id: string;
  mssv: string;
  nguoi_dung_id: string;
  lop_id: string | null;
  name: string | null;
  email: string | null;
  className: string | null;
  totalPoints?: number;
}

// ============== Activity Types ==============

/**
 * Pending activity for teacher
 */
export interface PendingActivity {
  id: string;
  ten_hd: string;
  ngay_bd: Date;
  registrationCount: number;
  pendingCount: number;
}

// ============== Registration Types ==============

/**
 * Class registration filters
 */
export interface ClassRegistrationFilters {
  status?: string;
  activityId?: string;
  semester?: string;
}

/**
 * Class registration entry
 */
export interface ClassRegistration {
  id: string;
  studentId: string;
  studentName: string | null;
  mssv: string;
  activityName: string;
  status: string;
  registrationDate: Date;
}

// ============== Repository Interface ==============

/**
 * Teacher Repository Interface (Composition Pattern)
 */
export interface ITeacherRepository {
  // Dashboard
  getDashboardStats(teacherId: number, semester?: string | null, classId?: number | null): Promise<TeacherDashboardStats>;
  getClassStats(className: string, semesterId?: string | null): Promise<ClassStats>;
  
  // Classes
  getTeacherClasses(teacherId: number, include?: TeacherClassIncludeOptions): Promise<TeacherClass[]>;
  getTeacherClassNames(teacherId: number): Promise<string[]>;
  hasAccessToClass(teacherId: number, className: string): Promise<boolean>;
  assignClassMonitor(teacherId: number, classId: number, studentId: number): Promise<Lop>;
  
  // Students
  getTeacherStudents(teacherId: number, filters?: TeacherStudentFilters): Promise<TeacherStudent[]>;
  exportStudents(teacherId: number): Promise<TeacherStudent[]>;
  createStudent(teacherId: number, payload: unknown): Promise<SinhVien>;
  
  // Activities
  getPendingActivitiesList(teacherId: number, semester?: string | null, limit?: number, classId?: number | null): Promise<PendingActivity[]>;
  countActivitiesForTeacherClassesStrict(teacherId: number, semesterId?: string | null): Promise<number>;
  
  // Registrations
  getClassRegistrations(classIds: number[], filters?: ClassRegistrationFilters): Promise<ClassRegistration[]>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Teacher Dashboard UseCase Interface
 */
export interface IGetTeacherDashboardUseCase {
  execute(teacherId: number, semester?: string, classId?: number): Promise<TeacherDashboardStats>;
}

/**
 * Get Teacher Classes UseCase Interface
 */
export interface IGetTeacherClassesUseCase {
  execute(teacherId: number, include?: TeacherClassIncludeOptions): Promise<TeacherClass[]>;
}

/**
 * Get Teacher Students UseCase Interface
 */
export interface IGetTeacherStudentsUseCase {
  execute(teacherId: number, filters?: TeacherStudentFilters): Promise<TeacherStudent[]>;
}

// ============== Controller Interface ==============

/**
 * Teachers Controller Interface
 */
export interface ITeachersController {
  getDashboard(req: unknown, res: unknown): Promise<void>;
  getClasses(req: unknown, res: unknown): Promise<void>;
  getStudents(req: unknown, res: unknown): Promise<void>;
  getPendingActivities(req: unknown, res: unknown): Promise<void>;
  assignMonitor(req: unknown, res: unknown): Promise<void>;
  exportStudents?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
