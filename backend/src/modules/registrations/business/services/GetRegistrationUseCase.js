const { NotFoundError } = require('../../../../core/errors/AppError');
const { checkAccess } = require('../helpers/registrationAccess');

/**
 * GetRegistrationUseCase
 * Use case for retrieving a registration by ID
 */
class GetRegistrationUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, user) {
    const registration = await this.registrationRepository.findById(id, {
      activity: true,
      user: true,
      approvedBy: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    await checkAccess(registration, user);

    return registration;
  }
}

module.exports = GetRegistrationUseCase;

