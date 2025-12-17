/**
 * Auth Repository - Pure Data Access Layer
 * Chỉ chứa Prisma queries, không có business logic
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import { IAuthRepository, UserWithRole, UserData, RoleData, StudentData } from '../../business/interfaces/IAuthRepository';

// Extended interface for student lookup
interface StudentWithRelations {
  id: string;
  mssv: string;
  nguoi_dung_id: string;
  lop_id: string | null;
  nguoi_dung: {
    id: string;
    ten_dn: string;
    email: string | null;
    ho_ten: string;
    mat_khau: string;
    trang_thai: string;
    anh_dai_dien: string | null;
    lan_cuoi_dn: Date | null;
    vai_tro: {
      id: string;
      ten_vt: string;
      mo_ta: string | null;
    } | null;
  };
  lop: {
    id: string;
    ten_lop: string;
    khoa: string | null;
  } | null;
}

class AuthRepository implements IAuthRepository {
  async findByEmailOrMaso(emailOrMaso: string): Promise<UserWithRole | null> {
    return prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { email: emailOrMaso },
          { ten_dn: emailOrMaso }
        ]
      },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    }) as Promise<UserWithRole | null>;
  }

  async findUserByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.nguoiDung.findUnique({
      where: { email },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    }) as Promise<UserWithRole | null>;
  }

  async findUserByMaso(maso: string): Promise<UserWithRole | null> {
    return prisma.nguoiDung.findUnique({
      where: { ten_dn: maso },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    }) as Promise<UserWithRole | null>;
  }

  async findStudentByMssv(mssv: string): Promise<StudentWithRelations | null> {
    return prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          include: {
            vai_tro: true
          }
        },
        lop: true
      }
    }) as Promise<StudentWithRelations | null>;
  }

  async findUserById(id: string): Promise<UserWithRole | null> {
    return prisma.nguoiDung.findUnique({
      where: { id },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    }) as Promise<UserWithRole | null>;
  }

  async createUser(userData: UserData): Promise<UserWithRole> {
    return prisma.nguoiDung.create({
      data: userData as any,
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    }) as Promise<UserWithRole>;
  }

  async updateUser(userId: string, updateData: Partial<UserData>): Promise<UserWithRole> {
    return prisma.nguoiDung.update({
      where: { id: userId },
      data: updateData as any,
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    }) as Promise<UserWithRole>;
  }

  async createStudent(studentData: StudentData): Promise<any> {
    return prisma.sinhVien.create({
      data: studentData as any,
      include: {
        nguoi_dung: {
          include: {
            vai_tro: true
          }
        },
        lop: true
      }
    });
  }

  async findRoleByName(roleName: string): Promise<RoleData | null> {
    return prisma.vaiTro.findFirst({
      where: {
        ten_vt: {
          equals: roleName,
          mode: 'insensitive'
        }
      }
    }) as Promise<RoleData | null>;
  }

  async createRole(roleData: RoleData): Promise<RoleData> {
    return prisma.vaiTro.create({
      data: roleData as any
    }) as Promise<RoleData>;
  }

  async countUsers(): Promise<number> {
    return prisma.nguoiDung.count();
  }
}

export default new AuthRepository();
