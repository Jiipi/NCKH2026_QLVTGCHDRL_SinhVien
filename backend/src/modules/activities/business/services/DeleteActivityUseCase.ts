import type { HoatDong, Prisma } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import { canAccessItem } from '../../../../app/scopes/scopeBuilder';

interface User {
  sub: string;
  role: string;
  [key: string]: unknown;
}

interface Scope {
  activityFilter?: Prisma.HoatDongWhereInput;
}

/**
 * DeleteActivityUseCase
 * Use case for deleting an activity
 * Follows Single Responsibility Principle (SRP)
 */
class DeleteActivityUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id: string, user: User, scope?: Scope, semesterInfo?: { hoc_ky: string; nam_hoc: string }): Promise<HoatDong> {
    // Check if activity exists in scope and validate semester
    const existing = await this.activityRepository.findById(id, scope?.activityFilter || {}, null, semesterInfo);

    if (!existing) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền xóa hoạt động này');
    }

    // Check if activity has registrations
    const registrationCount = await this.activityRepository.countRegistrationsByActivity(id);

    if (registrationCount > 0) {
      throw new ValidationError('Không thể xóa hoạt động đã có người đăng ký');
    }

    return this.activityRepository.delete(id);
  }
}

export default DeleteActivityUseCase;
