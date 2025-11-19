/**
 * IAdminUserRepository Interface
 * Contract for admin user data access
 * Follows Dependency Inversion Principle (DIP)
 */
class IAdminUserRepository {
  async findUsers(where, options) {
    throw new Error('Must implement findUsers()');
  }

  async countUsers(where) {
    throw new Error('Must implement countUsers()');
  }

  async findUserById(id, include = {}) {
    throw new Error('Must implement findUserById()');
  }

  async findUserByTenDn(tenDn) {
    throw new Error('Must implement findUserByTenDn()');
  }

  async findExistingUserByCredentials(maso, email) {
    throw new Error('Must implement findExistingUserByCredentials()');
  }

  async createUser(userData, tx = null) {
    throw new Error('Must implement createUser()');
  }

  async updateUser(id, updateData) {
    throw new Error('Must implement updateUser()');
  }

  async deleteUser(tx, id) {
    throw new Error('Must implement deleteUser()');
  }

  async findRoleByName(roleName) {
    throw new Error('Must implement findRoleByName()');
  }

  async upsertRole(roleName) {
    throw new Error('Must implement upsertRole()');
  }

  async createStudent(studentData, tx) {
    throw new Error('Must implement createStudent()');
  }

  async updateStudent(studentId, updateData) {
    throw new Error('Must implement updateStudent()');
  }

  async deleteStudent(tx, studentId) {
    throw new Error('Must implement deleteStudent()');
  }

  async runInTransaction(callback) {
    throw new Error('Must implement runInTransaction()');
  }

  async updateClassMonitor(lopId, studentId, tx) {
    throw new Error('Must implement updateClassMonitor()');
  }

  async findClassesAsHeadTeacher(tx, userId) {
    throw new Error('Must implement findClassesAsHeadTeacher()');
  }

  async findReplacementTeacher(tx, userId) {
    throw new Error('Must implement findReplacementTeacher()');
  }

  async updateHeadTeacherForClasses(tx, userId, replacementId) {
    throw new Error('Must implement updateHeadTeacherForClasses()');
  }

  async countActivitiesByCreator(tx, userId) {
    throw new Error('Must implement countActivitiesByCreator()');
  }

  async findReplacementAdmin(tx, userId) {
    throw new Error('Must implement findReplacementAdmin()');
  }

  async reassignActivities(tx, userId, adminId) {
    throw new Error('Must implement reassignActivities()');
  }

  async deleteActivitiesByCreator(tx, userId) {
    throw new Error('Must implement deleteActivitiesByCreator()');
  }

  async countAttendanceByChecker(tx, userId) {
    throw new Error('Must implement countAttendanceByChecker()');
  }

  async findReplacementChecker(tx, userId) {
    throw new Error('Must implement findReplacementChecker()');
  }

  async reassignAttendanceChecker(tx, userId, checkerId) {
    throw new Error('Must implement reassignAttendanceChecker()');
  }

  async deleteAttendanceByChecker(tx, userId) {
    throw new Error('Must implement deleteAttendanceByChecker()');
  }

  async deleteStudentRegistrations(tx, studentId) {
    throw new Error('Must implement deleteStudentRegistrations()');
  }

  async deleteStudentAttendance(tx, studentId) {
    throw new Error('Must implement deleteStudentAttendance()');
  }

  async deleteNotificationsByUser(tx, userId) {
    throw new Error('Must implement deleteNotificationsByUser()');
  }

  async clearClassMonitorByStudent(tx, studentId) {
    throw new Error('Must implement clearClassMonitorByStudent()');
  }
}

module.exports = IAdminUserRepository;

