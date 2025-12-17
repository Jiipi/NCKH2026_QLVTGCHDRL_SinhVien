/**
 * Semesters Module - Type Definitions
 * Semester management types
 */

import type { HoatDong, Lop, NguoiDung, SinhVien } from '@prisma/client';

// ============== Semester Types ==============

/**
 * Semester option for dropdown
 */
export interface SemesterOption {
  value: string;
  label: string;
  semester: string | null;
  year: string | null;
}

/**
 * Semester filter parsed values
 */
export interface ParsedSemester {
  semester: string;
  year: string;
}

/**
 * Academic year filter
 */
export interface AcademicYearFilter {
  hoc_ky?: string;
  nam_hoc?: string;
}

// ============== Class Types for Semester Module ==============

/**
 * Class with student count and relations
 */
export interface ClassWithDetails {
  id: number;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  studentCount: number;
  teacher: {
    name: string | null;
    email: string | null;
  } | null;
  monitor: {
    mssv: string;
    name: string | null;
  } | null;
}

/**
 * Class detail response
 */
export interface ClassDetail {
  id: number;
  name: string;
  faculty: string | null;
  academicYear: string | null;
  studentCount: number;
  teacher: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
  monitor: {
    id: number;
    mssv: string;
    name: string | null;
    email: string | null;
  } | null;
}

/**
 * Student in class
 */
export interface ClassStudent {
  id: number;
  mssv: string;
  name: string | null;
  email: string | null;
  isMonitor: boolean;
}

// ============== Semester Statistics ==============

/**
 * Semester activity statistics
 */
export interface SemesterActivityStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Array<{
    typeId: number;
    typeName: string;
    count: number;
  }>;
}

/**
 * Semester registration statistics
 */
export interface SemesterRegistrationStats {
  total: number;
  byStatus: Record<string, number>;
  attendanceRate: number;
}

// ============== Repository Interface ==============

/**
 * Semester Repository Interface
 */
export interface ISemesterRepository {
  getSemesterOptions(): Promise<SemesterOption[]>;
  getAllClasses(): Promise<ClassWithDetails[]>;
  getClassDetail(classId: number): Promise<ClassDetail | null>;
  getClassStudents(classId: number): Promise<ClassStudent[]>;
  getActivityStats?(semester: string): Promise<SemesterActivityStats>;
  getRegistrationStats?(semester: string): Promise<SemesterRegistrationStats>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Semester Options UseCase Interface
 */
export interface IGetSemesterOptionsUseCase {
  execute(): Promise<SemesterOption[]>;
}

/**
 * Get Classes UseCase Interface
 */
export interface IGetClassesUseCase {
  execute(): Promise<ClassWithDetails[]>;
}

/**
 * Get Class Detail UseCase Interface
 */
export interface IGetClassDetailUseCase {
  execute(classId: number): Promise<ClassDetail | null>;
}

// ============== Validators ==============

/**
 * Semester validators interface
 */
export interface ISemesterValidators {
  validateSemesterFormat(semester: string): ParsedSemester | null;
  isValidAcademicYear(year: string): boolean;
}

// ============== Controller Interface ==============

/**
 * Semesters Controller Interface
 */
export interface ISemestersController {
  getSemesterOptions(req: unknown, res: unknown): Promise<void>;
  getAllClasses(req: unknown, res: unknown): Promise<void>;
  getClassDetail(req: unknown, res: unknown): Promise<void>;
  getClassStudents(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
