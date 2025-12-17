import type { NguoiDung, SinhVien, Lop } from '@prisma/client';
import type { UpdateProfileData } from '../dto/UpdateProfileDto';

/**
 * IProfileRepository
 * Interface for profile data access
 * Follows Dependency Inversion Principle (DIP)
 */

export interface UserWithRelations extends NguoiDung {
  vai_tro?: {
    id: string;
    ten_vt: string;
    mo_ta: string | null;
    quyen_han?: unknown;
  } | null;
  sinh_vien?: (SinhVien & {
    lop?: Lop | null;
  }) | null;
}

export interface StudentWithMonitorInfo extends SinhVien {
  lop_lop_truongTosinhVien?: Lop | null;
}

export interface ClassWithMonitor extends Lop {
  sinh_viens?: (SinhVien & {
    nguoi_dung?: {
      ho_ten: string | null;
    } | null;
  })[];
}

abstract class IProfileRepository {
  abstract findUserById(userId: string): Promise<UserWithRelations | null>;

  abstract updateUser(userId: string, data: UpdateProfileData): Promise<UserWithRelations>;

  abstract findByEmail(email: string, excludeUserId?: string | null): Promise<NguoiDung | null>;

  abstract updatePassword(userId: string, hashedPassword: string): Promise<NguoiDung>;

  abstract findStudentWithMonitorInfo(userId: string): Promise<StudentWithMonitorInfo | null>;

  abstract findClassWithMonitor(lopId: string): Promise<ClassWithMonitor | null>;
}

export default IProfileRepository;
module.exports = IProfileRepository;
