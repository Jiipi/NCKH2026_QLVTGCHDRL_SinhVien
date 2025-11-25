const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * DeleteRegistrationUseCase
 * Use case for deleting a registration
 */
class DeleteRegistrationUseCase {
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

    if (user.role !== 'ADMIN' && registration.userId !== user.id) {
      throw new ForbiddenError('Bạn không có quyền xóa đăng ký này');
    }

    await this.registrationRepository.delete(id);
  }
}

module.exports = DeleteRegistrationUseCase;

