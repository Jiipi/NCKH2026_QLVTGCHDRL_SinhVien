const IAdminUserRepository = require('../../domain/interfaces/IAdminUserRepository');
const adminUsersRepository = require('../../admin-users.repo');

/**
 * AdminUserPrismaRepository
 * Prisma implementation of IAdminUserRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class AdminUserPrismaRepository extends IAdminUserRepository {
  constructor() {
    super();
    this.repository = adminUsersRepository;
  }

  async findUsers(where, options) {
    return this.repository.findUsers(where, options);
  }

  async countUsers(where) {
    return this.repository.countUsers(where);
  }

  async findUserById(id, include = {}) {
    return this.repository.findUserById(id, include);
  }

  async findUserByTenDn(tenDn) {
    return this.repository.findUserByTenDn(tenDn);
  }

  async findExistingUserByCredentials(maso, email) {
    return this.repository.findExistingUserByCredentials(maso, email);
  }

  async createUser(userData, tx = null) {
    return this.repository.createUser(userData, tx);
  }

  async updateUser(id, updateData) {
    return this.repository.updateUser(id, updateData);
  }

  async deleteUser(tx, id) {
    return this.repository.deleteUser(tx, id);
  }

  async findRoleByName(roleName) {
    return this.repository.findRoleByName(roleName);
  }

  async upsertRole(roleName) {
    return this.repository.upsertRole(roleName);
  }

  async createStudent(studentData, tx) {
    return this.repository.createStudent(studentData, tx);
  }

  async updateStudent(studentId, updateData) {
    return this.repository.updateStudent(studentId, updateData);
  }

  async deleteStudent(tx, studentId) {
    return this.repository.deleteStudent(tx, studentId);
  }

  async runInTransaction(callback) {
    return this.repository.runInTransaction(callback);
  }

  async updateClassMonitor(lopId, studentId, tx) {
    return this.repository.updateClassMonitor(lopId, studentId, tx);
  }

  async findClassesAsHeadTeacher(tx, userId) {
    return this.repository.findClassesAsHeadTeacher(tx, userId);
  }

  async findReplacementTeacher(tx, userId) {
    return this.repository.findReplacementTeacher(tx, userId);
  }

  async updateHeadTeacherForClasses(tx, userId, replacementId) {
    return this.repository.updateHeadTeacherForClasses(tx, userId, replacementId);
  }

  async countActivitiesByCreator(tx, userId) {
    return this.repository.countActivitiesByCreator(tx, userId);
  }

  async findReplacementAdmin(tx, userId) {
    return this.repository.findReplacementAdmin(tx, userId);
  }

  async reassignActivities(tx, userId, adminId) {
    return this.repository.reassignActivities(tx, userId, adminId);
  }

  async deleteActivitiesByCreator(tx, userId) {
    return this.repository.deleteActivitiesByCreator(tx, userId);
  }

  async countAttendanceByChecker(tx, userId) {
    return this.repository.countAttendanceByChecker(tx, userId);
  }

  async findReplacementChecker(tx, userId) {
    return this.repository.findReplacementChecker(tx, userId);
  }

  async reassignAttendanceChecker(tx, userId, checkerId) {
    return this.repository.reassignAttendanceChecker(tx, userId, checkerId);
  }

  async deleteAttendanceByChecker(tx, userId) {
    return this.repository.deleteAttendanceByChecker(tx, userId);
  }

  async deleteStudentRegistrations(tx, studentId) {
    return this.repository.deleteStudentRegistrations(tx, studentId);
  }

  async deleteStudentAttendance(tx, studentId) {
    return this.repository.deleteStudentAttendance(tx, studentId);
  }

  async deleteNotificationsByUser(tx, userId) {
    return this.repository.deleteNotificationsByUser(tx, userId);
  }

  async clearClassMonitorByStudent(tx, studentId) {
    return this.repository.clearClassMonitorByStudent(tx, studentId);
  }
}

module.exports = AdminUserPrismaRepository;

