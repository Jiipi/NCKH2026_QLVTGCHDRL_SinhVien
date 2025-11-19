const { NotFoundError, ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const { canManageActivity } = require('../helpers/registrationAccess');

/**
 * CheckInRegistrationUseCase
 * Use case for checking in a registration (teacher check điểm danh)
 * Follows Single Responsibility Principle (SRP)
 */
class CheckInRegistrationUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id, user) {
    const registration = await this.registrationRepository.findById(id, {
      activity: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Authorization: Check if user can manage the activity
    const canCheckIn = await canManageActivity(registration.activity, user);
    if (!canCheckIn) {
      throw new ForbiddenError('Bạn không có quyền điểm danh hoạt động này');
    }

    // Business rule: Only approved registrations can be checked in
    if (registration.status !== 'APPROVED') {
      throw new ValidationError('Chỉ có thể điểm danh registration đã được duyệt');
    }

    // Check-in using repository
    const updated = await this.registrationRepository.checkIn(id, new Date());

    return updated;
  }
}

module.exports = CheckInRegistrationUseCase;

