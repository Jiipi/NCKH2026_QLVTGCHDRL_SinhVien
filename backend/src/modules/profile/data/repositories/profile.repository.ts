import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { NguoiDung } from '@prisma/client';
import IProfileRepository, {
  type UserWithRelations,
  type StudentWithMonitorInfo,
  type ClassWithMonitor
} from '../../business/interfaces/IProfileRepository';
import type { UpdateProfileData } from '../../business/dto/UpdateProfileDto';

/**
 * Profile Repository
 * Data access layer for profile operations
 * Follows Repository Pattern
 */
class ProfileRepository extends IProfileRepository {
  async findUserById(userId: string): Promise<UserWithRelations | null> {
    return await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        vai_tro: {
          select: {
            id: true,
            ten_vt: true,
            mo_ta: true,
            quyen_han: true
          }
        },
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async updateUser(userId: string, data: UpdateProfileData): Promise<UserWithRelations> {
    return await prisma.nguoiDung.update({
      where: { id: userId },
      data,
      include: {
        vai_tro: {
          select: {
            id: true,
            ten_vt: true,
            mo_ta: true
          }
        },
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async findByEmail(email: string, excludeUserId: string | null = null): Promise<NguoiDung | null> {
    const where: { email: string; id?: { not: string } } = { email };
    if (excludeUserId) {
      where.id = { not: excludeUserId };
    }
    return await prisma.nguoiDung.findFirst({ where });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<NguoiDung> {
    return await prisma.nguoiDung.update({
      where: { id: userId },
      data: { mat_khau: hashedPassword }
    });
  }

  async findStudentWithMonitorInfo(userId: string): Promise<StudentWithMonitorInfo | null> {
    return await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      include: {
        lop_truong: true
      }
    });
  }

  async findClassWithMonitor(lopId: string): Promise<ClassWithMonitor | null> {
    return await prisma.lop.findUnique({
      where: { id: lopId },
      include: {
        sinh_viens: {
          where: {
            id: {
              equals: (prisma.lop.fields as any).lop_truong
            }
          },
          include: {
            nguoi_dung: {
              select: {
                ho_ten: true
              }
            }
          },
          take: 1
        }
      }
    });
  }
}

const profileRepository = new ProfileRepository();
export default profileRepository;
module.exports = profileRepository;
