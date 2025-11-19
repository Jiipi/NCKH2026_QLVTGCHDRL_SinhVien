const { NotFoundError, ForbiddenError } = require('../../../../core/errors/AppError');

/**
 * UpdateRegistrationUseCase
 * Use case for updating a registration (note/status)
 */
class UpdateRegistrationUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, data, user) {
    const registration = await this.registrationRepository.findById(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    if (user.role !== 'ADMIN' && registration.userId !== user.id) {
      throw new ForbiddenError('Bạn không có quyền sửa đăng ký này');
    }

    const allowedFields = {};
    if (data.note !== undefined) allowedFields.note = data.note;
    if (data.status !== undefined) allowedFields.status = data.status;

    const updated = await this.registrationRepository.update(id, allowedFields);
    return updated;
  }
}

module.exports = UpdateRegistrationUseCase;

