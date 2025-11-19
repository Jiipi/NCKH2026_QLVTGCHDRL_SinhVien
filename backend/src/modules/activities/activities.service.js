/**
 * Activities Service - Composition Pattern
 * Business logic layer using specialized services
 * 
 * This class composes multiple specialized services to handle activity operations
 * Follows Single Responsibility Principle (SRP) and Clean Architecture
 */

const ActivityQueryService = require('./services/ActivityQueryService');
const ActivityCRUDService = require('./services/ActivityCRUDService');
const ActivityApprovalService = require('./services/ActivityApprovalService');
const ActivityValidationService = require('./services/ActivityValidationService');
const ActivityQRService = require('./services/ActivityQRService');
const ActivityEnrichmentService = require('./services/ActivityEnrichmentService');

/**
 * ActivitiesService - Facade Pattern
 * Maintains backward compatibility by delegating to specialized services
 */
class ActivitiesService {
  constructor() {
    // Compose specialized services
    this.queryService = new ActivityQueryService();
    this.crudService = new ActivityCRUDService();
    this.approvalService = new ActivityApprovalService();
    this.validationService = new ActivityValidationService();
    this.qrService = new ActivityQRService();
    this.enrichmentService = new ActivityEnrichmentService();
  }

  // ==================== QUERY METHODS ====================
  /**
   * List activities with filters and scope
   * @delegates ActivityQueryService.list
   */
  async list(filters, user) {
    return this.queryService.list(filters, user);
  }

  /**
   * Get activity by ID (with scope check)
   * @delegates ActivityQueryService.getById
   */
  async getById(id, scope, user) {
    return this.queryService.getById(id, scope, user);
  }

  /**
   * Get activity details with registrations
   * @delegates ActivityQueryService.getDetails
   */
  async getDetails(id, user) {
    return this.queryService.getDetails(id, user);
  }

  // ==================== CRUD METHODS ====================
  /**
   * Create new activity
   * @delegates ActivityCRUDService.create
   */
  async create(data, user) {
    return this.crudService.create(data, user);
  }

  /**
   * Update activity (with ownership check)
   * @delegates ActivityCRUDService.update
   */
  async update(id, data, user, scope) {
    return this.crudService.update(id, data, user, scope);
  }

  /**
   * Delete activity (with ownership and dependency check)
   * @delegates ActivityCRUDService.delete
   */
  async delete(id, user, scope) {
    return this.crudService.delete(id, user, scope);
  }

  // ==================== APPROVAL METHODS ====================
  /**
   * Approve activity (GIANG_VIEN, ADMIN only)
   * @delegates ActivityApprovalService.approve
   */
  async approve(id, user) {
    return this.approvalService.approve(id, user);
  }

  /**
   * Reject activity (GIANG_VIEN, ADMIN only)
   * @delegates ActivityApprovalService.reject
   */
  async reject(id, reason, user) {
    return this.approvalService.reject(id, reason, user);
  }

  // ==================== VALIDATION METHODS ====================
  /**
   * Map incoming request fields to Prisma model fields
   * @delegates ActivityValidationService.mapIncomingFields
   */
  mapIncomingFields(data) {
    return this.validationService.mapIncomingFields(data);
  }

  /**
   * Normalize activity data
   * @delegates ActivityValidationService.normalizeActivityData
   */
  normalizeActivityData(data) {
    return this.validationService.normalizeActivityData(data);
  }

  /**
   * Normalize file array (handle URLs)
   * @delegates ActivityValidationService.normalizeFileArray
   */
  normalizeFileArray(value) {
    return this.validationService.normalizeFileArray(value);
  }

  /**
   * Validate activity dates
   * @delegates ActivityValidationService.validateDates
   */
  validateDates(data) {
    return this.validationService.validateDates(data);
  }

  /**
   * Parse semester string
   * @deprecated Use parseSemesterString from utils/semester instead
   */
  parseSemester(semester) {
    const { parseSemesterString } = require('../../core/utils/semester');
    const parsed = parseSemesterString(semester);
    if (!parsed || !parsed.semester) {
      console.warn('[Activities] parseSemester failed for input:', semester);
      return {};
    }
    // Return single-year format (normalized)
    return { 
      hoc_ky: parsed.semester, 
      nam_hoc: parsed.year // Already single year after normalization
    };
  }

  // ==================== QR METHODS ====================
  /**
   * Generate unique QR token
   * @delegates ActivityQRService.generateQRToken
   */
  generateQRToken() {
    return this.qrService.generateQRToken();
  }

  /**
   * Generate QR token for activity if it doesn't have one
   * @delegates ActivityQRService.generateQRForActivity
   */
  async generateQRForActivity(id) {
    return this.qrService.generateQRForActivity(id);
  }

  // ==================== ENRICHMENT METHODS ====================
  /**
   * Enrich activities with student's registration status
   * @delegates ActivityEnrichmentService.enrichActivitiesWithRegistrations
   */
  async enrichActivitiesWithRegistrations(activities, userId, userRole) {
    return this.enrichmentService.enrichActivitiesWithRegistrations(activities, userId, userRole);
  }

  /**
   * Enrich activity with computed fields
   * @delegates ActivityEnrichmentService.enrichActivity
   */
  enrichActivity(activity, user) {
    return this.enrichmentService.enrichActivity(activity, user);
  }
}

module.exports = new ActivitiesService();
