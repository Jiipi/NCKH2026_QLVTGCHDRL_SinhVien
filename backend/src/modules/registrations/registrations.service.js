/**
 * Registrations Service - Composition Pattern
 * Business logic layer using specialized services
 * 
 * This class composes multiple specialized services to handle registration operations
 * Follows Single Responsibility Principle (SRP) and Clean Architecture
 */

const RegistrationQueryService = require('./services/RegistrationQueryService');
const RegistrationCRUDService = require('./services/RegistrationCRUDService');
const RegistrationApprovalService = require('./services/RegistrationApprovalService');
const RegistrationExportService = require('./services/RegistrationExportService');
const RegistrationAuthorizationService = require('./services/RegistrationAuthorizationService');

/**
 * RegistrationsService - Facade Pattern
 * Maintains backward compatibility by delegating to specialized services
 */
const registrationsService = {
  // Initialize services
  _queryService: new RegistrationQueryService(),
  _crudService: new RegistrationCRUDService(),
  _approvalService: new RegistrationApprovalService(),
  _exportService: new RegistrationExportService(),
  _authService: new RegistrationAuthorizationService(),

  // ==================== QUERY METHODS ====================
  /**
   * Lấy danh sách registrations với scope filtering
   * @delegates RegistrationQueryService.list
   */
  async list(user, filters = {}, pagination = {}) {
    return this._queryService.list(user, filters, pagination);
  },

  /**
   * Lấy registration theo ID với authorization check
   * @delegates RegistrationQueryService.getById
   */
  async getById(id, user) {
    return this._queryService.getById(id, user);
  },

  /**
   * Get user's registrations
   * @delegates RegistrationQueryService.getMyRegistrations
   */
  async getMyRegistrations(user, filters = {}) {
    return this._queryService.getMyRegistrations(user, filters);
  },

  /**
   * Get activity stats
   * @delegates RegistrationQueryService.getActivityStats
   */
  async getActivityStats(activityId, user) {
    return this._queryService.getActivityStats(activityId, user);
  },

  // ==================== CRUD METHODS ====================
  /**
   * Tạo registration mới (student đăng ký hoạt động)
   * @delegates RegistrationCRUDService.create
   */
  async create(data, user) {
    return this._crudService.create(data, user);
  },

  /**
   * Register for activity (student registers for activity)
   * @delegates RegistrationCRUDService.register
   */
  async register(activityId, user) {
    return this._crudService.register(activityId, user);
  },

  /**
   * Cancel registration (student tự hủy)
   * @delegates RegistrationCRUDService.cancel
   */
  async cancel(id, user) {
    return this._crudService.cancel(id, user);
  },

  // ==================== APPROVAL METHODS ====================
  /**
   * Approve registration (GIANG_VIEN, LOP_TRUONG)
   * @delegates RegistrationApprovalService.approve
   */
  async approve(id, user) {
    return this._approvalService.approve(id, user);
  },

  /**
   * Reject registration
   * @delegates RegistrationApprovalService.reject
   */
  async reject(id, reason, user) {
    return this._approvalService.reject(id, reason, user);
  },

  /**
   * Check-in registration (teacher check điểm danh)
   * @delegates RegistrationApprovalService.checkIn
   */
  async checkIn(id, user) {
    return this._approvalService.checkIn(id, user);
  },

  /**
   * Bulk approve registrations
   * @delegates RegistrationApprovalService.bulkApprove
   */
  async bulkApprove(ids, user) {
    return this._approvalService.bulkApprove(ids, user);
  },

  /**
   * Bulk update registrations (approve or reject)
   * @delegates RegistrationApprovalService.bulkUpdate
   */
  async bulkUpdate(ids, action, reason, user) {
    return this._approvalService.bulkUpdate(ids, action, reason, user);
  },

  // ==================== EXPORT METHODS ====================
  /**
   * Export registrations to Excel
   * @delegates RegistrationExportService.exportRegistrations
   */
  async exportRegistrations(filters = {}) {
    return this._exportService.exportRegistrations(filters);
  },

  // ==================== AUTHORIZATION METHODS ====================
  /**
   * Check if user can access registration
   * @delegates RegistrationAuthorizationService.checkAccess
   */
  async checkAccess(registration, user) {
    return this._authService.checkAccess(registration, user);
  },

  /**
   * Check if user can approve registration
   * @delegates RegistrationAuthorizationService.canApproveRegistration
   */
  async canApproveRegistration(registration, user) {
    return this._authService.canApproveRegistration(registration, user);
  },

  /**
   * Check if user can manage activity
   * @delegates RegistrationAuthorizationService.canManageActivity
   */
  async canManageActivity(activity, user) {
    return this._authService.canManageActivity(activity, user);
  }
};

module.exports = registrationsService;
