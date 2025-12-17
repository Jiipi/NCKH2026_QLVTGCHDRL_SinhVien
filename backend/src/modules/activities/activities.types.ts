/**
 * Activities Module Type Definitions
 * Provides TypeScript types for the activities module
 */

import type { HoatDong, LoaiHoatDong, NguoiDung, DangKyHoatDong, SinhVien, Lop, DiemDanh, VaiTro } from '@prisma/client';

// ==================== ENTITY TYPES ====================

/**
 * Activity with all relations
 */
export interface ActivityWithRelations extends HoatDong {
  loai_hd: LoaiHoatDong | null;
  nguoi_tao_rel: NguoiDung | null;
  dang_ky_hd: DangKyHoatDongWithStudent[];
  diem_danh: DiemDanh[];
}

/**
 * Registration with student info
 */
export interface DangKyHoatDongWithStudent extends DangKyHoatDong {
  sinh_vien: SinhVien & {
    nguoi_dung: NguoiDung;
    lop: Lop | null;
  };
}

/**
 * Activity type with count
 */
export interface LoaiHoatDongWithCount extends LoaiHoatDong {
  _count?: {
    hoat_dong: number;
  };
}

// ==================== DTO TYPES ====================

/**
 * Create activity DTO
 */
export interface CreateActivityDto {
  ten_hd: string;
  mo_ta?: string;
  diem_cong?: number;
  diem_tru?: number;
  loai_hd_id: string;
  dia_diem?: string;
  thoi_gian_bat_dau: Date;
  thoi_gian_ket_thuc?: Date;
  han_dang_ky?: Date;
  so_luong_toi_da?: number;
  anh_hd?: string;
  hinh_thuc?: string;
  hoc_ky_id?: string;
  don_vi_to_chuc?: string;
  yeu_cau_tham_gia?: string;
}

/**
 * Update activity DTO
 */
export interface UpdateActivityDto {
  ten_hd?: string;
  mo_ta?: string;
  diem_cong?: number;
  diem_tru?: number;
  loai_hd_id?: string;
  dia_diem?: string;
  thoi_gian_bat_dau?: Date;
  thoi_gian_ket_thuc?: Date;
  han_dang_ky?: Date;
  so_luong_toi_da?: number;
  anh_hd?: string;
  hinh_thuc?: string;
  trang_thai?: string;
  don_vi_to_chuc?: string;
  yeu_cau_tham_gia?: string;
}

/**
 * Activity response DTO
 */
export interface ActivityDto {
  id: string;
  ten_hd: string;
  mo_ta: string | null;
  diem_cong: number;
  diem_tru: number;
  loai_hd_id: string;
  loai_hd?: {
    id: string;
    ten_loai: string;
    mo_ta: string | null;
  };
  dia_diem: string | null;
  thoi_gian_bat_dau: Date;
  thoi_gian_ket_thuc: Date | null;
  han_dang_ky: Date | null;
  so_luong_toi_da: number | null;
  so_luong_dang_ky: number;
  anh_hd: string | null;
  trang_thai: string;
  nguoi_tao: string;
  nguoi_tao_name?: string;
  ngay_tao: Date;
  ngay_cap_nhat: Date;
  hoc_ky_id: string | null;
  don_vi_to_chuc: string | null;
  hinh_thuc: string | null;
  yeu_cau_tham_gia: string | null;
  is_registered?: boolean;
  registration_status?: string;
}

/**
 * Activity list filter options
 */
export interface ActivityFilterOptions {
  loai_hd_id?: string;
  trang_thai?: string;
  hoc_ky_id?: string;
  search?: string;
  from_date?: Date;
  to_date?: Date;
  nguoi_tao?: string;
  is_available?: boolean;
}

/**
 * Registration DTO
 */
export interface RegistrationDto {
  id: string;
  hoat_dong_id: string;
  sinh_vien_id: string;
  sinh_vien?: {
    id: string;
    mssv: string;
    nguoi_dung: {
      ho_ten: string;
      email: string | null;
    };
    lop?: {
      ten_lop: string;
      khoa: string;
    };
  };
  hoat_dong?: ActivityDto;
  trang_thai: string;
  ngay_dang_ky: Date;
  ngay_duyet?: Date | null;
  nguoi_duyet?: string | null;
  ly_do_tu_choi?: string | null;
}

// ==================== PAGINATION TYPES ====================

export interface PaginationOptions {
  page?: number;
  limit?: number | 'all';
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== REPOSITORY INTERFACE ====================

export interface IActivityRepository {
  findMany(where: any, options?: PaginationOptions): Promise<PaginatedResult<ActivityWithRelations>>;
  findById(id: string, where?: any, include?: any): Promise<ActivityWithRelations | null>;
  create(data: CreateActivityDto & { nguoi_tao: string }): Promise<ActivityWithRelations>;
  update(id: string, data: UpdateActivityDto): Promise<ActivityWithRelations>;
  delete(id: string): Promise<ActivityWithRelations>;
  count(where?: any): Promise<number>;
}

export interface IRegistrationRepository {
  findByActivityAndStudent(activityId: string, studentId: string): Promise<DangKyHoatDong | null>;
  findByActivity(activityId: string): Promise<DangKyHoatDongWithStudent[]>;
  findByStudent(studentId: string): Promise<DangKyHoatDong[]>;
  create(data: { hoat_dong_id: string; sinh_vien_id: string }): Promise<DangKyHoatDong>;
  updateStatus(id: string, status: string, approverId?: string): Promise<DangKyHoatDong>;
  delete(id: string): Promise<DangKyHoatDong>;
}

// ==================== USE CASE INTERFACES ====================

export interface UserContext {
  id: string;
  role?: string;
  roleCode?: string;
  maso?: string;
  permissions?: string[];
}

export interface IGetActivitiesUseCase {
  execute(
    filters: ActivityFilterOptions,
    pagination: PaginationOptions,
    user: UserContext
  ): Promise<PaginatedResult<ActivityDto>>;
}

export interface IGetActivityByIdUseCase {
  execute(id: string, user: UserContext): Promise<ActivityDto>;
}

export interface ICreateActivityUseCase {
  execute(dto: CreateActivityDto, user: UserContext): Promise<ActivityDto>;
}

export interface IUpdateActivityUseCase {
  execute(id: string, dto: UpdateActivityDto, user: UserContext): Promise<ActivityDto>;
}

export interface IDeleteActivityUseCase {
  execute(id: string, user: UserContext): Promise<void>;
}

export interface IRegisterActivityUseCase {
  execute(activityId: string, user: UserContext): Promise<RegistrationDto>;
}

export interface ICancelRegistrationUseCase {
  execute(activityId: string, user: UserContext): Promise<void>;
}

export interface IApproveActivityUseCase {
  execute(registrationId: string, user: UserContext): Promise<RegistrationDto>;
}

export interface IRejectActivityUseCase {
  execute(registrationId: string, reason: string, user: UserContext): Promise<RegistrationDto>;
}

export interface IGetActivityQRDataUseCase {
  execute(activityId: string): Promise<{ qr_token: string; expires_at: Date }>;
}

export interface IScanAttendanceUseCase {
  execute(qrToken: string, studentId: string): Promise<{ success: boolean; message: string }>;
}
