/**
 * Admin Users Module Type Definitions
 */

import type { NguoiDung, VaiTro, SinhVien, Lop } from '@prisma/client';

// ==================== ENTITY TYPES ====================

export interface UserWithRelations extends NguoiDung {
  vai_tro: VaiTro | null;
  sinh_vien: (SinhVien & { lop: Lop | null }) | null;
}

// ==================== DTO TYPES ====================

export interface CreateUserDto {
  ten_dn: string;
  mat_khau: string;
  ho_ten: string;
  email?: string;
  sdt?: string;
  gioi_tinh?: boolean;
  ngay_sinh?: Date;
  dia_chi?: string;
  vai_tro_id?: string;
}

export interface UpdateUserDto {
  ho_ten?: string;
  email?: string;
  sdt?: string;
  gioi_tinh?: boolean;
  ngay_sinh?: Date;
  dia_chi?: string;
  vai_tro_id?: string;
  trang_thai?: string;
  anh_dai_dien?: string;
}

export interface UserDto {
  id: string;
  ten_dn: string;
  ho_ten: string | null;
  email: string | null;
  sdt: string | null;
  gioi_tinh: boolean | null;
  ngay_sinh: Date | null;
  dia_chi: string | null;
  vai_tro_id: string | null;
  vai_tro?: {
    id: string;
    ten_vt: string;
    mo_ta: string | null;
  };
  trang_thai: string;
  anh_dai_dien: string | null;
  ngay_tao: Date;
  lan_cuoi_dn: Date | null;
}

export interface UserFilterOptions {
  vai_tro_id?: string;
  trang_thai?: string;
  search?: string;
}

// ==================== USE CASE INTERFACES ====================

export interface IGetUsersUseCase {
  execute(filters: UserFilterOptions, pagination: any, user: any): Promise<any>;
}

export interface IGetUserByIdUseCase {
  execute(id: string, user: any): Promise<UserDto>;
}

export interface ICreateUserUseCase {
  execute(dto: CreateUserDto, user: any): Promise<UserDto>;
}

export interface IUpdateUserUseCase {
  execute(id: string, dto: UpdateUserDto, user: any): Promise<UserDto>;
}

export interface IDeleteUserUseCase {
  execute(id: string, user: any): Promise<void>;
}

export interface IToggleUserStatusUseCase {
  execute(id: string, user: any): Promise<UserDto>;
}
