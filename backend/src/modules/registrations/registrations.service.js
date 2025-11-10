/**
 * Registrations Service - Business Logic Layer
 * Xử lý validation, authorization, normalization
 */

const registrationsRepo = require('./registrations.repo');
const { buildScope } = require('../../shared/scopes/scopeBuilder');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../shared/errors/AppError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registrationsService = {
  /**
   * Lấy danh sách registrations với scope filtering
   */
  async list(user, filters = {}, pagination = {}) {
    // Build scope based on user role
    const scope = await buildScope('registrations', user);
    
    // Merge scope với filters
    const where = { ...scope, ...filters };

    // Pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    // Include related data
    const include = {
      activity: true,
      user: true,
      approvedBy: filters.includeApprover !== false
    };

    const result = await registrationsRepo.findMany({
      where,
      skip,
      limit,
      include
    });

    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  },

  /**
   * Lấy registration theo ID với authorization check
   */
  async getById(id, user) {
    const registration = await registrationsRepo.findById(id, {
      activity: true,
      user: true,
      approvedBy: true
    });

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Check authorization
    await this.checkAccess(registration, user);

    return registration;
  },

  /**
   * Tạo registration mới (student đăng ký hoạt động)
   */
  async create(data, user) {
    // Validate input
    if (!data.activityId) {
      throw new ValidationError('activityId là bắt buộc');
    }

    // Check activity exists và còn slot
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(data.activityId) },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Check activity status
    if (activity.status !== 'PUBLISHED') {
      throw new ValidationError('Hoạt động chưa mở đăng ký');
    }

    // Check max participants
    if (activity.maxParticipants && activity._count.registrations >= activity.maxParticipants) {
      throw new ValidationError('Hoạt động đã đủ số lượng đăng ký');
    }

    // Check duplicate registration
    const existing = await registrationsRepo.findByUserAndActivity(
      data.userId || user.id,
      data.activityId
    );

    if (existing) {
      throw new ValidationError('Bạn đã đăng ký hoạt động này rồi');
    }

    // Check registration deadline
    const now = new Date();
    if (activity.registrationDeadline && now > new Date(activity.registrationDeadline)) {
      throw new ValidationError('Đã hết hạn đăng ký');
    }

    // Create registration
    const registration = await registrationsRepo.create({
      userId: data.userId || user.id,
      activityId: data.activityId,
      status: 'PENDING',
      note: data.note
    });

    return registration;
  },

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
    const canApprove = await this.canApproveRegistration(registration, user);
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
  },

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
    const canApprove = await this.canApproveRegistration(registration, user);
    if (!canApprove) {
      throw new ForbiddenError('Bạn không có quyền từ chối registration này');
    }

    // Reject
    const updated = await registrationsRepo.update(id, {
      status: 'REJECTED',
      rejectionReason: reason || 'Không đáp ứng yêu cầu'
    });

    return updated;
  },

  /**
   * Cancel registration (student tự hủy)
   */
  async cancel(id, user) {
    const registration = await registrationsRepo.findById(id);

    if (!registration) {
      throw new NotFoundError('Registration không tồn tại');
    }

    // Only owner can cancel
    if (registration.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('Bạn chỉ có thể hủy đăng ký của mình');
    }

    // Check if can cancel (chưa approve)
    if (registration.status === 'APPROVED') {
      throw new ValidationError('Không thể hủy đăng ký đã được duyệt');
    }

    // Delete registration
    await registrationsRepo.delete(id);

    return { message: 'Đã hủy đăng ký thành công' };
  },

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
    const canCheckIn = await this.canManageActivity(registration.activity, user);
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
  },

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

      const canApprove = await this.canApproveRegistration(registration, user);
      if (!canApprove) {
        throw new ForbiddenError(`Không có quyền duyệt registration ${id}`);
      }
    }

    // Approve all
    await registrationsRepo.bulkApprove(ids, user.id);

    return { message: `Đã duyệt ${ids.length} registrations`, count: ids.length };
  },

  /**
   * Get activity stats
   */
  async getActivityStats(activityId, user) {
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(activityId) }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Check access
    const canView = await this.canManageActivity(activity, user);
    if (!canView && user.role !== 'SINH_VIEN') {
      throw new ForbiddenError('Không có quyền xem thống kê');
    }

    const stats = await registrationsRepo.getActivityStats(activityId);

    return stats;
  },

  /**
   * Get user's registrations
   */
  async getMyRegistrations(user, filters = {}) {
    const registrations = await registrationsRepo.findByUser(user.id, filters);
    return registrations;
  },

  // ========== Helper Methods ==========

  /**
   * Check if user can access registration
   */
  async checkAccess(registration, user) {
    // ADMIN: full access
    if (user.role === 'ADMIN') return true;

    // Owner can access
    if (registration.userId === user.id) return true;

    // GIANG_VIEN: can access if they created the activity
    if (user.role === 'GIANG_VIEN' && registration.activity) {
      if (registration.activity.createdBy === user.id) return true;
    }

    // LOP_TRUONG: can access if registration is from their class
    if (user.role === 'LOP_TRUONG') {
      const regUser = await prisma.user.findUnique({
        where: { id: registration.userId }
      });
      if (regUser && regUser.class === user.class) return true;
    }

    throw new ForbiddenError('Bạn không có quyền xem registration này');
  },

  /**
   * Check if user can approve registration
   */
  async canApproveRegistration(registration, user) {
    // ADMIN: can approve all
    if (user.role === 'ADMIN') return true;

    // GIANG_VIEN: can approve if they created the activity
    if (user.role === 'GIANG_VIEN' && registration.activity) {
      return registration.activity.createdBy === user.id;
    }

    // LOP_TRUONG: can approve if registration is from their class
    if (user.role === 'LOP_TRUONG') {
      const regUser = await prisma.user.findUnique({
        where: { id: registration.userId }
      });
      return regUser && regUser.class === user.class;
    }

    return false;
  },

  /**
   * Check if user can manage activity
   */
  async canManageActivity(activity, user) {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'GIANG_VIEN' && activity.createdBy === user.id) return true;
    return false;
  },

  /**
   * Register for activity (student registers for activity)
   */
  async register(activityId, user) {
    // Check if activity exists
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId },
      include: {
        _count: {
          select: { dang_ky: true }
        }
      }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động', activityId);
    }

    // Check if activity is approved
    if (activity.trang_thai !== 'da_duyet') {
      throw new ValidationError('Hoạt động chưa được duyệt hoặc đã bị từ chối');
    }

    // Check registration deadline
    if (activity.han_dk) {
      const now = new Date();
      if (now > new Date(activity.han_dk)) {
        throw new ValidationError('Đã hết hạn đăng ký hoạt động này');
      }
    }

    // Check max participants
    if (activity.sl_toi_da && activity._count.dang_ky >= activity.sl_toi_da) {
      throw new ValidationError('Hoạt động đã đủ số lượng đăng ký');
    }

    // Get student info
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub }
    });

    if (!student) {
      throw new ForbiddenError('Chỉ sinh viên mới có thể đăng ký hoạt động');
    }

    // Check if already registered
    const existing = await prisma.dangKyHoatDong.findUnique({
      where: {
        sv_id_hd_id: {
          sv_id: student.id,
          hd_id: activityId
        }
      }
    });

    if (existing) {
      throw new ValidationError('Bạn đã đăng ký hoạt động này rồi');
    }

    // Create registration
    const registration = await prisma.dangKyHoatDong.create({
      data: {
        sv_id: student.id,
        hd_id: activityId,
        trang_thai_dk: 'cho_duyet'
      },
      include: {
        hoat_dong: true,
        sinh_vien: {
          include: {
            nguoi_dung: true
          }
        }
      }
    });

    return registration;
  }
};

module.exports = registrationsService;
