/**
 * Classes Service - Business Logic Layer
 */

const classesRepo = require('./classes.repo');
const { buildScope } = require('../../shared/scopes/scopeBuilder');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../shared/errors/AppError');

const classesService = {
  /**
   * Lấy danh sách classes với scope
   */
  async list(user, filters = {}, pagination = {}) {
    // Build scope
    const scope = await buildScope('classes', user);
    const where = { ...scope, ...filters };

    // Pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    const result = await classesRepo.findMany({ where, skip, limit });

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
   * Lấy class theo ID
   */
  async getById(id, user, includeStudents = false) {
    const classData = await classesRepo.findById(id, {
      students: includeStudents,
      teachers: true
    });

    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Check authorization
    await this.checkAccess(classData, user);

    return classData;
  },

  /**
   * Tạo class mới (ADMIN only)
   */
  async create(data, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được tạo class');
    }

    // Validate
    if (!data.name) {
      throw new ValidationError('Tên class là bắt buộc');
    }

    // Check duplicate
    const existing = await classesRepo.findByName(data.name);
    if (existing) {
      throw new ValidationError('Class đã tồn tại');
    }

    // Create
    const newClass = await classesRepo.create(data);

    return newClass;
  },

  /**
   * Update class (ADMIN only)
   */
  async update(id, data, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được cập nhật class');
    }

    const classData = await classesRepo.findById(id);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Update
    const updated = await classesRepo.update(id, data);

    return updated;
  },

  /**
   * Delete class (ADMIN only)
   */
  async delete(id, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được xóa class');
    }

    const classData = await classesRepo.findById(id);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Check if class has students
    const stats = await classesRepo.getStats(id);
    if (stats && stats.totalStudents > 0) {
      throw new ValidationError('Không thể xóa class đang có sinh viên');
    }

    // Delete
    await classesRepo.delete(id);

    return { message: 'Đã xóa class thành công' };
  },

  /**
   * Assign teacher to class (ADMIN only)
   */
  async assignTeacher(classId, teacherId, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được gán giảng viên');
    }

    const classData = await classesRepo.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Assign
    await classesRepo.assignTeacher(classId, teacherId);

    return { message: 'Đã gán giảng viên thành công' };
  },

  /**
   * Remove teacher from class (ADMIN only)
   */
  async removeTeacher(classId, teacherId, user) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ ADMIN mới được gỡ giảng viên');
    }

    const classData = await classesRepo.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Remove
    await classesRepo.removeTeacher(classId, teacherId);

    return { message: 'Đã gỡ giảng viên thành công' };
  },

  /**
   * Get class stats
   */
  async getStats(classId, user) {
    const classData = await classesRepo.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class không tồn tại');
    }

    // Check authorization
    await this.checkAccess(classData, user);

    const stats = await classesRepo.getStats(classId);

    return stats;
  },

  /**
   * Get classes by faculty
   */
  async getByFaculty(faculty, user) {
    // Only ADMIN and GIANG_VIEN can list by faculty
    if (user.role === 'SINH_VIEN' || user.role === 'LOP_TRUONG') {
      throw new ForbiddenError('Bạn không có quyền xem danh sách này');
    }

    const classes = await classesRepo.findByFaculty(faculty);

    return classes;
  },

  // ========== Helper Methods ==========

  async checkAccess(classData, user) {
    // ADMIN: full access
    if (user.role === 'ADMIN') return true;

    // GIANG_VIEN: can view all classes (simplified)
    if (user.role === 'GIANG_VIEN') return true;

    // LOP_TRUONG, SINH_VIEN: can only view their own class
    if (classData.name === user.class) return true;

    throw new ForbiddenError('Bạn không có quyền xem class này');
  }
};

module.exports = classesService;
