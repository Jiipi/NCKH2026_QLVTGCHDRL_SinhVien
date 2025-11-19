/**
 * Registration Authorization Service
 * Handles authorization checks for registrations
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../infrastructure/prisma/client');
const { ForbiddenError } = require('../../../core/errors/AppError');

class RegistrationAuthorizationService {
  /**
   * Check if user can access registration
   */
  async checkAccess(registration, user) {
    // ADMIN: full access
    if (user.role === 'ADMIN') return true;

    // Owner can access
    if (registration.userId === user.id) return true;

    // GIANG_VIEN: can access if they created the activity
    if (user.role === 'GIANG_VIEN' && registration.activity) {
      if (registration.activity.createdBy === user.id) return true;
    }

    // LOP_TRUONG: can access if registration is from their class
    if (user.role === 'LOP_TRUONG') {
      const regUser = await prisma.user.findUnique({
        where: { id: registration.userId }
      });
      if (regUser && regUser.class === user.class) return true;
    }

    throw new ForbiddenError('Bạn không có quyền xem registration này');
  }

  /**
   * Check if user can approve registration
   */
  async canApproveRegistration(registration, user) {
    // ADMIN: can approve all
    if (user.role === 'ADMIN') return true;

    // GIANG_VIEN: can approve if they created the activity
    if (user.role === 'GIANG_VIEN' && registration.activity) {
      return registration.activity.createdBy === user.id;
    }

    // LOP_TRUONG: can approve if registration is from their class
    if (user.role === 'LOP_TRUONG') {
      const regUser = await prisma.user.findUnique({
        where: { id: registration.userId }
      });
      return regUser && regUser.class === user.class;
    }

    return false;
  }

  /**
   * Check if user can manage activity
   */
  async canManageActivity(activity, user) {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'GIANG_VIEN' && activity.createdBy === user.id) return true;
    return false;
  }
}

module.exports = RegistrationAuthorizationService;

