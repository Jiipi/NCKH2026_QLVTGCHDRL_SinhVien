/**
 * Registration Approval Service
 * Handles approval, rejection, and check-in operations
 * Follows Single Responsibility Principle (SRP)
 */

const { NotFoundError, ForbiddenError, ValidationError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../data/infrastructure/prisma/client');
const { canApproveRegistration } = require('../helpers/registrationAccess');

class RegistrationApprovalService {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  /**
   * Approve registration (GIANG_VIEN, LOP_TRUONG)
   */
  async approve(id, user) {
    const registration = await this.registrationRepository.findById(id, {
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
      ngay_duyet: new Date()
    });

    return updated;
  }

  /**
   * Reject registration
   */
  async reject(id, reason, user) {
    const registration = await this.registrationRepository.findById(id, {
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
      ly_do: reason || 'Không đáp ứng yêu cầu'
    });

    return updated;
  }

  /**
   * Check-in registration (teacher check điểm danh)
   */
  async checkIn(id, user) {
    const registration = await this.registrationRepository.findById(id, {
      activity: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check if activity creator or class teacher
    const { canManageActivity } = require('../helpers/registrationAccess');
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
  async bulkApprove(ids, user) {
    // Validate all registrations first
    for (const id of ids) {
      const registration = await this.registrationRepository.findById(id, { activity: true });
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
  async bulkUpdate(ids, action, reason, user) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('Danh sách ID trống');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new ValidationError('Hành động không hợp lệ');
    }

    // Validate all registrations first
    for (const id of ids) {
      const registration = await this.registrationRepository.findById(id, { activity: true });
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
      await this.registrationRepository.bulkReject(ids, reason);
    }

    return { updated: ids.length, message: `Cập nhật ${ids.length} registrations thành công` };
  }
}

module.exports = RegistrationApprovalService;

