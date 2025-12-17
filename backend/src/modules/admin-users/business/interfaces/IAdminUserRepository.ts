/**
 * IAdminUserRepository Interface
 * Contract for admin user data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type { Prisma, PrismaClient } from '@prisma/client';

export type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export interface UserWhereInput {
  id?: { in?: string[]; notIn?: string[] } | string;
  ten_dn?: string | { contains?: string; mode?: 'insensitive' | 'default' };
  ho_ten?: { contains?: string; mode?: 'insensitive' | 'default' };
  email?: string | { contains?: string; mode?: 'insensitive' | 'default' };
  vai_tro_id?: string;
  trang_thai?: string | { not?: string };
  OR?: Array<{
    ho_ten?: { contains?: string; mode?: 'insensitive' | 'default' };
    email?: { contains?: string; mode?: 'insensitive' | 'default' };
    ten_dn?: { contains?: string; mode?: 'insensitive' | 'default' };
  }>;
}

export interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, boolean | object>;
}

export interface VaiTroRecord {
  id: string;
  ten_vt: string;
}

export interface SinhVienRecord {
  id: string;
  nguoi_dung_id: string;
  mssv: string;
  ngay_sinh?: Date;
  gt?: string;
  lop_id?: string;
  dia_chi?: string | null;
  sdt?: string | null;
  email?: string | null;
  lop?: {
    id: string;
    ten_lop: string;
    khoa?: string;
    nien_khoa?: string;
  };
}

export interface UserRecord {
  id: string;
  ten_dn: string;
  mat_khau?: string;
  ho_ten?: string | null;
  email: string;
  vai_tro_id?: string;
  vai_tro?: VaiTroRecord | null;
  sinh_vien?: SinhVienRecord | null;
  trang_thai?: string;
  ngay_tao?: Date;
}

export interface UserCreateData {
  ten_dn: string;
  mat_khau: string;
  email: string;
  ho_ten: string;
  vai_tro_id: string;
  trang_thai: string;
}

export interface StudentCreateData {
  nguoi_dung_id: string;
  mssv: string;
  ngay_sinh: Date;
  gt: string;
  lop_id: string;
  dia_chi?: string | null;
  sdt?: string | null;
  email?: string | null;
}

export interface LopRecord {
  id: string;
  ten_lop: string;
  khoa?: string;
}

export interface IAdminUserRepository {
  findUsers(where: UserWhereInput, options?: QueryOptions): Promise<UserRecord[]>;
  countUsers(where: UserWhereInput): Promise<number>;
  findUserById(id: string, include?: Record<string, boolean | object>): Promise<UserRecord | null>;
  findUserByTenDn(tenDn: string): Promise<UserRecord | null>;
  findExistingUserByCredentials(maso: string, email: string): Promise<UserRecord | null>;
  createUser(userData: UserCreateData, tx?: TransactionClient | null): Promise<UserRecord>;
  updateUser(id: string, updateData: Partial<UserCreateData>): Promise<UserRecord>;
  deleteUser(tx: TransactionClient | null, id: string): Promise<void>;
  findRoleByName(roleName: string): Promise<VaiTroRecord | null>;
  upsertRole(roleName: string): Promise<VaiTroRecord>;
  findStudentByMssv(mssv: string): Promise<SinhVienRecord | null>;
  createStudent(studentData: StudentCreateData, tx: TransactionClient | null): Promise<SinhVienRecord>;
  updateStudent(studentId: string, updateData: Partial<StudentCreateData>): Promise<SinhVienRecord>;
  deleteStudent(tx: TransactionClient | null, studentId: string): Promise<void>;
  runInTransaction<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T>;
  updateClassMonitor(lopId: string, studentId: string, tx: TransactionClient | null): Promise<void>;
  findClassesAsHeadTeacher(tx: TransactionClient | null, userId: string): Promise<LopRecord[]>;
  findReplacementTeacher(tx: TransactionClient | null, userId: string): Promise<UserRecord | null>;
  updateHeadTeacherForClasses(tx: TransactionClient | null, userId: string, replacementId: string): Promise<void>;
  countActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<number>;
  findReplacementAdmin(tx: TransactionClient | null, userId: string): Promise<UserRecord | null>;
  reassignActivities(tx: TransactionClient | null, userId: string, adminId: string): Promise<void>;
  deleteActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<void>;
  countAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<number>;
  findReplacementChecker(tx: TransactionClient | null, userId: string): Promise<UserRecord | null>;
  reassignAttendanceChecker(tx: TransactionClient | null, userId: string, checkerId: string): Promise<void>;
  deleteAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<void>;
  deleteStudentRegistrations(tx: TransactionClient | null, studentId: string): Promise<void>;
  deleteStudentAttendance(tx: TransactionClient | null, studentId: string): Promise<void>;
  deleteNotificationsByUser(tx: TransactionClient | null, userId: string): Promise<void>;
  clearClassMonitorByStudent(tx: TransactionClient | null, studentId: string): Promise<void>;
}

/**
 * Abstract base class for repository implementations
 */
abstract class AdminUserRepositoryBase implements IAdminUserRepository {
  abstract findUsers(where: UserWhereInput, options?: QueryOptions): Promise<UserRecord[]>;
  abstract countUsers(where: UserWhereInput): Promise<number>;
  abstract findUserById(id: string, include?: Record<string, boolean | object>): Promise<UserRecord | null>;
  abstract findUserByTenDn(tenDn: string): Promise<UserRecord | null>;
  abstract findExistingUserByCredentials(maso: string, email: string): Promise<UserRecord | null>;
  abstract createUser(userData: UserCreateData, tx?: TransactionClient | null): Promise<UserRecord>;
  abstract updateUser(id: string, updateData: Partial<UserCreateData>): Promise<UserRecord>;
  abstract deleteUser(tx: TransactionClient | null, id: string): Promise<void>;
  abstract findRoleByName(roleName: string): Promise<VaiTroRecord | null>;
  abstract upsertRole(roleName: string): Promise<VaiTroRecord>;
  abstract findStudentByMssv(mssv: string): Promise<SinhVienRecord | null>;
  abstract createStudent(studentData: StudentCreateData, tx: TransactionClient | null): Promise<SinhVienRecord>;
  abstract updateStudent(studentId: string, updateData: Partial<StudentCreateData>): Promise<SinhVienRecord>;
  abstract deleteStudent(tx: TransactionClient | null, studentId: string): Promise<void>;
  abstract runInTransaction<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T>;
  abstract updateClassMonitor(lopId: string, studentId: string, tx: TransactionClient | null): Promise<void>;
  abstract findClassesAsHeadTeacher(tx: TransactionClient | null, userId: string): Promise<LopRecord[]>;
  abstract findReplacementTeacher(tx: TransactionClient | null, userId: string): Promise<UserRecord | null>;
  abstract updateHeadTeacherForClasses(tx: TransactionClient | null, userId: string, replacementId: string): Promise<void>;
  abstract countActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<number>;
  abstract findReplacementAdmin(tx: TransactionClient | null, userId: string): Promise<UserRecord | null>;
  abstract reassignActivities(tx: TransactionClient | null, userId: string, adminId: string): Promise<void>;
  abstract deleteActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<void>;
  abstract countAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<number>;
  abstract findReplacementChecker(tx: TransactionClient | null, userId: string): Promise<UserRecord | null>;
  abstract reassignAttendanceChecker(tx: TransactionClient | null, userId: string, checkerId: string): Promise<void>;
  abstract deleteAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<void>;
  abstract deleteStudentRegistrations(tx: TransactionClient | null, studentId: string): Promise<void>;
  abstract deleteStudentAttendance(tx: TransactionClient | null, studentId: string): Promise<void>;
  abstract deleteNotificationsByUser(tx: TransactionClient | null, userId: string): Promise<void>;
  abstract clearClassMonitorByStudent(tx: TransactionClient | null, studentId: string): Promise<void>;
}

export default AdminUserRepositoryBase;
module.exports = AdminUserRepositoryBase;
