/**
 * AdminUserPrismaRepository
 * Prisma implementation of IAdminUserRepository
 * Follows Dependency Inversion Principle (DIP)
 */

import AdminUserRepositoryBase, {
  IAdminUserRepository,
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
import adminUsersRepository from './admin-users.repository';

class AdminUserPrismaRepository extends AdminUserRepositoryBase implements IAdminUserRepository {
  private repository: typeof adminUsersRepository;

  constructor() {
    super();
    this.repository = adminUsersRepository;
  }

  async findUsers(where: UserWhereInput, options?: QueryOptions): Promise<UserRecord[]> {
    return this.repository.findUsers(where, options);
  }

  async countUsers(where: UserWhereInput): Promise<number> {
    return this.repository.countUsers(where);
  }

  async findUserById(id: string, include: Record<string, boolean | object> = {}): Promise<UserRecord | null> {
    return this.repository.findUserById(id, include);
  }

  async findUserByTenDn(tenDn: string): Promise<UserRecord | null> {
    return this.repository.findUserByTenDn(tenDn);
  }

  async findExistingUserByCredentials(maso: string, email: string): Promise<UserRecord | null> {
    return this.repository.findExistingUserByCredentials(maso, email);
  }

  async createUser(userData: UserCreateData, tx: TransactionClient | null = null): Promise<UserRecord> {
    return this.repository.createUser(userData, tx);
  }

  async updateUser(id: string, updateData: Partial<UserCreateData>): Promise<UserRecord> {
    return this.repository.updateUser(id, updateData);
  }

  async deleteUser(tx: TransactionClient | null, id: string): Promise<void> {
    return this.repository.deleteUser(tx, id);
  }

  async findRoleByName(roleName: string): Promise<VaiTroRecord | null> {
    return this.repository.findRoleByName(roleName);
  }

  async upsertRole(roleName: string): Promise<VaiTroRecord> {
    return this.repository.upsertRole(roleName);
  }

  async findStudentByMssv(mssv: string): Promise<SinhVienRecord | null> {
    return this.repository.findStudentByMssv(mssv);
  }

  async createStudent(studentData: StudentCreateData, tx: TransactionClient | null): Promise<SinhVienRecord> {
    return this.repository.createStudent(studentData, tx);
  }

  async updateStudent(studentId: string, updateData: Partial<StudentCreateData>): Promise<SinhVienRecord> {
    return this.repository.updateStudent(studentId, updateData);
  }

  async deleteStudent(tx: TransactionClient | null, studentId: string): Promise<void> {
    return this.repository.deleteStudent(tx, studentId);
  }

  async runInTransaction<T>(callback: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return this.repository.runInTransaction(callback);
  }

  async updateClassMonitor(lopId: string, studentId: string, tx: TransactionClient | null): Promise<void> {
    return this.repository.updateClassMonitor(lopId, studentId, tx);
  }

  async findClassesAsHeadTeacher(tx: TransactionClient | null, userId: string): Promise<LopRecord[]> {
    return this.repository.findClassesAsHeadTeacher(tx, userId);
  }

  async findReplacementTeacher(tx: TransactionClient | null, userId: string): Promise<UserRecord | null> {
    return this.repository.findReplacementTeacher(tx, userId);
  }

  async updateHeadTeacherForClasses(tx: TransactionClient | null, userId: string, replacementId: string): Promise<void> {
    return this.repository.updateHeadTeacherForClasses(tx, userId, replacementId);
  }

  async countActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<number> {
    return this.repository.countActivitiesByCreator(tx, userId);
  }

  async findReplacementAdmin(tx: TransactionClient | null, userId: string): Promise<UserRecord | null> {
    return this.repository.findReplacementAdmin(tx, userId);
  }

  async reassignActivities(tx: TransactionClient | null, userId: string, adminId: string): Promise<void> {
    return this.repository.reassignActivities(tx, userId, adminId);
  }

  async deleteActivitiesByCreator(tx: TransactionClient | null, userId: string): Promise<void> {
    return this.repository.deleteActivitiesByCreator(tx, userId);
  }

  async countAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<number> {
    return this.repository.countAttendanceByChecker(tx, userId);
  }

  async findReplacementChecker(tx: TransactionClient | null, userId: string): Promise<UserRecord | null> {
    return this.repository.findReplacementChecker(tx, userId);
  }

  async reassignAttendanceChecker(tx: TransactionClient | null, userId: string, checkerId: string): Promise<void> {
    return this.repository.reassignAttendanceChecker(tx, userId, checkerId);
  }

  async deleteAttendanceByChecker(tx: TransactionClient | null, userId: string): Promise<void> {
    return this.repository.deleteAttendanceByChecker(tx, userId);
  }

  async deleteStudentRegistrations(tx: TransactionClient | null, studentId: string): Promise<void> {
    return this.repository.deleteStudentRegistrations(tx, studentId);
  }

  async deleteStudentAttendance(tx: TransactionClient | null, studentId: string): Promise<void> {
    return this.repository.deleteStudentAttendance(tx, studentId);
  }

  async deleteNotificationsByUser(tx: TransactionClient | null, userId: string): Promise<void> {
    return this.repository.deleteNotificationsByUser(tx, userId);
  }

  async clearClassMonitorByStudent(tx: TransactionClient | null, studentId: string): Promise<void> {
    return this.repository.clearClassMonitorByStudent(tx, studentId);
  }
}

export default AdminUserPrismaRepository;
module.exports = AdminUserPrismaRepository;
