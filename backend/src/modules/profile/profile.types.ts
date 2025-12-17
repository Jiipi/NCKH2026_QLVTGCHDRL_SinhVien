/**
 * Profile Module - Type Definitions
 * User profile management types
 */

import type { NguoiDung, VaiTro, SinhVien, Lop } from '@prisma/client';

// ============== Entity Types ==============

/**
 * User with role and student info
 */
export interface UserWithProfile extends NguoiDung {
  vai_tro?: {
    id: number;
    ten_vt: string;
    mo_ta: string | null;
    quyen_han?: unknown;
  };
  sinh_vien?: SinhVien & {
    lop?: Lop;
  };
}

/**
 * Student with class monitor info
 */
export interface StudentWithMonitorInfo extends SinhVien {
  lop_lop_truongTosinhVien?: Lop[];
}

/**
 * Class with monitor
 */
export interface ClassWithMonitor extends Lop {
  sinh_viens?: SinhVien[];
}

// ============== DTO Types ==============

/**
 * Update Profile DTO
 */
export interface UpdateProfileDto {
  ho_ten?: string;
  email?: string;
  so_dien_thoai?: string | null;
  dia_chi?: string | null;
  ngay_sinh?: Date | string | null;
  gioi_tinh?: string | null;
  anh_dai_dien?: string | null;
}

/**
 * Change Password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Profile Response DTO
 */
export interface ProfileDto {
  id: number;
  ten_dn: string;
  ho_ten: string | null;
  email: string | null;
  so_dien_thoai: string | null;
  dia_chi: string | null;
  ngay_sinh: Date | null;
  gioi_tinh: string | null;
  anh_dai_dien: string | null;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  student?: {
    id: number;
    mssv: string;
    lop?: {
      id: number;
      ten_lop: string;
      khoa: string | null;
    };
    isMonitor: boolean;
  };
}

// ============== Repository Interface ==============

/**
 * Profile Repository Interface
 */
export interface IProfileRepository {
  findUserById(userId: number): Promise<UserWithProfile | null>;
  updateUser(userId: number, data: Partial<NguoiDung>): Promise<UserWithProfile>;
  findByEmail(email: string, excludeUserId?: number): Promise<NguoiDung | null>;
  updatePassword(userId: number, hashedPassword: string): Promise<NguoiDung>;
  findStudentWithMonitorInfo(userId: number): Promise<StudentWithMonitorInfo | null>;
  findClassWithMonitor(lopId: number): Promise<ClassWithMonitor | null>;
}

// ============== UseCase Interfaces ==============

/**
 * Get Profile UseCase Interface
 */
export interface IGetProfileUseCase {
  execute(userId: number): Promise<ProfileDto>;
}

/**
 * Update Profile UseCase Interface
 */
export interface IUpdateProfileUseCase {
  execute(userId: number, data: UpdateProfileDto): Promise<ProfileDto>;
}

/**
 * Change Password UseCase Interface
 */
export interface IChangePasswordUseCase {
  execute(userId: number, data: ChangePasswordDto): Promise<{ message: string }>;
}

/**
 * Upload Avatar UseCase Interface
 */
export interface IUploadAvatarUseCase {
  execute(userId: number, file: unknown): Promise<{ avatarUrl: string }>;
}

// ============== Controller Interface ==============

/**
 * Profile Controller Interface
 */
export interface IProfileController {
  getProfile(req: unknown, res: unknown): Promise<void>;
  updateProfile(req: unknown, res: unknown): Promise<void>;
  changePassword(req: unknown, res: unknown): Promise<void>;
  uploadAvatar(req: unknown, res: unknown): Promise<void>;
}

// ============== Module Exports ==============
module.exports = {};
