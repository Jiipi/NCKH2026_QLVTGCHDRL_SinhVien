/**
 * Admin Users Repository - Pure Data Access Layer
 * Prisma implementation for admin user operations
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { Prisma } from '@prisma/client';
import type { 
  UserWhereInput, 
  QueryOptions, 
  UserRecord, 
  VaiTroRecord, 
  SinhVienRecord, 
  UserCreateData, 
  StudentCreateData, 
  LopRecord,
  TransactionClient 
} from '../../business/interfaces/IAdminUserRepository';

const adminUsersRepository = {
  async findUsers(where: UserWhereInput, options?: QueryOptions): Promise<UserRecord[]> {
    const userWhere = where as Prisma.NguoiDungWhereInput;
    // Include relations needed for mapping
    const include = {
      vai_tro: {
        select: {
          id: true,
          ten_vt: true,
          quyen_han: true
        }
      },
      sinh_vien: {
        include: {
          lop: {
            select: {
              ten_lop: true,
              khoa: true,
              nien_khoa: true
            }
          }
        }
      },
      _count: {
        select: {
          lops_chu_nhiem: true,
          hoat_dong_tao: true
        }
      }
    };

    // Merge include with options if options has include
    const finalOptions = {
      ...options,
      include: options?.include ? { ...include, ...options.include } : include
    };

    return prisma.nguoiDung.findMany({ where: userWhere, ...finalOptions }) as unknown as UserRecord[];
  },

  async countUsers(where: UserWhereInput): Promise<number> {
    return prisma.nguoiDung.count({ where: where as Prisma.NguoiDungWhereInput });
  },

  async findUserById(id: string, include: Record<string, boolean | object> = {}): Promise<UserRecord | null> {
    const defaultInclude = {
      vai_tro: true,
      sinh_vien: {
        include: {
          lop: true
        }
      }
    };
    return prisma.nguoiDung.findUnique({
      where: { id },
      include: Object.keys(include).length > 0 ? include : defaultInclude
    }) as unknown as UserRecord | null;
  },

  async findUserByTenDn(tenDn: string): Promise<UserRecord | null> {
    return prisma.nguoiDung.findFirst({
      where: { ten_dn: tenDn }
    }) as unknown as UserRecord | null;
  },

  async findExistingUserByCredentials(maso: string, email: string): Promise<UserRecord | null> {
    // Tìm trong bảng nguoiDung theo ten_dn (maso được dùng làm ten_dn) hoặc email
    // Lưu ý: mssv chỉ có trong bảng sinh_vien, không có trong nguoiDung
    return prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { ten_dn: maso },
          { email }
        ]
      }
    }) as unknown as UserRecord | null;
  },

  async createUser(userData: UserCreateData, tx: TransactionClient | null = null): Promise<UserRecord> {
    const client = tx || prisma;
    return client.nguoiDung.create({ data: userData as Prisma.NguoiDungUncheckedCreateInput }) as unknown as UserRecord;
  },

  async updateUser(id: string, updateData: Partial<UserCreateData>): Promise<UserRecord> {
    return prisma.nguoiDung.update({
      where: { id },
      data: updateData as Prisma.NguoiDungUncheckedUpdateInput
    }) as unknown as UserRecord;
  },

  async deleteUser(tx: TransactionClient | null, id: string): Promise<void> {
    const client = tx || prisma;
    await client.nguoiDung.delete({ where: { id } });
  },

  async findRoleByName(roleName: string): Promise<VaiTroRecord | null> {
    return prisma.vaiTro.findFirst({ where: { ten_vt: roleName } }) as unknown as VaiTroRecord | null;
  },

  async upsertRole(roleName: string): Promise<VaiTroRecord> {
    return prisma.vaiTro.upsert({
      where: { ten_vt: roleName },
      update: {},
      create: { ten_vt: roleName }
    }) as unknown as VaiTroRecord;
  },

  async findStudentByMssv(mssv: string): Promise<SinhVienRecord | null> {
    return prisma.sinhVien.findFirst({
      where: { mssv }
    }) as unknown as SinhVienRecord | null;
  },

  async createStudent(studentData: StudentCreateData, tx: TransactionClient | null): Promise<SinhVienRecord> {
    const client = tx || prisma;
    return client.sinhVien.create({ data: studentData as Prisma.SinhVienUncheckedCreateInput }) as unknown as SinhVienRecord;
  },

  async updateStudent(studentId: string, updateData: Partial<StudentCreateData>): Promise<SinhVienRecord> {
    return prisma.sinhVien.update({
      where: { id: studentId },
      data: updateData as Prisma.SinhVienUncheckedUpdateInput
    }) as unknown as SinhVienRecord;
  },

  async deleteStudent(tx: TransactionClient | null, studentId: string): Promise<void> {
    const client = tx || prisma;
    await client.sinhVien.delete({ where: { id: studentId } });
  },

  async runInTransaction<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction((tx) => callback(tx as TransactionClient)) as Promise<T>;
  },

  async updateClassMonitor(lopId: string, studentId: string, tx: TransactionClient | null): Promise<void> {
    const client = tx || prisma;
    await client.lop.update({
      where: { id: lopId },
      data: { lop_truong: studentId }
    });
  },

  async findClassesAsHeadTeacher(tx: TransactionClient | null, userId: string): Promise<LopRecord[]> {
    const client = tx || prisma;
    return client.lop.findMany({ where: { chu_nhiem: userId } }) as unknown as LopRecord[];
  },

  async findReplacementTeacher(tx: TransactionClient | null, userId: string): Promise<UserRecord | null> {
    const client = tx || prisma;
    // Stub - implement actual logic
    return null;
  },

  async updateHeadTeacherForClasses(tx: TransactionClient | null, userId: string, replacementId: string): Promise<void> {
    const client = tx || prisma;
    await client.lop.updateMany({
      where: { chu_nhiem: userId },
      data: { chu_nhiem: replacementId }
    });
  },

  async countActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<number> {
    const client = tx || prisma;
    return client.hoatDong.count({ where: { nguoi_tao_id: userId } });
  },

  async findReplacementAdmin(tx: TransactionClient | null, userId: string): Promise<UserRecord | null> {
    const client = tx || prisma;
    // Stub - implement actual logic
    return null;
  },

  async reassignActivities(tx: TransactionClient | null, userId: string, adminId: string): Promise<void> {
    const client = tx || prisma;
    await client.hoatDong.updateMany({
      where: { nguoi_tao_id: userId },
      data: { nguoi_tao_id: adminId }
    });
  },

  async deleteActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<void> {
    const client = tx || prisma;
    await client.hoatDong.deleteMany({ where: { nguoi_tao_id: userId } });
  },

  async countAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<number> {
    const client = tx || prisma;
    return client.diemDanh.count({ where: { nguoi_diem_danh_id: userId } });
  },

  async findReplacementChecker(tx: TransactionClient | null, userId: string): Promise<UserRecord | null> {
    const client = tx || prisma;
    // Stub - implement actual logic
    return null;
  },

  async reassignAttendanceChecker(tx: TransactionClient | null, userId: string, checkerId: string): Promise<void> {
    const client = tx || prisma;
    await client.diemDanh.updateMany({
      where: { nguoi_diem_danh_id: userId },
      data: { nguoi_diem_danh_id: checkerId }
    });
  },

  async deleteAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<void> {
    const client = tx || prisma;
    await client.diemDanh.deleteMany({ where: { nguoi_diem_danh_id: userId } });
  },

  async deleteStudentRegistrations(tx: TransactionClient | null, studentId: string): Promise<void> {
    const client = tx || prisma;
    await client.dangKyHoatDong.deleteMany({ where: { sv_id: studentId } });
  },

  async deleteStudentAttendance(tx: TransactionClient | null, studentId: string): Promise<void> {
    const client = tx || prisma;
    await client.diemDanh.deleteMany({ where: { sv_id: studentId } });
  },

  async deleteNotificationsByUser(tx: TransactionClient | null, userId: string): Promise<void> {
    const client = tx || prisma;
    await client.thongBao.deleteMany({
      where: {
        OR: [
          { nguoi_gui_id: userId },
          { nguoi_nhan_id: userId }
        ]
      }
    });
  },

  async clearClassMonitorByStudent(tx: TransactionClient | null, studentId: string): Promise<void> {
    const client = tx || prisma;
    await client.lop.updateMany({
      where: { lop_truong: studentId },
      data: { lop_truong: null }
    });
  }
};

export default adminUsersRepository;
module.exports = adminUsersRepository;
