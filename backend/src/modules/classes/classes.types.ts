/**
 * Classes Module - Type Definitions
 * Lop entity types and DTOs
 */

import type { Lop, SinhVien, NguoiDung } from '@prisma/client';

// ============== Prisma Entity Types ==============

/**
 * Core Class entity from Prisma
 */
export type Class = Lop;

/**
 * Class with student count
 */
export interface ClassWithCounts extends Class {
  total_sinh_vien?: number;
  _count?: {
    sinh_viens?: number;
    students?: number;
    activities?: number;
  };
}

/**
 * Class with full relationships
 */
export interface ClassWithRelations extends ClassWithCounts {
  sinh_viens?: SinhVien[];
  students?: Array<{
    id: number;
    mssv: string;
    fullName?: string;
    email?: string;
  }>;
  teachers?: Array<{
    id: number;
    mssv: string;
    fullName?: string;
    email?: string;
  }>;
  chu_nhiem_user?: NguoiDung;
  lop_truong_sv?: SinhVien;
}

// ============== DTO Types ==============

/**
 * Create Class DTO
 */
export interface CreateClassDto {
  name: string | null;
  ten_lop?: string;
  khoa?: string | null;
  faculty?: string | null;
  major?: string | null;
  nien_khoa?: string | null;
  academicYear?: string | null;
  semester?: string | null;
}

/**
 * Update Class DTO
 */
export interface UpdateClassDto {
  name?: string;
  ten_lop?: string;
  khoa?: string | null;
  faculty?: string | null;
  major?: string | null;
  nien_khoa?: string | null;
  academicYear?: string | null;
  chu_nhiem?: number | null;
  lop_truong?: number | null;
}

/**
 * List Classes Query DTO
 */
export interface ListClassesDto {
  page: number;
  limit: number;
  search: string | null;
  khoa: string | null;
}

/**
 * Class Response DTO
 */
export interface ClassDto {
  id: number;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  chu_nhiem: number | null;
  lop_truong: number | null;
  total_sinh_vien?: number;
}

// ============== Filter & Pagination ==============

/**
 * Class Filter Options
 */
export interface ClassFilterOptions {
  search?: string;
  khoa?: string;
}

/**
 * Class Query Options
 */
export interface ClassQueryOptions {
  where?: ClassFilterOptions & Record<string, unknown>;
  skip?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Class Include Options
 */
export interface ClassIncludeOptions {
  students?: boolean;
  teachers?: boolean;
}

/**
 * Paginated Classes Result
 */
export interface PaginatedClassesResult {
  items: ClassWithCounts[];
  total: number;
}

// ============== Repository Interface ==============

/**
 * Classes Repository Interface
 */
export interface IClassesRepository {
  findMany(options: ClassQueryOptions): Promise<PaginatedClassesResult>;
  findById(id: number, include?: ClassIncludeOptions): Promise<ClassWithRelations | null>;
  findByName(name: string): Promise<ClassWithCounts | null>;
  create(data: CreateClassDto): Promise<Class>;
  update(id: number, data: UpdateClassDto): Promise<Class>;
  delete(id: number): Promise<Class>;
  countStudents(classId: number): Promise<number>;
  addStudentToClass(classId: number, studentId: number): Promise<void>;
  removeStudentFromClass(classId: number, studentId: number): Promise<void>;
}

// ============== Service/UseCase Interfaces ==============

/**
 * Get Classes UseCase Interface
 */
export interface IGetClassesUseCase {
  execute(dto: ListClassesDto): Promise<{
    items: ClassDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Get Class By Id UseCase Interface
 */
export interface IGetClassByIdUseCase {
  execute(id: number, include?: ClassIncludeOptions): Promise<ClassDto>;
}

/**
 * Create Class UseCase Interface
 */
export interface ICreateClassUseCase {
  execute(data: CreateClassDto): Promise<ClassDto>;
}

/**
 * Update Class UseCase Interface
 */
export interface IUpdateClassUseCase {
  execute(id: number, data: UpdateClassDto): Promise<ClassDto>;
}

/**
 * Delete Class UseCase Interface
 */
export interface IDeleteClassUseCase {
  execute(id: number): Promise<{ message: string }>;
}

// ============== Controller Interface ==============

/**
 * Classes Controller Interface
 */
export interface IClassesController {
  getClasses(req: unknown, res: unknown): Promise<void>;
  getClassById(req: unknown, res: unknown): Promise<void>;
  createClass(req: unknown, res: unknown): Promise<void>;
  updateClass(req: unknown, res: unknown): Promise<void>;
  deleteClass(req: unknown, res: unknown): Promise<void>;
  getClassStudents?(req: unknown, res: unknown): Promise<void>;
  addStudentToClass?(req: unknown, res: unknown): Promise<void>;
  removeStudentFromClass?(req: unknown, res: unknown): Promise<void>;
}

// ============== Validators ==============

/**
 * Class Validator Interface
 */
export interface IClassValidator {
  validateCreate(data: unknown): CreateClassDto;
  validateUpdate(data: unknown): UpdateClassDto;
  validateListQuery(query: unknown): ListClassesDto;
}

// ============== Module Exports ==============
module.exports = {};
