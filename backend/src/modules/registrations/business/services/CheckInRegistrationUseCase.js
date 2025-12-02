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
    const currentStatus = registration.trang_thai_dk || registration.status;
    if (currentStatus !== 'da_duyet' && currentStatus !== 'APPROVED') {
      throw new ValidationError('Chỉ có thể điểm danh registration đã được duyệt');
    }

    // Business rule: Cannot check-in before activity starts (exact time)
    const now = new Date();
    const activityStart = new Date(registration.activity.ngay_bd);
    
    if (now.getTime() < activityStart.getTime()) {
      const startDateStr = activityStart.toLocaleString('vi-VN', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${startDateStr}`);
    }

    // Business rule: Cannot check-in after activity ends (exact time)
    const activityEnd = new Date(registration.activity.ngay_kt);
    
    if (now.getTime() > activityEnd.getTime()) {
      const endDateStr = activityEnd.toLocaleString('vi-VN', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${endDateStr}, không thể điểm danh`);
    }

    // Check-in using repository
    const updated = await this.registrationRepository.checkIn(id, new Date());

    return updated;
  }
}

module.exports = CheckInRegistrationUseCase;

