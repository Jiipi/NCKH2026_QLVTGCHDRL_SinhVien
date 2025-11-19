const { NotFoundError, ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const { canAccessItem } = require('../../../../app/scopes/scopeBuilder');

/**
 * DeleteActivityUseCase
 * Use case for deleting an activity
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteActivityUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id, user, scope) {
    // Check if activity exists in scope
    const existing = await this.activityRepository.findById(id, scope?.activityFilter || {});

    if (!existing) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền xóa hoạt động này');
    }

    // Check if activity has registrations
    const { prisma } = require('../../../../infrastructure/prisma/client');
    const registrationCount = await prisma.dangKyHoatDong.count({
      where: { hd_id: id }
    });

    if (registrationCount > 0) {
      throw new ValidationError('Không thể xóa hoạt động đã có người đăng ký');
    }

    return this.activityRepository.delete(id);
  }
}

module.exports = DeleteActivityUseCase;

