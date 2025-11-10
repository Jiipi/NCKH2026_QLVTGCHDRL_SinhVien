const { prisma } = require('../config/database');

/**
 * Reference Data Service
 * Handles queries for faculties, classes, roles, and other reference data
 */
class ReferenceDataService {
  /**
   * Get list of all faculties (distinct from classes)
   * Returns sorted list of faculty names
   */
  static async getFaculties() {
    try {
      const faculties = await prisma.lop.findMany({
        distinct: ['khoa'],
        select: { khoa: true },
        orderBy: { khoa: 'asc' }
      });
      return faculties.map(f => f.khoa).filter(Boolean);
    } catch (error) {
      console.error('Error getting faculties:', error);
      throw error;
    }
  }

  /**
   * Get list of classes, optionally filtered by faculty
   */
  static async getClassesByFaculty(faculty) {
    try {
      const classes = await prisma.lop.findMany({
        where: faculty ? { khoa: faculty } : {},
        select: { 
          id: true, 
          ten_lop: true, 
          khoa: true, 
          nien_khoa: true 
        },
        orderBy: [
          { khoa: 'asc' }, 
          { ten_lop: 'asc' }
        ]
      });
      return classes;
    } catch (error) {
      console.error('Error getting classes:', error);
      throw error;
    }
  }

  /**
   * Get class information by ID
   */
  static async getClassById(lopId) {
    try {
      return await prisma.lop.findUnique({ 
        where: { id: lopId } 
      });
    } catch (error) {
      console.error('Error getting class by ID:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * Returns basic user information with role
   */
  static async getAllUsers() {
    try {
      const users = await prisma.nguoiDung.findMany({
        select: {
          id: true,
          ten_dn: true,
          email: true,
          ho_ten: true,
          trang_thai: true,
          ngay_tao: true,
          vai_tro: {
            select: { ten_vt: true }
          }
        },
        orderBy: { ngay_tao: 'desc' }
      });
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get all roles with descriptions
   */
  static async getAllRoles() {
    try {
      const roles = await prisma.vaiTro.findMany({
        select: { 
          id: true, 
          ten_vt: true, 
          mo_ta: true 
        },
        orderBy: { ten_vt: 'asc' }
      });
      return roles;
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw error;
    }
  }

  /**
   * Get non-admin roles only
   * Used for user management to prevent unauthorized role escalation
   */
  static async getNonAdminRoles() {
    try {
      const roles = await prisma.vaiTro.findMany({
        where: { ten_vt: { not: 'ADMIN' } },
        orderBy: { ten_vt: 'asc' },
        select: { 
          id: true, 
          ten_vt: true, 
          mo_ta: true 
        }
      });
      return roles;
    } catch (error) {
      console.error('Error getting non-admin roles:', error);
      throw error;
    }
  }

  /**
   * Get demo users by usernames
   * Used for testing and demo purposes
   */
  static async getDemoUsers(usernames) {
    try {
      const users = await prisma.nguoiDung.findMany({
        where: { ten_dn: { in: usernames } },
        select: { 
          ten_dn: true, 
          email: true, 
          ho_ten: true 
        }
      });
      return users;
    } catch (error) {
      console.error('Error getting demo users:', error);
      throw error;
    }
  }

  // Vietnamese aliases for backward compatibility
  static layDanhSachKhoa() {
    return this.getFaculties();
  }

  static layDanhSachLopTheoKhoa(faculty) {
    return this.getClassesByFaculty(faculty);
  }

  static layThongTinLopTheoId(lopId) {
    return this.getClassById(lopId);
  }

  static layDanhSachTatCaNguoiDung() {
    return this.getAllUsers();
  }

  static layDanhSachTatCaVaiTro() {
    return this.getAllRoles();
  }

  static layDanhSachVaiTroKhongPhaiAdmin() {
    return this.getNonAdminRoles();
  }

  static layDanhSachDemoUsers(usernames) {
    return this.getDemoUsers(usernames);
  }
}

module.exports = ReferenceDataService;
