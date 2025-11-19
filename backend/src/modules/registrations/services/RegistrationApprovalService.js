/**
 * Registration Approval Service
 * Handles approval, rejection, and check-in operations
 * Follows Single Responsibility Principle (SRP)
 */

const registrationsRepo = require('../registrations.repo');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../../core/errors/AppError');
const { prisma } = require('../../../infrastructure/prisma/client');
const RegistrationAuthorizationService = require('./RegistrationAuthorizationService');

class RegistrationApprovalService {
  constructor() {
    this.authService = new RegistrationAuthorizationService();
  }

  /**
   * Approve registration (GIANG_VIEN, LOP_TRUONG)
   */
  async approve(id, user) {
    const registration = await registrationsRepo.findById(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check if user can approve this registration
    const canApprove = await this.authService.canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền duyệt registration này');
    }

    // Check current status
    if (registration.status === 'APPROVED') {
      throw new ValidationError('Registration đã được duyệt rồi');
    }

    // Approve
    const updated = await registrationsRepo.update(id, {
      status: 'APPROVED',
      approvedById: user.id,
      approvedAt: new Date()
    });

    return updated;
  }

  /**
   * Reject registration
   */
  async reject(id, reason, user) {
    const registration = await registrationsRepo.findById(id, {
      activity: true,
      user: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check permission
    const canApprove = await this.authService.canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền từ chối registration này');
    }

    // Reject
    const updated = await registrationsRepo.update(id, {
      status: 'REJECTED',
      rejectionReason: reason || 'Không đáp ứng yêu cầu'
    });

    return updated;
  }

  /**
   * Check-in registration (teacher check điểm danh)
   */
  async checkIn(id, user) {
    const registration = await registrationsRepo.findById(id, {
      activity: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check if activity creator or class teacher
    const canCheckIn = await this.authService.canManageActivity(registration.activity, user);
    if (!canCheckIn) {
      throw new ForbiddenError('Bạn không có quyền điểm danh hoạt động này');
    }

    // Check if approved
    if (registration.status !== 'APPROVED') {
      throw new ValidationError('Chỉ có thể điểm danh registration đã được duyệt');
    }

    // Check-in
    const updated = await registrationsRepo.checkIn(id);

    return updated;
  }

  /**
   * Bulk approve registrations
   */
  async bulkApprove(ids, user) {
    // Validate all registrations first
    for (const id of ids) {
      const registration = await registrationsRepo.findById(id, { activity: true });
      if (!registration) {
        throw new NotFoundError(`Registration ${id} không tồn tại`);
      }

      const canApprove = await this.authService.canApproveRegistration(registration, user);
      if (!canApprove) {
        throw new ForbiddenError(`Không có quyền duyệt registration ${id}`);
      }
    }

    // Approve all
    await registrationsRepo.bulkApprove(ids, user.id);

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
      const registration = await registrationsRepo.findById(id, { activity: true });
      if (!registration) {
        throw new NotFoundError(`Registration ${id} không tồn tại`);
      }

      const canApprove = await this.authService.canApproveRegistration(registration, user);
      if (!canApprove) {
        throw new ForbiddenError(`Không có quyền cập nhật registration ${id}`);
      }
    }

    // Update all
    const data = action === 'approve'
      ? { trang_thai_dk: 'da_duyet', ly_do_tu_choi: null, ngay_duyet: new Date() }
      : { trang_thai_dk: 'tu_choi', ly_do_tu_choi: reason || null, ngay_duyet: new Date() };

    const result = await prisma.dangKyHoatDong.updateMany({
      where: { id: { in: ids } },
      data
    });

    return { updated: result.count, message: `Cập nhật ${result.count} registrations thành công` };
  }
}

module.exports = RegistrationApprovalService;

