/**
 * Registration Query Service
 * Handles querying and retrieving registrations
 * Follows Single Responsibility Principle (SRP)
 */

const registrationsRepo = require('../registrations.repo');
const { buildScope } = require('../../../app/scopes/scopeBuilder');
const { NotFoundError, ForbiddenError } = require('../../../core/errors/AppError');
const { prisma } = require('../../../infrastructure/prisma/client');
const RegistrationAuthorizationService = require('./RegistrationAuthorizationService');

class RegistrationQueryService {
  constructor() {
    this.authService = new RegistrationAuthorizationService();
  }

  /**
   * Lấy danh sách registrations với scope filtering
   */
  async list(user, filters = {}, pagination = {}) {
    // Build scope based on user role
    const scope = await buildScope('registrations', user);
    
    // Merge scope với filters
    const where = { ...scope, ...filters };

    // Pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    // Include related data
    const include = {
      activity: true,
      user: true,
      approvedBy: filters.includeApprover !== false
    };

    const result = await registrationsRepo.findMany({
      where,
      skip,
      limit,
      include
    });

    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }

  /**
   * Lấy registration theo ID với authorization check
   */
  async getById(id, user) {
    const registration = await registrationsRepo.findById(id, {
      activity: true,
      user: true,
      approvedBy: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check authorization
    await this.authService.checkAccess(registration, user);

    return registration;
  }

  /**
   * Get user's registrations
   */
  async getMyRegistrations(user, filters = {}) {
    const registrations = await registrationsRepo.findByUser(user.id, filters);
    return registrations;
  }

  /**
   * Get activity stats
   */
  async getActivityStats(activityId, user) {
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId) }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Check access
    const canView = await this.authService.canManageActivity(activity, user);
    if (!canView && user.role !== 'SINH_VIEN') {
      throw new ForbiddenError('Không có quyền xem thống kê');
    }

    const stats = await registrationsRepo.getActivityStats(activityId);

    return stats;
  }
}

module.exports = RegistrationQueryService;

