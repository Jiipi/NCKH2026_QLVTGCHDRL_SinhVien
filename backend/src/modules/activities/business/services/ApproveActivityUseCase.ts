/**
 * ApproveActivityUseCase
 * Use case for approving an activity
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import crypto from 'crypto';
import type { HoatDong, Prisma } from '@prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';

/**
 * Update data for approving activity
 */
interface ApproveUpdateData {
  trang_thai: 'da_duyet';
  qr?: string;
}

/**
 * ApproveActivityUseCase
 */
class ApproveActivityUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(id: string): Promise<HoatDong> {
    const activity = await this.activityRepository.findById(id);

    if (!activity) {
      throw new NotFoundError('Không tìm thấy hoạt động');
    }

    if (activity.trang_thai === 'da_duyet') {
      throw new ValidationError('Hoạt động đã được duyệt');
    }

    // Generate QR token if not exists
    const updateData: ApproveUpdateData = {
      trang_thai: 'da_duyet'
    };

    if (!activity.qr) {
      updateData.qr = this.generateQRToken();
    }

    return this.activityRepository.update(id, updateData as Prisma.HoatDongUpdateInput);
  }

  generateQRToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

export default ApproveActivityUseCase;
module.exports = ApproveActivityUseCase;
