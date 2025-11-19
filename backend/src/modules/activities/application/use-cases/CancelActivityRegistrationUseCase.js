const { NotFoundError, ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../infrastructure/prisma/client');
const registrationsService = require('../../../registrations/registrations.service');

/**
 * CancelActivityRegistrationUseCase
 * Use case for canceling activity registration
 * Follows Single Responsibility Principle (SRP)
 */
class CancelActivityRegistrationUseCase {
  async execute(activityId, user) {
    // Get student ID from user ID
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true }
    });
    
    if (!student) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    // Find registration by activity ID and user ID
    const registration = await prisma.dangKyHoatDong.findFirst({
      where: {
        hd_id: activityId,
        sv_id: student.id
      }
    });

    if (!registration) {
      throw new NotFoundError('Không tìm thấy đăng ký');
    }

    // Use registrations service to cancel
    const result = await registrationsService.cancel(registration.id, user);
    
    return result;
  }
}

module.exports = CancelActivityRegistrationUseCase;

