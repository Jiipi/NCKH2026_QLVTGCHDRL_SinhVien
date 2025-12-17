/**
 * Registration Approval Service
 * Handles approval, rejection, and check-in operations
 * Follows Single Responsibility Principle (SRP)
 */

import { NotFoundError, ForbiddenError, ValidationError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { canApproveRegistration, canManageActivity } from '../helpers/registrationAccess';
import type { IRegistrationRepository } from '../interfaces/IRegistrationRepository';
import type { AuthUser, RegistrationForAccess, ActivityForAccess } from '../helpers/registrationAccess';
import type { RegistrationStatusVN, RegistrationStatusEN } from '../../registrations.types';
import type { HoatDong } from '@prisma/client';

/**
 * Registration with status and activity
 */
interface RegistrationWithDetails extends RegistrationForAccess {
  trang_thai_dk?: RegistrationStatusVN;
  status?: RegistrationStatusEN;
  activity?: HoatDong & ActivityForAccess;
}

/**
 * Bulk update result
 */
export interface BulkUpdateResult {
  updated: number;
  message: string;
}

/**
 * Bulk approve result
 */
export interface BulkApproveResult {
  message: string;
  count: number;
}

/**
 * RegistrationApprovalService
 */
export class RegistrationApprovalService {
  private registrationRepository: IRegistrationRepository;

  constructor(registrationRepository: IRegistrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  /**
   * Approve registration (GIANG_VIEN, LOP_TRUONG)
   */
  async approve(id: string, user: AuthUser): Promise<unknown> {
    const registration = await this.registrationRepository.findById<RegistrationWithDetails>(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check if user can approve this registration
    const canApprove = await canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền duyệt registration này');
    }

    // Check current status
    if (registration.status === 'APPROVED' || registration.trang_thai_dk === 'da_duyet') {
      throw new ValidationError('Registration đã được duyệt rồi');
    }

    // Approve
    const updated = await this.registrationRepository.update(id, {
      trang_thai_dk: 'da_duyet',
      ngay_duyet: new Date(),
      nguoi_duyet_id: user?.sub || user?.id
    });

    return updated;
  }

  /**
   * Reject registration
   */
  async reject(id: string, reason: string | undefined, user: AuthUser): Promise<unknown> {
    const registration = await this.registrationRepository.findById<RegistrationWithDetails>(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check permission
    const canApprove = await canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền từ chối registration này');
    }

    // Reject
    const updated = await this.registrationRepository.update(id, {
      trang_thai_dk: 'tu_choi',
      ly_do_tu_choi: reason || 'Không đáp ứng yêu cầu',
      ngay_duyet: new Date(),
      nguoi_duyet_id: user?.sub || user?.id
    });

    return updated;
  }

  /**
   * Check-in registration (teacher check điểm danh)
   */
  async checkIn(id: string, user: AuthUser): Promise<unknown> {
    const registration = await this.registrationRepository.findById<RegistrationWithDetails>(id, {
      activity: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    if (!registration.activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Check if activity creator or class teacher
    const canCheckIn = await canManageActivity(registration.activity, user);
    if (!canCheckIn) {
      throw new ForbiddenError('Bạn không có quyền điểm danh hoạt động này');
    }

    // Check if approved
    if (registration.status !== 'APPROVED' && registration.trang_thai_dk !== 'da_duyet') {
      throw new ValidationError('Chỉ có thể điểm danh registration đã được duyệt');
    }

    // Check-in
    const updated = await this.registrationRepository.checkIn(id);

    return updated;
  }

  /**
   * Bulk approve registrations
   */
  async bulkApprove(ids: string[], user: AuthUser): Promise<BulkApproveResult> {
    // Validate all registrations first
    for (const id of ids) {
      const registration = await this.registrationRepository.findById<RegistrationWithDetails>(id, { activity: true });
      if (!registration) {
        throw new NotFoundError(`Registration ${id} không tồn tại`);
      }

      const canApprove = await canApproveRegistration(registration, user);
      if (!canApprove) {
        throw new ForbiddenError(`Không có quyền duyệt registration ${id}`);
      }
    }

    // Approve all
    const userSub = user.sub || user.id;
    await this.registrationRepository.bulkApprove(ids, userSub);

    return { message: `Đã duyệt ${ids.length} registrations`, count: ids.length };
  }

  /**
   * Bulk update registrations (approve or reject)
   */
  async bulkUpdate(ids: string[], action: 'approve' | 'reject', reason: string | undefined, user: AuthUser): Promise<BulkUpdateResult> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('Danh sách ID trống');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new ValidationError('Hành động không hợp lệ');
    }

    // Validate all registrations first
    for (const id of ids) {
      const registration = await this.registrationRepository.findById<RegistrationWithDetails>(id, { activity: true });
      if (!registration) {
        throw new NotFoundError(`Registration ${id} không tồn tại`);
      }

      const canApprove = await canApproveRegistration(registration, user);
      if (!canApprove) {
        throw new ForbiddenError(`Không có quyền cập nhật registration ${id}`);
      }
    }

    // Update all
    const userSub = user.sub || user.id;
    if (action === 'approve') {
      await this.registrationRepository.bulkApprove(ids, userSub);
    } else {
      await this.registrationRepository.bulkReject(ids, reason, userSub);
    }

    return { updated: ids.length, message: `Cập nhật ${ids.length} registrations thành công` };
  }
}

export default RegistrationApprovalService;
module.exports = RegistrationApprovalService;
