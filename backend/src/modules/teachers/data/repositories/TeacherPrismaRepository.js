/**
 * TeacherPrismaRepository
 * Prisma implementation of ITeacherRepository using Composition Pattern
 * 
 * This class composes specialized repositories to implement ITeacherRepository interface
 * Follows Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP)
 */

const ITeacherRepository = require('../../business/interfaces/ITeacherRepository');
const TeacherDashboardRepository = require('./TeacherDashboardRepository');
const TeacherClassRepository = require('./TeacherClassRepository');
const TeacherStudentRepository = require('./TeacherStudentRepository');
const TeacherActivityRepository = require('./TeacherActivityRepository');
const TeacherRegistrationRepository = require('./TeacherRegistrationRepository');

/**
 * TeacherPrismaRepository - Composition Pattern
 * Implements ITeacherRepository by delegating to specialized repositories
 */
class TeacherPrismaRepository extends ITeacherRepository {
  constructor() {
    super();
    // Compose specialized repositories
    this.dashboardRepo = new TeacherDashboardRepository();
    this.classRepo = new TeacherClassRepository();
    this.studentRepo = new TeacherStudentRepository();
    this.activityRepo = new TeacherActivityRepository();
    this.registrationRepo = new TeacherRegistrationRepository();
  }

  // ==================== DASHBOARD METHODS ====================
  async getDashboardStats(teacherId, semester = null, classId = null) {
    return this.dashboardRepo.getDashboardStats(teacherId, semester, classId);
  }

  async getClassStats(className, semesterId = null) {
    return this.dashboardRepo.getClassStats(className, semesterId);
  }

  // ==================== CLASS METHODS ====================
  async getTeacherClasses(teacherId, include = {}) {
    return this.classRepo.getTeacherClasses(teacherId, include);
  }

  async getTeacherClassNames(teacherId) {
    return this.classRepo.getTeacherClassNames(teacherId);
  }

  async hasAccessToClass(teacherId, className) {
    return this.classRepo.hasAccessToClass(teacherId, className);
  }

  async assignClassMonitor(teacherId, classId, studentId) {
    return this.classRepo.assignClassMonitor(teacherId, classId, studentId);
  }

  // ==================== STUDENT METHODS ====================
  async getTeacherStudents(teacherId, filters = {}) {
    return this.studentRepo.getTeacherStudents(teacherId, filters);
  }

  async exportStudents(teacherId) {
    return this.studentRepo.exportStudents(teacherId);
  }

  async createStudent(teacherId, payload) {
    return this.studentRepo.createStudent(teacherId, payload);
  }

  // ==================== ACTIVITY METHODS ====================
  async getPendingActivitiesList(teacherId, semester = null, limit = 10, classId = null) {
    return this.activityRepo.getPendingActivitiesList(teacherId, semester, limit, classId);
  }

  async countActivitiesForTeacherClassesStrict(teacherId, semesterId = null) {
    return this.activityRepo.countActivitiesForTeacherClassesStrict(teacherId, semesterId);
  }

  // ==================== REGISTRATION METHODS ====================
  async getClassRegistrations(classIds, filters = {}) {
    return this.registrationRepo.getClassRegistrations(classIds, filters);
  }

  async getTeacherClassRegistrationsForChartsAll(teacherId, semesterId = null) {
    return this.registrationRepo.getTeacherClassRegistrationsForChartsAll(teacherId, semesterId);
  }

  async getTeacherClassRegistrationsForReports(teacherId, semesterId = null) {
    return this.registrationRepo.getTeacherClassRegistrationsForReports(teacherId, semesterId);
  }
}

module.exports = TeacherPrismaRepository;
