/**
 * GetMyRegistrationsUseCase
 * Use case for retrieving registrations of current user
 */
class GetMyRegistrationsUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(user, filters = {}) {
    const where = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const registrations = await this.registrationRepository.findByUser(user.id, where);
    return registrations;
  }
}

module.exports = GetMyRegistrationsUseCase;

