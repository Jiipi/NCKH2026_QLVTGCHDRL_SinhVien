/**
 * Users Module - Type Definitions
 * NguoiDung entity types and DTOs
 */

import type { NguoiDung, VaiTro, SinhVien, Lop } from '@prisma/client';

// ============== Entity Types ==============

/**
 * Core User entity
 */
export type User = NguoiDung;

/**
 * User with relations
 */
export interface UserWithRelations extends NguoiDung {
  vai_tro?: VaiTro;
  sinh_vien?: SinhVien & {
    lop?: Lop;
  };
}

// ============== DTO Types ==============

/**
 * Create User DTO
 */
export interface CreateUserDto {
  mssv?: string;
  ten_dn: string;
  mat_khau: string;
  ho_ten?: string;
  email?: string;
  vai_tro_id?: number;
}

/**
 * Update User DTO
 */
export interface UpdateUserDto {
  ho_ten?: string;
  email?: string;
  so_dien_thoai?: string | null;
  dia_chi?: string | null;
  ngay_sinh?: Date | string | null;
  gioi_tinh?: string | null;
  anh_dai_dien?: string | null;
  vai_tro_id?: number;
  trang_thai?: boolean;
}

/**
 * User Response DTO
 */
export interface UserDto {
  id: number;
  ten_dn: string;
  ho_ten: string | null;
  email: string | null;
  so_dien_thoai: string | null;
  anh_dai_dien: string | null;
  trang_thai: boolean;
  ngay_tao: Date;
  role?: {
    id: number;
    name: string;
  };
  student?: {
    id: number;
    mssv: string;
    lop?: {
      id: number;
      ten_lop: string;
    };
  };
}

// ============== Filter & Query Types ==============

/**
 * User filter options
 */
export interface UserFilterOptions {
  search?: string;
  vai_tro_id?: number;
  trang_thai?: boolean;
}

/**
 * User query options
 */
export interface UserQueryOptions {
  where?: UserFilterOptions & Record<string, unknown>;
  skip?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  select?: Record<string, boolean>;
}

/**
 * Paginated users result
 */
export interface PaginatedUsersResult {
  items: UserWithRelations[];
  total: number;
}

// ============== Repository Interface ==============

/**
 * Users Repository Interface
 */
export interface IUsersRepository {
  findMany(options: UserQueryOptions): Promise<PaginatedUsersResult>;
  findById(id: number, select?: Record<string, boolean>): Promise<UserWithRelations | null>;
  findByMSSV(mssv: string, select?: Record<string, boolean>): Promise<User | null>;
  findByEmail(email: string, select?: Record<string, boolean>): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: number, data: UpdateUserDto): Promise<UserWithRelations>;
  delete(id: number): Promise<User>;
  updatePassword(id: number, hashedPassword: string): Promise<User>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Users UseCase Interface
 */
export interface IGetUsersUseCase {
  execute(options: UserQueryOptions): Promise<{
    items: UserDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Get User By Id UseCase Interface
 */
export interface IGetUserByIdUseCase {
  execute(id: number): Promise<UserDto>;
}

/**
 * Create User UseCase Interface
 */
export interface ICreateUserUseCase {
  execute(data: CreateUserDto): Promise<UserDto>;
}

/**
 * Update User UseCase Interface
 */
export interface IUpdateUserUseCase {
  execute(id: number, data: UpdateUserDto): Promise<UserDto>;
}

/**
 * Delete User UseCase Interface
 */
export interface IDeleteUserUseCase {
  execute(id: number): Promise<{ message: string }>;
}

// ============== Validators ==============

/**
 * User validators interface
 */
export interface IUserValidators {
  validateCreate(data: unknown): CreateUserDto;
  validateUpdate(data: unknown): UpdateUserDto;
  validatePassword(password: string): boolean;
}

// ============== Controller Interface ==============

/**
 * Users Controller Interface
 */
export interface IUsersController {
  getUsers(req: unknown, res: unknown): Promise<void>;
  getUserById(req: unknown, res: unknown): Promise<void>;
  createUser(req: unknown, res: unknown): Promise<void>;
  updateUser(req: unknown, res: unknown): Promise<void>;
  deleteUser(req: unknown, res: unknown): Promise<void>;
  resetPassword?(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
