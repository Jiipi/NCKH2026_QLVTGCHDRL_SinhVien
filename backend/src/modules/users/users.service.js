/**
 * Users Service - Business Logic Layer
 */

const usersRepo = require('./users.repo');
const { buildScope } = require('../../shared/scopes/scopeBuilder');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../shared/errors/AppError');
const bcrypt = require('bcryptjs');

const usersService = {
  /**
   * Lấy danh sách users với scope filtering
   */
  async list(user, filters = {}, pagination = {}) {
    // Build scope
    const scope = await buildScope('users', user);
    const where = { ...scope, ...filters, isActive: true };

    // Pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    // Don't return password
    const select = {
      id: true,
      mssv: true,
      fullName: true,
      email: true,
      role: true,
      class: true,
      major: true,
      faculty: true,
      phone: true,
      isActive: true,
      createdAt: true
    };

    const result = await usersRepo.findMany({ where, skip, limit, select });

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
   * Lấy user theo ID
   */
  async getById(id, user) {
    const targetUser = await usersRepo.findById(id, {
      id: true,
      mssv: true,
      fullName: true,
      email: true,
      role: true,
      class: true,
      major: true,
      faculty: true,
      phone: true,
      address: true,
      isActive: true,
      createdAt: true
    });

    if (!targetUser) {
      throw new NotFoundError('User không tồn tại');
    }

    // Check authorization
    await this.checkAccess(targetUser, user);

    return targetUser;
  },

  /**
   * Tạo user mới (ADMIN only)
   */
  async create(data, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được tạo user');
    }

    // Validate
    if (!data.mssv || !data.fullName || !data.email || !data.password) {
      throw new ValidationError('Thiếu thông tin bắt buộc');
    }

    // Check duplicate MSSV
    const existingMSSV = await usersRepo.findByMSSV(data.mssv);
    if (existingMSSV) {
      throw new ValidationError('MSSV đã tồn tại');
    }

    // Check duplicate email
    const existingEmail = await usersRepo.findByEmail(data.email);
    if (existingEmail) {
      throw new ValidationError('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const newUser = await usersRepo.create({
      ...data,
      password: hashedPassword
    });

    // Remove password from response
    delete newUser.password;

    return newUser;
  },

  /**
   * Update user
   */
  async update(id, data, user) {
    const targetUser = await usersRepo.findById(id);

    if (!targetUser) {
      throw new NotFoundError('User không tồn tại');
    }

    // Authorization check
    const canUpdate = user.role === 'ADMIN' || parseInt(id) === user.id;
    if (!canUpdate) {
      throw new ForbiddenError('Bạn không có quyền cập nhật user này');
    }

    // Non-admin cannot change role
    if (data.role && user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được thay đổi role');
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Update
    const updated = await usersRepo.update(id, data);

    // Remove password from response
    delete updated.password;

    return updated;
  },

  /**
   * Delete user (ADMIN only)
   */
  async delete(id, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xóa user');
    }

    const targetUser = await usersRepo.findById(id);
    if (!targetUser) {
      throw new NotFoundError('User không tồn tại');
    }

    // Soft delete
    await usersRepo.softDelete(id);

    return { message: 'Đã xóa user thành công' };
  },

  /**
   * Search users
   */
  async search(searchTerm, user) {
    const users = await usersRepo.search(searchTerm);

    // Apply scope filtering
    const scope = await buildScope('users', user);
    const filtered = users.filter(u => {
      if (scope.class) return u.class === scope.class;
      if (scope.id) return u.id === scope.id;
      return true;
    });

    // Remove passwords
    filtered.forEach(u => delete u.password);

    return filtered;
  },

  /**
   * Get user stats (ADMIN only)
   */
  async getStats(user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xem stats');
    }

    return await usersRepo.getStats();
  },

  /**
   * Get users by class (LOP_TRUONG, GIANG_VIEN, ADMIN)
   */
  async getByClass(className, user) {
    // Authorization
    if (user.role === 'SINH_VIEN') {
      throw new ForbiddenError('Bạn không có quyền xem danh sách lớp');
    }

    if (user.role === 'LOP_TRUONG' && user.class !== className) {
      throw new ForbiddenError('Bạn chỉ được xem lớp của mình');
    }

    const users = await usersRepo.findByClass(className);

    // Remove passwords
    users.forEach(u => delete u.password);

    return users;
  },

  // ========== Helper Methods ==========

  async checkAccess(targetUser, user) {
    // ADMIN: full access
    if (user.role === 'ADMIN') return true;

    // Own profile
    if (targetUser.id === user.id) return true;

    // LOP_TRUONG: can view same class
    if (user.role === 'LOP_TRUONG' && targetUser.class === user.class) return true;

    // GIANG_VIEN: can view all students (simplified - should check assigned classes)
    if (user.role === 'GIANG_VIEN') return true;

    throw new ForbiddenError('Bạn không có quyền xem user này');
  }
};

module.exports = usersService;
