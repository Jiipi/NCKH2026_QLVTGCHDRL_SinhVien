/**
 * Search Module - Type Definitions
 * Global search types
 */

import type { HoatDong, SinhVien, Lop, NguoiDung } from '@prisma/client';

// ============== Search Result Types ==============

/**
 * Activity search result
 */
export interface ActivitySearchResult {
  id: number;
  ten_hd: string;
  mo_ta: string | null;
  dia_diem: string | null;
  ngay_bd: Date;
  ngay_kt: Date | null;
  diem_rl: number | null;
  trang_thai: string;
  nguoi_tao?: {
    ho_ten: string | null;
    vai_tro?: {
      ten_vt: string;
    };
  };
}

/**
 * Student search result
 */
export interface StudentSearchResult {
  nguoi_dung_id: number;
  mssv: string;
  nguoi_dung?: {
    ho_ten: string | null;
    email: string | null;
    anh_dai_dien: string | null;
  };
  lop?: {
    ten_lop: string;
  };
}

/**
 * Class search result
 */
export interface ClassSearchResult {
  id: number;
  ten_lop: string;
  chu_nhiem_rel?: {
    ho_ten: string | null;
  };
  _count?: {
    sinh_viens: number;
  };
}

/**
 * Teacher search result
 */
export interface TeacherSearchResult {
  id: number;
  ho_ten: string | null;
  email: string | null;
  anh_dai_dien: string | null;
  vai_tro?: {
    ten_vt: string;
  };
}

// ============== Search Query Types ==============

/**
 * Search query options
 */
export interface SearchQueryOptions {
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Activity search filters
 */
export interface ActivitySearchFilters {
  OR?: Array<{
    ten_hd?: { contains: string; mode?: string };
    mo_ta?: { contains: string; mode?: string };
  }>;
  trang_thai?: string | { in: string[] };
}

/**
 * Student search filters
 */
export interface StudentSearchFilters {
  OR?: Array<{
    mssv?: { contains: string; mode?: string };
    nguoi_dung?: {
      ho_ten?: { contains: string; mode?: string };
    };
  }>;
}

/**
 * Class search filters
 */
export interface ClassSearchFilters {
  OR?: Array<{
    ten_lop?: { contains: string; mode?: string };
    khoa?: { contains: string; mode?: string };
  }>;
}

/**
 * Teacher search filters
 */
export interface TeacherSearchFilters {
  vai_tro_id?: number;
  OR?: Array<{
    ho_ten?: { contains: string; mode?: string };
    email?: { contains: string; mode?: string };
  }>;
}

// ============== Combined Search Result ==============

/**
 * Global search response
 */
export interface GlobalSearchResponse {
  activities: ActivitySearchResult[];
  students: StudentSearchResult[];
  classes: ClassSearchResult[];
  teachers: TeacherSearchResult[];
  totalResults: number;
}

// ============== Repository Interface ==============

/**
 * Search Repository Interface
 */
export interface ISearchRepository {
  searchActivities(filters: ActivitySearchFilters, options?: SearchQueryOptions): Promise<ActivitySearchResult[]>;
  searchStudents(filters: StudentSearchFilters, options?: SearchQueryOptions): Promise<StudentSearchResult[]>;
  searchClasses(filters: ClassSearchFilters, options?: SearchQueryOptions): Promise<ClassSearchResult[]>;
  searchTeachers(filters: TeacherSearchFilters, options?: SearchQueryOptions): Promise<TeacherSearchResult[]>;
}

// ============== UseCase Interfaces ==============

/**
 * Global Search UseCase Interface
 */
export interface IGlobalSearchUseCase {
  execute(query: string, options?: { limit?: number }): Promise<GlobalSearchResponse>;
}

/**
 * Search Activities UseCase Interface
 */
export interface ISearchActivitiesUseCase {
  execute(query: string, options?: SearchQueryOptions): Promise<ActivitySearchResult[]>;
}

/**
 * Search Students UseCase Interface
 */
export interface ISearchStudentsUseCase {
  execute(query: string, options?: SearchQueryOptions): Promise<StudentSearchResult[]>;
}

// ============== Controller Interface ==============

/**
 * Search Controller Interface
 */
export interface ISearchController {
  globalSearch(req: unknown, res: unknown): Promise<void>;
  searchActivities?(req: unknown, res: unknown): Promise<void>;
  searchStudents?(req: unknown, res: unknown): Promise<void>;
  searchClasses?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
