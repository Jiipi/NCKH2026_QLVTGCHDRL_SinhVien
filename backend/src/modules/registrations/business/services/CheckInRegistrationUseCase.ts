/**
 * CheckInRegistrationUseCase
 * Use case for checking in a registration (teacher check điểm danh)
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import { canManageActivity } from '../helpers/registrationAccess';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser, RegistrationForAccess, ActivityForAccess } from '../helpers/registrationAccess';
import type { RegistrationStatusVN, RegistrationStatusEN } from '../../registrations.types';
import type { HoatDong } from '@prisma/client';

/**
 * Registration with activity for check-in
 */
interface RegistrationWithActivity extends RegistrationForAccess {
  trang_thai_dk?: RegistrationStatusVN;
  status?: RegistrationStatusEN;
  activity?: HoatDong & ActivityForAccess;
}

/**
 * CheckInRegistrationUseCase
 */
export class CheckInRegistrationUseCase {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(id: string, user: AuthUser): Promise<unknown> {
    const registration = await this.registrationRepository.findById<RegistrationWithActivity>(id, {
      activity: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    if (!registration.activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
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
    // Cho phép điểm danh sớm 12 tiếng để xử lý lỗi lệch múi giờ (UTC vs Local)
    const now = new Date();
    const leeway = 12 * 60 * 60 * 1000;
    const activityStart = new Date(registration.activity.ngay_bd);

    if (now.getTime() + leeway < activityStart.getTime()) {
      const startDateStr = activityStart.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${startDateStr}`);
    }

    // Business rule: Cannot check-in after activity ends (exact time)
    const activityEnd = new Date(registration.activity.ngay_kt);

    if (now.getTime() - leeway > activityEnd.getTime()) {
      const endDateStr = activityEnd.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${endDateStr}, không thể điểm danh`);
    }

    // Check-in using repository
    const updated = await this.registrationRepository.checkIn(id, new Date(), {
      actorId: user.sub || user.id || null
    });

    return updated;
  }
}

export default CheckInRegistrationUseCase;
