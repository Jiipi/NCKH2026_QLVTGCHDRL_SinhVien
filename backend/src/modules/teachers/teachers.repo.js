/**
 * Teachers Repository - Composition Pattern
 * Delegates to specialized repositories following Single Responsibility Principle
 * 
 * This file acts as a facade that composes multiple specialized repositories
 * to maintain backward compatibility while following SOLID principles
 */

const TeacherDashboardRepository = require('./infrastructure/repositories/TeacherDashboardRepository');
const TeacherClassRepository = require('./infrastructure/repositories/TeacherClassRepository');
const TeacherStudentRepository = require('./infrastructure/repositories/TeacherStudentRepository');
const TeacherActivityRepository = require('./infrastructure/repositories/TeacherActivityRepository');
const TeacherRegistrationRepository = require('./infrastructure/repositories/TeacherRegistrationRepository');

// Create instances of specialized repositories
const dashboardRepo = new TeacherDashboardRepository();
const classRepo = new TeacherClassRepository();
const studentRepo = new TeacherStudentRepository();
const activityRepo = new TeacherActivityRepository();
const registrationRepo = new TeacherRegistrationRepository();

/**
 * Teachers Repository - Facade Pattern
 * Maintains backward compatibility by delegating to specialized repositories
 */
const teachersRepo = {
  // ==================== DASHBOARD METHODS ====================
  /**
   * Get teacher dashboard stats
   * @delegates TeacherDashboardRepository.getDashboardStats
   */
  async getDashboardStats(teacherId, semester = null, classId = null) {
    return dashboardRepo.getDashboardStats(teacherId, semester, classId);
  },

  /**
   * Get class statistics
   * @delegates TeacherDashboardRepository.getClassStats
   */
  async getClassStats(className, semesterId = null) {
    return dashboardRepo.getClassStats(className, semesterId);
  },

  /**
   * Get recent notifications
   * @delegates TeacherDashboardRepository.getRecentNotifications
   */
  async getRecentNotifications(teacherId, limit = 5) {
    return dashboardRepo.getRecentNotifications(teacherId, limit);
  },

  // ==================== CLASS METHODS ====================
  /**
   * Get classes assigned to teacher
   * @delegates TeacherClassRepository.getTeacherClasses
   */
  async getTeacherClasses(teacherId, include = {}) {
    return classRepo.getTeacherClasses(teacherId, include);
  },

  /**
   * Get teacher class names
   * @delegates TeacherClassRepository.getTeacherClassNames
   */
  async getTeacherClassNames(teacherId) {
    return classRepo.getTeacherClassNames(teacherId);
  },

  /**
   * Check if teacher has access to class
   * @delegates TeacherClassRepository.hasAccessToClass
   */
  async hasAccessToClass(teacherId, className) {
    return classRepo.hasAccessToClass(teacherId, className);
  },

  /**
   * Assign class monitor
   * @delegates TeacherClassRepository.assignClassMonitor
   */
  async assignClassMonitor(teacherId, classId, studentId) {
    return classRepo.assignClassMonitor(teacherId, classId, studentId);
  },

  // ==================== STUDENT METHODS ====================
  /**
   * Get students in teacher's classes
   * @delegates TeacherStudentRepository.getTeacherStudents
   */
  async getTeacherStudents(teacherId, filters = {}) {
    return studentRepo.getTeacherStudents(teacherId, filters);
  },

  /**
   * Export students data
   * @delegates TeacherStudentRepository.exportStudents
   */
  async exportStudents(teacherId) {
    return studentRepo.exportStudents(teacherId);
  },

  /**
   * Create student
   * @delegates TeacherStudentRepository.createStudent
   */
  async createStudent(teacherId, payload) {
    return studentRepo.createStudent(teacherId, payload);
  },

  // ==================== ACTIVITY METHODS ====================
  /**
   * Get pending activities list
   * @delegates TeacherActivityRepository.getPendingActivitiesList
   */
  async getPendingActivitiesList(teacherId, semester = null, limit = 10, classId = null) {
    return activityRepo.getPendingActivitiesList(teacherId, semester, limit, classId);
  },

  /**
   * Check if teacher has access to activity
   * @delegates TeacherActivityRepository.hasAccessToActivity
   */
  async hasAccessToActivity(teacherId, activityId) {
    return activityRepo.hasAccessToActivity(teacherId, activityId);
  },

  /**
   * Count activities for teacher classes (strict)
   * @delegates TeacherActivityRepository.countActivitiesForTeacherClassesStrict
   */
  async countActivitiesForTeacherClassesStrict(teacherId, semesterId = null) {
    return activityRepo.countActivitiesForTeacherClassesStrict(teacherId, semesterId);
  },

  // ==================== REGISTRATION METHODS ====================
  /**
   * Get class registrations
   * @delegates TeacherRegistrationRepository.getClassRegistrations
   */
  async getClassRegistrations(classIds, filters = {}) {
    return registrationRepo.getClassRegistrations(classIds, filters);
  },

  /**
   * Get teacher class registrations for charts (all)
   * @delegates TeacherRegistrationRepository.getTeacherClassRegistrationsForChartsAll
   */
  async getTeacherClassRegistrationsForChartsAll(teacherId, semesterId = null) {
    return registrationRepo.getTeacherClassRegistrationsForChartsAll(teacherId, semesterId);
  },

  /**
   * Get teacher class registrations for reports
   * @delegates TeacherRegistrationRepository.getTeacherClassRegistrationsForReports
   */
  async getTeacherClassRegistrationsForReports(teacherId, semesterId = null) {
    return registrationRepo.getTeacherClassRegistrationsForReports(teacherId, semesterId);
  }
};

module.exports = teachersRepo;
