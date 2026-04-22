/**
 * Auth Module Type Definitions
 * Provides TypeScript types for the auth module
 */

import type { NguoiDung, SinhVien, VaiTro, Lop } from '@prisma/client';

// ==================== REPOSITORY TYPES ====================

export interface UserWithRelations extends NguoiDung {
  vai_tro: VaiTro | null;
  sinh_vien: (SinhVien & { lop: Lop | null }) | null;
}

export interface StudentWithRelations extends SinhVien {
  nguoi_dung: NguoiDung & { vai_tro: VaiTro | null };
  lop: Lop | null;
}

export interface CreateUserData {
  ten_dn: string;
  mat_khau: string;
  ho_ten: string;
  email?: string | null;
  sdt?: string | null;
  gioi_tinh?: boolean | null;
  ngay_sinh?: Date | null;
  dia_chi?: string | null;
  vai_tro_id?: string | null;
}

export interface UpdateUserData {
  mat_khau?: string;
  ho_ten?: string;
  email?: string | null;
  sdt?: string | null;
  gioi_tinh?: boolean | null;
  ngay_sinh?: Date | null;
  dia_chi?: string | null;
  vai_tro_id?: string | null;
  anh_dai_dien?: string | null;
}

// ==================== DTO TYPES ====================

export interface LoginDto {
  maso: string;
  password: string;
  remember?: boolean;
}

export interface RegisterDto {
  maso: string;
  email: string;
  ho_ten: string;
  password: string;
  lop_id?: string;
  ngay_sinh?: Date;
  gioi_tinh?: boolean;
  sdt?: string;
}

export interface UserDto {
  id: string;
  maso: string;
  email: string | null;
  ho_ten: string;
  roleCode: string;
  roleName: string;
  avatar: string | null;
  status: string;
}

export interface LoginResult {
  token: string;
  user: UserDto;
}

export interface RegisterResult {
  token: string;
  user: UserDto;
}

// ==================== SERVICE INTERFACES ====================

export interface IHashService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface ITokenService {
  generateToken(user: UserWithRelations, remember?: boolean): string;
  verifyToken(token: string): Record<string, unknown> | null;
}

export interface IOtpService {
  generate(key: string): string;
  verify(key: string, otp: string): boolean;
  generateOtp(email: string): string;
  verifyOtp(email: string, otp: string, markUsed?: boolean): boolean;
}

// ==================== REPOSITORY INTERFACE ====================

export interface IAuthRepository {
  findByEmailOrMaso(emailOrMaso: string): Promise<UserWithRelations | null>;
  findUserByEmail(email: string): Promise<UserWithRelations | null>;
  findUserByMaso(maso: string): Promise<UserWithRelations | null>;
  findStudentByMssv(mssv: string): Promise<StudentWithRelations | null>;
  findUserById(id: string): Promise<UserWithRelations | null>;
  createUser(userData: CreateUserData): Promise<UserWithRelations>;
  updateUser(userId: string, updateData: UpdateUserData): Promise<UserWithRelations>;
  findRoleByName(roleName: string): Promise<VaiTro | null>;
  countUsers(): Promise<number>;
}

// ==================== USE CASE INTERFACES ====================

export interface ILoginUseCase {
  execute(dto: LoginDto, ip?: string | null, tabId?: string | null): Promise<LoginResult>;
}

export interface IRegisterUseCase {
  execute(dto: RegisterDto): Promise<RegisterResult>;
}

export interface IChangePasswordUseCase {
  execute(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}

export interface IForgotPasswordUseCase {
  execute(email: string): Promise<{ sent: boolean; otp?: string }>;
}

export interface IResetPasswordUseCase {
  execute(email: string, otp: string, newPassword: string): Promise<void>;
}

export interface IGetMeUseCase {
  execute(userId: string): Promise<UserDto>;
}
