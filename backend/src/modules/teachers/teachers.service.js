/**
 * Teachers Service - Composition Pattern
 * Business logic layer using specialized services
 * 
 * This class composes multiple specialized services to handle teacher operations
 * Follows Single Responsibility Principle (SRP) and Clean Architecture
 */

const TeacherDashboardService = require('./services/TeacherDashboardService');
const TeacherQueryService = require('./services/TeacherQueryService');
const TeacherActivityService = require('./services/TeacherActivityService');
const TeacherRegistrationService = require('./services/TeacherRegistrationService');
const TeacherStatisticsService = require('./services/TeacherStatisticsService');
const TeacherStudentService = require('./services/TeacherStudentService');

/**
 * TeachersService - Facade Pattern
 * Maintains backward compatibility by delegating to specialized services
 */
const teachersService = {
  // Initialize services
  _dashboardService: new TeacherDashboardService(),
  _queryService: new TeacherQueryService(),
  _activityService: new TeacherActivityService(),
  _registrationService: new TeacherRegistrationService(),
  _statisticsService: new TeacherStatisticsService(),
  _studentService: new TeacherStudentService(),

  // ==================== DASHBOARD METHODS ====================
  /**
   * Get teacher dashboard data (V1 compatible)
   * @delegates TeacherDashboardService.getDashboard
   */
  async getDashboard(user, semester = null, classId = null) {
    return this._dashboardService.getDashboard(user, semester, classId);
  },

  // ==================== QUERY METHODS ====================
  /**
   * Get teacher's classes
   * @delegates TeacherQueryService.getClasses
   */
  async getClasses(user) {
    return this._queryService.getClasses(user);
  },

  /**
   * Get students in teacher's classes
   * @delegates TeacherQueryService.getStudents
   */
  async getStudents(user, filters = {}) {
    return this._queryService.getStudents(user, filters);
  },

  /**
   * Get pending activities from teacher's classes
   * @delegates TeacherQueryService.getPendingActivities
   */
  async getPendingActivities(user, pagination = {}) {
    return this._queryService.getPendingActivities(user, pagination);
  },

  /**
   * Get activity history
   * @delegates TeacherQueryService.getActivityHistory
   */
  async getActivityHistory(user, filters = {}, pagination = {}) {
    return this._queryService.getActivityHistory(user, filters, pagination);
  },

  // ==================== ACTIVITY METHODS ====================
  /**
   * Approve activity
   * @delegates TeacherActivityService.approveActivity
   */
  async approveActivity(activityId, user) {
    return this._activityService.approveActivity(activityId, user);
  },

  /**
   * Reject activity
   * @delegates TeacherActivityService.rejectActivity
   */
  async rejectActivity(activityId, reason, user) {
    return this._activityService.rejectActivity(activityId, reason, user);
  },

  // ==================== REGISTRATION METHODS ====================
  /**
   * Get all registrations for teacher's classes
   * @delegates TeacherRegistrationService.getAllRegistrations
   */
  async getAllRegistrations(user, filters = {}) {
    return this._registrationService.getAllRegistrations(user, filters);
  },

  /**
   * Get pending registrations
   * @delegates TeacherRegistrationService.getPendingRegistrations
   */
  async getPendingRegistrations(user, options = {}) {
    return this._registrationService.getPendingRegistrations(user, options);
  },

  /**
   * Approve registration
   * @delegates TeacherRegistrationService.approveRegistration
   */
  async approveRegistration(regId, user) {
    return this._registrationService.approveRegistration(regId, user);
  },

  /**
   * Reject registration
   * @delegates TeacherRegistrationService.rejectRegistration
   */
  async rejectRegistration(regId, reason, user) {
    return this._registrationService.rejectRegistration(regId, reason, user);
  },

  /**
   * Bulk approve registrations
   * @delegates TeacherRegistrationService.bulkApproveRegistrations
   */
  async bulkApproveRegistrations(regIds, user) {
    return this._registrationService.bulkApproveRegistrations(regIds, user);
  },

  // ==================== STATISTICS METHODS ====================
  /**
   * Get class statistics
   * @delegates TeacherStatisticsService.getClassStatistics
   */
  async getClassStatistics(className, semesterId, user) {
    return this._statisticsService.getClassStatistics(className, semesterId, user);
  },

  /**
   * Get statistics for reports
   * @delegates TeacherStatisticsService.getReportStatistics
   */
  async getReportStatistics(user, filters = {}) {
    return this._statisticsService.getReportStatistics(user, filters);
  },

  // ==================== STUDENT METHODS ====================
  /**
   * Export students list
   * @delegates TeacherStudentService.exportStudents
   */
  async exportStudents(user) {
    return this._studentService.exportStudents(user);
  },

  /**
   * Create a single student in teacher's class
   * @delegates TeacherStudentService.createStudent
   */
  async createStudent(user, payload) {
    return this._studentService.createStudent(user, payload);
  },

  /**
   * Assign class monitor (teacher only)
   * @delegates TeacherStudentService.assignClassMonitor
   */
  async assignClassMonitor(classId, studentId, user) {
    return this._studentService.assignClassMonitor(classId, studentId, user);
  }
};

module.exports = teachersService;
