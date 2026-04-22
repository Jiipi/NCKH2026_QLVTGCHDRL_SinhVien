/**
 * Reference Data Service
 * Handles queries for faculties, classes, roles, and other reference data
 */

import { prisma } from '../../data/infrastructure/prisma/client';
import type { Lop } from '@prisma/client';

// Types
interface ClassInfo {
  id: string;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
}

interface UserInfo {
  id: string;
  ten_dn: string;
  email: string | null;
  ho_ten: string;
  trang_thai: string;
  ngay_tao: Date;
  vai_tro: {
    ten_vt: string;
  } | null;
}

interface RoleInfo {
  id: string;
  ten_vt: string;
  mo_ta: string | null;
}

interface DemoUserInfo {
  ten_dn: string;
  email: string | null;
  ho_ten: string;
}

/**
 * Service for reference data queries
 */
class ReferenceDataService {
  /**
   * Get list of all faculties (distinct from classes)
   * Returns sorted list of faculty names
   */
  static async getFaculties(): Promise<string[]> {
    try {
      const faculties = await prisma.lop.findMany({
        distinct: ['khoa'],
        select: { khoa: true },
        orderBy: { khoa: 'asc' }
      });
      return faculties.map(f => f.khoa).filter((k): k is string => k !== null);
    } catch (error) {
      console.error('Error getting faculties:', error);
      throw error;
    }
  }

  /**
   * Get all classes (no filter)
   */
  static async getAllClasses(): Promise<ClassInfo[]> {
    try {
      const classes = await prisma.lop.findMany({
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
      console.error('Error getting all classes:', error);
      throw error;
    }
  }

  /**
   * Get list of classes, optionally filtered by faculty
   */
  static async getClassesByFaculty(faculty?: string): Promise<ClassInfo[]> {
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
  static async getClassById(lopId: string): Promise<Lop | null> {
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
  static async getAllUsers(): Promise<UserInfo[]> {
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
      return users as UserInfo[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get all roles with descriptions
   */
  static async getAllRoles(): Promise<RoleInfo[]> {
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
  static async getNonAdminRoles(): Promise<RoleInfo[]> {
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
  static async getDemoUsers(usernames: string[]): Promise<DemoUserInfo[]> {
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
  static layDanhSachKhoa(): Promise<string[]> {
    return this.getFaculties();
  }

  static layDanhSachLopTheoKhoa(faculty?: string): Promise<ClassInfo[]> {
    return this.getClassesByFaculty(faculty);
  }

  static layThongTinLopTheoId(lopId: string): Promise<Lop | null> {
    return this.getClassById(lopId);
  }

  static layDanhSachTatCaNguoiDung(): Promise<UserInfo[]> {
    return this.getAllUsers();
  }

  static layDanhSachTatCaVaiTro(): Promise<RoleInfo[]> {
    return this.getAllRoles();
  }

  static layDanhSachVaiTroKhongPhaiAdmin(): Promise<RoleInfo[]> {
    return this.getNonAdminRoles();
  }

  static layDanhSachDemoUsers(usernames: string[]): Promise<DemoUserInfo[]> {
    return this.getDemoUsers(usernames);
  }
}

export default ReferenceDataService;
export { ReferenceDataService, ClassInfo, UserInfo, RoleInfo, DemoUserInfo };
