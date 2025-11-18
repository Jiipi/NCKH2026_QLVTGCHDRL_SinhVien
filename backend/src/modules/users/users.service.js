/**
 * Users Service - Business Logic Layer
 */

const usersRepo = require('./users.repo');
const { buildScope } = require('../../app/scopes/scopeBuilder');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../app/errors/AppError');
const bcrypt = require('bcryptjs');

const usersService = {
  /**
   * Lấy danh sách users với scope filtering
   */
  async list(user, filters = {}, pagination = {}) {
    // Build scope (currently returns {}) for users
    const scope = await buildScope('users', user);
    // Map incoming filters to actual Prisma schema fields
    const mappedFilters = { ...filters };
    // Capture requested role for later fallback logic
    let requestedRawRole = null;
    if (mappedFilters.vai_tro && mappedFilters.vai_tro.ten_vt) {
      requestedRawRole = mappedFilters.vai_tro.ten_vt;
      mappedFilters.vai_tro = {
        ten_vt: { equals: requestedRawRole, mode: 'insensitive' }
      };
    }
    // Replace legacy isActive with trang_thai filter; always show active accounts
    mappedFilters.trang_thai = 'hoat_dong';
    // If consumer passed filters.fullName / role etc (legacy), ensure they are mapped
    if (mappedFilters.fullName) {
      mappedFilters.ho_ten = mappedFilters.fullName;
      delete mappedFilters.fullName;
    }
    // Merge scope and mapped filters
    let where = { ...scope, ...mappedFilters };

    // Expand teacher role synonyms if GIANG_VIEN requested
    const teacherRequested = requestedRawRole && requestedRawRole.toUpperCase().includes('GIANG_VIEN');
    if (teacherRequested) {
      // Build OR variants (diacritics, spacing, abbreviation)
      where = {
        ...Object.fromEntries(Object.entries(where).filter(([k]) => k !== 'vai_tro')),
        OR: [
          { vai_tro: { ten_vt: { equals: 'GIANG_VIEN', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'GIANG VIEN', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'Giảng viên', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'GIẢNG_VIÊN', mode: 'insensitive' } } },
          { vai_tro: { ten_vt: { equals: 'GV', mode: 'insensitive' } } }
        ],
        trang_thai: 'hoat_dong'
      };
    }

    // Pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    // Fetch raw records (repo already includes relations)
    let result = await usersRepo.findMany({ where, skip, limit, select: {} });

    // Fallback: if teacher role requested but no explicit users found, derive from homeroom teachers
    if (teacherRequested && result.items.length === 0) {
      const { prisma } = require('../../infrastructure/prisma/client');
      // Try a broader variant list via IN before structural fallback
      const roleVariants = ['GIANG_VIEN','GIANG VIEN','Giảng viên','GIẢNG_VIÊN','GV'];
      const variantResult = await prisma.nguoiDung.findMany({
        where: {
          trang_thai: 'hoat_dong',
          vai_tro: { ten_vt: { in: roleVariants, mode: 'insensitive' } }
        },
        include: {
          vai_tro: true,
          sinh_vien: { include: { lop: true } }
        }
      });
      if (variantResult.length > 0) {
        result = { items: variantResult, total: variantResult.length };
      } else {
        // Structural fallback: homeroom teachers from classes
        const classRows = await prisma.lop.findMany({
          select: { id: true, ten_lop: true, chu_nhiem: true }
        });
        const teacherIds = [...new Set(classRows.map(c => c.chu_nhiem).filter(Boolean))];
        if (teacherIds.length) {
          const teacherUsers = await prisma.nguoiDung.findMany({
            where: { id: { in: teacherIds } },
            include: {
              vai_tro: true,
              sinh_vien: { include: { lop: true } }
            }
          });
          result = { items: teacherUsers, total: teacherUsers.length };
        }
      }
    }

    // Transform to legacy frontend shape expected by current UI
    const transformed = result.items.map(u => ({
      id: u.id,
      mssv: u.sinh_vien?.mssv || null,
      fullName: u.ho_ten || u.ten_dn,
      email: u.email,
      role: u.vai_tro?.ten_vt || (teacherRequested ? 'GIANG_VIEN' : null),
      class: u.sinh_vien?.lop?.ten_lop || null,
      faculty: u.sinh_vien?.lop?.khoa || null,
      phone: u.sinh_vien?.sdt || null,
      isActive: u.trang_thai === 'hoat_dong',
      createdAt: u.ngay_tao
    }));

    // Return consistent structure for API response: {items, total, page, limit}
    // Controller will wrap in ApiResponse.success() making final: {success, data: {items, total, ...}}
    return {
      items: transformed,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
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





