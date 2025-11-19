const { NotFoundError, ValidationError, ForbiddenError } = require('../../../../core/errors/AppError');
const { canApproveRegistration } = require('../helpers/registrationAccess');

/**
 * ApproveRegistrationUseCase
 * Use case for approving a registration
 */
class ApproveRegistrationUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, user) {
    const registration = await this.registrationRepository.findById(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    const canApprove = await canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền duyệt registration này');
    }

    if (registration.status === 'APPROVED') {
      throw new ValidationError('Registration đã được duyệt rồi');
    }

    const updated = await this.registrationRepository.update(id, {
      status: 'APPROVED',
      approvedById: user.id,
      approvedAt: new Date()
    });

    return updated;
  }
}

module.exports = ApproveRegistrationUseCase;

