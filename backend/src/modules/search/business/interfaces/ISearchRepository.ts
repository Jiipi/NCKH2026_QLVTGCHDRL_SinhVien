/**
 * ISearchRepository
 * Interface for search data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { Prisma } from '@prisma/client';

export interface SearchOptions {
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface ActivityResult {
  id: string;
  ten_hd: string;
  mo_ta?: string | null;
  dia_diem?: string | null;
  ngay_bd?: Date;
  ngay_kt?: Date;
  diem_rl?: number;
  trang_thai?: string;
  nguoi_tao?: {
    ho_ten?: string | null;
    vai_tro?: { ten_vt?: string };
  };
  isMine?: boolean;
}

export interface StudentResult {
  nguoi_dung_id: string;
  mssv: string;
  nguoi_dung?: {
    ho_ten?: string | null;
    email?: string;
    anh_dai_dien?: string | null;
  };
  lop?: {
    ten_lop?: string;
  };
}

export interface ClassResult {
  id: string;
  ten_lop: string;
  chu_nhiem_rel?: { ho_ten?: string | null };
  _count?: { sinh_viens?: number };
}

export interface TeacherResult {
  id: string;
  ho_ten?: string | null;
  email?: string;
  anh_dai_dien?: string | null;
  vai_tro?: { ten_vt?: string };
}

export interface StudentRecord {
  id: string;
  lop_id?: string;
}

export interface ClassCreator {
  nguoi_dung_id: string;
}

export interface ClassHomeroom {
  chu_nhiem?: string | null;
}

export interface TeacherClass {
  id: string;
}

export interface ISearchRepository {
  searchActivities(filters: Prisma.HoatDongWhereInput, options?: SearchOptions): Promise<ActivityResult[]>;
  searchStudents(filters: Prisma.SinhVienWhereInput, options?: SearchOptions): Promise<StudentResult[]>;
  searchClasses(filters: Prisma.LopWhereInput, options?: SearchOptions): Promise<ClassResult[]>;
  searchTeachers(filters: Prisma.NguoiDungWhereInput, options?: SearchOptions): Promise<TeacherResult[]>;
  getStudentByUserId(userId: string): Promise<StudentRecord | null>;
  getClassCreators(classId: string): Promise<ClassCreator[]>;
  getClassHomeroom(classId: string): Promise<ClassHomeroom | null>;
  getTeacherClasses(teacherId: string): Promise<TeacherClass[]>;
}

/**
 * Abstract base class for search repository implementations
 */
abstract class SearchRepositoryBase implements ISearchRepository {
  abstract searchActivities(filters: Prisma.HoatDongWhereInput, options?: SearchOptions): Promise<ActivityResult[]>;
  abstract searchStudents(filters: Prisma.SinhVienWhereInput, options?: SearchOptions): Promise<StudentResult[]>;
  abstract searchClasses(filters: Prisma.LopWhereInput, options?: SearchOptions): Promise<ClassResult[]>;
  abstract searchTeachers(filters: Prisma.NguoiDungWhereInput, options?: SearchOptions): Promise<TeacherResult[]>;
  abstract getStudentByUserId(userId: string): Promise<StudentRecord | null>;
  abstract getClassCreators(classId: string): Promise<ClassCreator[]>;
  abstract getClassHomeroom(classId: string): Promise<ClassHomeroom | null>;
  abstract getTeacherClasses(teacherId: string): Promise<TeacherClass[]>;
}

export default SearchRepositoryBase;
module.exports = SearchRepositoryBase;
