const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');
const { canApproveRegistration } = require('../helpers/registrationAccess');

/**
 * RejectRegistrationUseCase
 * Use case for rejecting a registration
 */
class RejectRegistrationUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, reason, user) {
    const registration = await this.registrationRepository.findById(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    const canApprove = await canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền từ chối registration này');
    }

    const updated = await this.registrationRepository.update(id, {
      trang_thai_dk: 'tu_choi',
      ly_do: reason || 'Không đáp ứng yêu cầu'
    });

    return updated;
  }
}

module.exports = RejectRegistrationUseCase;

