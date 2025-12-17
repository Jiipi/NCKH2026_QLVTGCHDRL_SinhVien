/**
 * Registration Access Helper
 * Authorization helper functions for registrations
 * Moved from application/helpers to business/helpers
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import { ForbiddenError } from '../../../../core/errors/AppError';
import type { JwtPayload } from '../../../../core/http/middleware/authJwt';
import type { HoatDong, SinhVien, NguoiDung, Lop } from '@prisma/client';

/**
 * User type for authorization checks
 */
export interface AuthUser extends JwtPayload {
  id?: string;
}

/**
 * Registration with relations for access checks
 */
export interface RegistrationForAccess {
  id?: string;
  userId?: string;
  sv_id?: string;
  sinh_vien?: SinhVien & {
    nguoi_dung_id: string;
    lop_id?: string;
  };
  activity?: HoatDong & {
    nguoi_tao_id?: string;
    createdBy?: string;
  };
}

/**
 * Activity for management checks
 */
export interface ActivityForAccess {
  id?: string;
  nguoi_tao_id?: string;
  createdBy?: string;
}

/**
 * Check if user can access registration
 */
export async function checkAccess(registration: RegistrationForAccess, user: AuthUser): Promise<boolean> {
  // ADMIN: full access
  if (user.role === 'ADMIN') return true;

  // Owner can access
  // Handle both legacy schema (sv_id) and new schema (userId)
  const registrationUserId = registration.userId || registration.sv_id;
  const userSub = user.sub || user.id;
  
  if (registrationUserId && registrationUserId === userSub) return true;
  
  // For legacy schema, check via student
  if (registration.sinh_vien) {
    const studentUserId = registration.sinh_vien.nguoi_dung_id;
    if (studentUserId === userSub) return true;
  }

  // GIANG_VIEN: can access if they created the activity
  if (user.role === 'GIANG_VIEN' && registration.activity) {
    const activityCreatorId = registration.activity.nguoi_tao_id || registration.activity.createdBy;
    if (activityCreatorId === userSub) return true;
  }

  // LOP_TRUONG: can access if registration is from their class
  if (user.role === 'LOP_TRUONG') {
    // Get student's class
    let studentClassId: string | null = null;
    if (registration.sinh_vien && registration.sinh_vien.lop_id) {
      studentClassId = registration.sinh_vien.lop_id;
    } else if (registrationUserId) {
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: registrationUserId },
        select: { lop_id: true }
      });
      if (student) studentClassId = student.lop_id;
    }
    
    // Get user's class
    const userStudent = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userSub },
      select: { lop_id: true }
    });
    
    if (userStudent && studentClassId && userStudent.lop_id === studentClassId) {
      return true;
    }
  }

  throw new ForbiddenError('Bạn không có quyền xem registration này');
}

/**
 * Check if user can approve registration
 */
export async function canApproveRegistration(registration: RegistrationForAccess, user: AuthUser): Promise<boolean> {
  // ADMIN: can approve all
  if (user.role === 'ADMIN') return true;

  const userSub = user.sub || user.id;

  // GIANG_VIEN: can approve if they created the activity
  if (user.role === 'GIANG_VIEN' && registration.activity) {
    const activityCreatorId = registration.activity.nguoi_tao_id || registration.activity.createdBy;
    return activityCreatorId === userSub;
  }

  // LOP_TRUONG: can approve if registration is from their class
  if (user.role === 'LOP_TRUONG') {
    const registrationUserId = registration.userId || registration.sv_id;
    
    // Get student's class
    let studentClassId: string | null = null;
    if (registration.sinh_vien && registration.sinh_vien.lop_id) {
      studentClassId = registration.sinh_vien.lop_id;
    } else if (registrationUserId) {
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: registrationUserId },
        select: { lop_id: true }
      });
      if (student) studentClassId = student.lop_id;
    }
    
    // Get user's class
    const userStudent = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userSub },
      select: { lop_id: true }
    });
    
    return !!(userStudent && studentClassId && userStudent.lop_id === studentClassId);
  }

  return false;
}

/**
 * Check if user can manage activity
 */
export async function canManageActivity(activity: ActivityForAccess, user: AuthUser): Promise<boolean> {
  if (user.role === 'ADMIN') return true;
  
  const userSub = user.sub || user.id;
  const activityCreatorId = activity.nguoi_tao_id || activity.createdBy;
  
  if (user.role === 'GIANG_VIEN' && activityCreatorId === userSub) return true;
  
  return false;
}
