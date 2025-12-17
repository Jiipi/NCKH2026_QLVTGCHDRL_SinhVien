/**
 * Registrations Module - Type Definitions
 * DangKyHoatDong entity types and DTOs
 */

import type { DangKyHoatDong, HoatDong, SinhVien, NguoiDung, Lop } from '@prisma/client';

// ============== Status Types ==============

/**
 * Registration status enum (Vietnamese)
 */
export type RegistrationStatusVN = 'cho_duyet' | 'da_duyet' | 'tu_choi' | 'da_tham_gia';

/**
 * Registration status enum (English)
 */
export type RegistrationStatusEN = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ATTENDED';

/**
 * Status mapping
 */
export const STATUS_MAP: Record<RegistrationStatusEN, RegistrationStatusVN> = {
  PENDING: 'cho_duyet',
  APPROVED: 'da_duyet',
  REJECTED: 'tu_choi',
  ATTENDED: 'da_tham_gia'
};

// ============== Entity Types ==============

/**
 * Core Registration entity from Prisma
 */
export type Registration = DangKyHoatDong;

/**
 * Registration with normalized relations
 */
export interface RegistrationWithRelations extends DangKyHoatDong {
  // Unified fields (EN)
  status?: RegistrationStatusEN;
  activity?: HoatDong;
  activityId?: number;
  user?: NguoiDung;
  userId?: number;
  student?: SinhVien & {
    nguoi_dung?: NguoiDung;
    lop?: Lop;
  };
  // Legacy relations
  hoat_dong?: HoatDong;
  sinh_vien?: SinhVien & {
    nguoi_dung?: NguoiDung;
    lop?: Lop;
  };
}

// ============== DTO Types ==============

/**
 * Create Registration DTO
 */
export interface CreateRegistrationDto {
  activityId: number;
  studentId?: number;
  userId?: number;
  note?: string;
}

/**
 * Update Registration Status DTO
 */
export interface UpdateRegistrationStatusDto {
  status: RegistrationStatusEN | RegistrationStatusVN;
  note?: string;
  reviewedBy?: number;
}

/**
 * Registration Response DTO
 */
export interface RegistrationDto {
  id: string;
  sv_id: number;
  hd_id: number;
  trang_thai_dk: RegistrationStatusVN;
  status: RegistrationStatusEN;
  ngay_dang_ky: Date;
  ghi_chu: string | null;
  activity?: {
    id: number;
    ten_hd: string;
    ngay_bd: Date;
    dia_diem: string | null;
  };
  student?: {
    id: number;
    mssv: string;
    name: string | null;
    lop?: string | null;
  };
}

// ============== Filter & Query Options ==============

/**
 * Registration filter options
 */
export interface RegistrationFilterOptions {
  status?: RegistrationStatusEN | RegistrationStatusVN;
  activityId?: number;
  hd_id?: number;
  studentId?: number;
  sv_id?: number;
  semester?: string;
}

/**
 * Registration query options
 */
export interface RegistrationQueryOptions {
  where?: RegistrationFilterOptions & Record<string, unknown>;
  skip?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: RegistrationIncludeOptions;
}

/**
 * Registration include options
 */
export interface RegistrationIncludeOptions {
  activity?: boolean;
  user?: boolean;
}

/**
 * Paginated registrations result
 */
export interface PaginatedRegistrationsResult {
  items: RegistrationWithRelations[];
  total: number;
}

// ============== Repository Interface ==============

/**
 * Registrations Repository Interface
 */
export interface IRegistrationsRepository {
  findMany(options: RegistrationQueryOptions): Promise<PaginatedRegistrationsResult>;
  findById(id: string, include?: RegistrationIncludeOptions): Promise<RegistrationWithRelations | null>;
  findByStudentAndActivity(studentId: number, activityId: number): Promise<Registration | null>;
  create(data: { sv_id: number; hd_id: number; ghi_chu?: string }): Promise<Registration>;
  update(id: string, data: Partial<Registration>): Promise<Registration>;
  updateStatus(id: string, status: RegistrationStatusVN, note?: string): Promise<Registration>;
  delete(id: string): Promise<Registration>;
  countByActivity(activityId: number): Promise<number>;
  countByStudent(studentId: number): Promise<number>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Registrations UseCase Interface
 */
export interface IGetRegistrationsUseCase {
  execute(options: RegistrationQueryOptions): Promise<{
    items: RegistrationDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Get Registration By Id UseCase Interface
 */
export interface IGetRegistrationByIdUseCase {
  execute(id: string, include?: RegistrationIncludeOptions): Promise<RegistrationDto>;
}

/**
 * Create Registration UseCase Interface
 */
export interface ICreateRegistrationUseCase {
  execute(data: CreateRegistrationDto, userId: number): Promise<RegistrationDto>;
}

/**
 * Update Registration Status UseCase Interface
 */
export interface IUpdateRegistrationStatusUseCase {
  execute(id: string, data: UpdateRegistrationStatusDto): Promise<RegistrationDto>;
}

/**
 * Cancel Registration UseCase Interface
 */
export interface ICancelRegistrationUseCase {
  execute(id: string, userId: number): Promise<{ message: string }>;
}

// ============== Controller Interface ==============

/**
 * Registrations Controller Interface
 */
export interface IRegistrationsController {
  getRegistrations(req: unknown, res: unknown): Promise<void>;
  getRegistrationById(req: unknown, res: unknown): Promise<void>;
  createRegistration(req: unknown, res: unknown): Promise<void>;
  updateRegistrationStatus(req: unknown, res: unknown): Promise<void>;
  cancelRegistration(req: unknown, res: unknown): Promise<void>;
  getMyRegistrations?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
