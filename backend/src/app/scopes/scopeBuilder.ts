/**
 * Scope Builder
 * Tự động build WHERE clause dựa trên role để filter data theo phạm vi
 * 
 * Rules:
 * - ADMIN: Thấy tất cả
 * - GIANG_VIEN: Chỉ thấy data của các lớp mình phụ trách
 * - LOP_TRUONG / SINH_VIEN: Chỉ thấy data của lớp mình
 * 
 * @module app/scopes/scopeBuilder
 */

import { prisma } from '../../data/infrastructure/prisma/client';
import { logError } from '../../core/logger';
import { normalizeRoleName } from '../../core/utils/roleHelper';

/**
 * User object from JWT token
 */
interface ScopeUser {
  sub: string;
  role: string;
  [key: string]: unknown;
}

/**
 * Scope WHERE clause type (Prisma compatible)
 */
type ScopeClause = Record<string, unknown>;

/**
 * Build scope WHERE clause for a resource based on user role
 * @param resource - Resource name (activities, registrations, etc.)
 * @param user - User object from JWT
 * @returns WHERE clause object for Prisma
 */
async function buildScope(resource: string, user: ScopeUser): Promise<ScopeClause> {
  const { role, sub: userId } = user;
  const normalizedRole = normalizeRoleName(role);
  
  try {
    switch (normalizedRole) {
      case 'ADMIN':
        // Admin sees everything
        return {};
      
      case 'GIANG_VIEN':
        return await buildTeacherScope(resource, userId);
      
      case 'LOP_TRUONG':
      case 'SINH_VIEN':
        return await buildStudentScope(resource, userId);
      
      default:
        // Unknown role -> deny all
        console.warn(`[Scope] Unknown role: ${role}`);
        return { id: -1 };
    }
  } catch (error) {
    logError('[Scope] Error building scope', error as Error, { resource, role, userId });
    // On error, be safe and deny all
    return { id: -1 };
  }
}

/**
 * Build scope for GIANG_VIEN (teacher)
 * Teachers only see data from classes they supervise
 * @param resource - Resource name
 * @param userId - User ID
 * @returns Scope clause for Prisma
 */
async function buildTeacherScope(resource: string, userId: string): Promise<ScopeClause> {
  // Get all classes where teacher is homeroom teacher (chu_nhiem)
  const classes = await prisma.lop.findMany({
    where: { chu_nhiem: userId },
    select: { id: true }
  });
  
  const classIds = classes.map((c: { id: string }) => c.id);
  
  if (classIds.length === 0) {
    // Teacher has no classes -> see nothing
    return { id: { equals: 'NEVER_MATCH' } };
  }
  
  // Apply scope based on resource type
  switch (resource) {
    case 'activities':
      // Teachers see activities created by students in their homeroom classes + themselves
      // Get all student user IDs in teacher's classes
      const students = await prisma.sinhVien.findMany({
        where: { lop_id: { in: classIds } },
        select: { nguoi_dung_id: true }
      });
      const studentUserIds = students
        .map((s: { nguoi_dung_id: string | null }) => s.nguoi_dung_id)
        .filter((id): id is string => Boolean(id));
      
      // Add teacher's own user ID to creators list
      const classCreators = [...studentUserIds, userId].filter(Boolean);
      
      if (classCreators.length === 0) {
        return { id: { equals: 'NEVER_MATCH' } };
      }
      
      // Filter by creator (activities created by students in teacher's classes + teacher)
      return { nguoi_tao_id: { in: classCreators } };
    
    case 'registrations':
      // Filter by students in teacher's classes
      return { 
        sinh_vien: {
          lop_id: { in: classIds }
        }
      };
    
    case 'students':
      // Filter students in teacher's classes
      return { lop_id: { in: classIds } };
    
    case 'classes':
      // Filter to only teacher's classes
      return { id: { in: classIds } };
    
    default:
      // Unknown resource -> no scope
      return {};
  }
}

/**
 * Build scope for SINH_VIEN and LOP_TRUONG (students and class monitors)
 * They only see data from their own class
 * @param resource - Resource name
 * @param userId - User ID
 * @returns Scope clause for Prisma
 */
async function buildStudentScope(resource: string, userId: string): Promise<ScopeClause> {
  // Get student info to find their class
  const student = await prisma.sinhVien.findUnique({
    where: { nguoi_dung_id: userId },
    select: { lop_id: true, id: true }
  });
  
  if (!student || !student.lop_id) {
    // Student has no class -> see nothing
    return { id: { equals: 'NEVER_MATCH' } };
  }
  
  const { lop_id, id: studentId } = student;
  
  // Get class creators (all students in class + homeroom teacher)
  const classStudents = await prisma.sinhVien.findMany({
    where: { lop_id },
    select: { nguoi_dung_id: true }
  });
  const classCreatorUserIds = classStudents
    .map((s: { nguoi_dung_id: string | null }) => s.nguoi_dung_id)
    .filter((id): id is string => Boolean(id));
  
  // Get homeroom teacher
  const lop = await prisma.lop.findUnique({
    where: { id: lop_id },
    select: { chu_nhiem: true }
  });
  if (lop?.chu_nhiem) {
    classCreatorUserIds.push(lop.chu_nhiem);
  }
  
  if (classCreatorUserIds.length === 0) {
    return { id: { equals: 'NEVER_MATCH' } };
  }
  
  // Apply scope based on resource type
  switch (resource) {
    case 'activities':
      // Students see activities created by class creators (students in their class + GVCN)
      return { nguoi_tao_id: { in: classCreatorUserIds } };
    
    case 'registrations':
      // Students see all registrations from their class
      // (LOP_TRUONG needs to see all to approve, SINH_VIEN sees all to browse)
      return { lop_id };
    
    case 'students':
      // Students see classmates
      return { lop_id };
    
    case 'classes':
      // Students see only their class
      return { id: lop_id };
    
    default:
      // Unknown resource -> no scope
      return {};
  }
}

/**
 * Build scope for "my own" resources (e.g., my registrations, my activities)
 * Used when user wants to see only items they created/own
 * @param resource - Resource name
 * @param user - User object from JWT
 * @returns Ownership scope clause for Prisma
 */
async function buildOwnershipScope(resource: string, user: ScopeUser): Promise<ScopeClause> {
  const { role, sub: userId } = user;
  const normalizedRole = normalizeRoleName(role);
  
  // Admin can see all even with ownership filter
  if (normalizedRole === 'ADMIN') {
    return {};
  }
  
  switch (resource) {
    case 'activities':
      // Items created by this user
      return { nguoi_tao_id: userId };
    
    case 'registrations':
      // Registrations by this student
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { id: true }
      });
      
      if (!student) return { id: -1 };
      
      return { sinh_vien_id: student.id };
    
    default:
      return {};
  }
}

/**
 * Check if user can access a specific item (ownership check)
 * Used for UPDATE and DELETE operations
 * @param resource - Resource name
 * @param itemId - Item ID to check access for
 * @param user - User object from JWT
 * @returns Whether user can access the item
 */
async function canAccessItem(resource: string, itemId: string, user: ScopeUser): Promise<boolean> {
  const { role, sub: userId } = user;
  const normalizedRole = normalizeRoleName(role);
  
  // Admin can access everything
  if (normalizedRole === 'ADMIN') {
    return true;
  }
  
  try {
    switch (resource) {
      case 'activities':
        // ✅ FIX: Don't use scope here - just check ownership/role
        // Scope may contain fields not present in hoat_dong table (e.g., lop_id)
        const activity = await prisma.hoatDong.findUnique({
          where: { id: itemId },
          select: { id: true, nguoi_tao_id: true }
        });
        
        if (!activity) {
          console.log('❌ Activity not found:', { itemId, userId });
          return false;
        }
        
        // ✅ Allow creator OR elevated roles (GIANG_VIEN, LOP_TRUONG)
        const isCreator = activity.nguoi_tao_id === userId;
        const isElevated = ['GIANG_VIEN', 'LOP_TRUONG'].includes(normalizedRole);
        
        console.log('🔍 Activity access check:', { 
          itemId, 
          userId, 
          creatorId: activity.nguoi_tao_id,
          isCreator, 
          isElevated,
          role: normalizedRole 
        });
        
        return isCreator || isElevated;
      
      case 'registrations':
        // ✅ FIX: Don't use scope - just check ownership/role
        const registration = await prisma.dangKyHoatDong.findUnique({
          where: { id: itemId },
          select: { id: true, sinh_vien: { select: { nguoi_dung_id: true } } }
        });
        
        if (!registration) return false;
        
        // Owner or elevated role can access
        return registration.sinh_vien?.nguoi_dung_id === userId || ['GIANG_VIEN', 'LOP_TRUONG'].includes(normalizedRole);
      
      default:
        // Unknown resource -> check if exists in scope
        return false;
    }
  } catch (error) {
    logError('[Scope] Error checking item access', error as Error, { resource, itemId, userId });
    return false;
  }
}

export {
  buildScope,
  buildOwnershipScope,
  canAccessItem,
  ScopeUser,
  ScopeClause
};

export default {
  buildScope,
  buildOwnershipScope,
  canAccessItem
};

// CommonJS compatibility
module.exports = {
  buildScope,
  buildOwnershipScope,
  canAccessItem
};
