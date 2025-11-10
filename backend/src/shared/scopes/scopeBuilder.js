/**
 * Scope Builder
 * Tự động build WHERE clause dựa trên role để filter data theo phạm vi
 * 
 * Rules:
 * - ADMIN: Thấy tất cả
 * - GIANG_VIEN: Chỉ thấy data của các lớp mình phụ trách
 * - LOP_TRUONG / SINH_VIEN: Chỉ thấy data của lớp mình
 */

const { prisma } = require('../../config/database');
const { logError } = require('../../utils/logger');
const { normalizeRole } = require('../policies');

/**
 * Build scope WHERE clause for a resource based on user role
 * @param {string} resource - Resource name (activities, registrations, etc.)
 * @param {Object} user - User object from JWT { sub, role, ... }
 * @returns {Promise<Object>} WHERE clause object for Prisma
 */
async function buildScope(resource, user) {
  const { role, sub: userId } = user;
  const normalizedRole = normalizeRole(role);
  
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
    logError('[Scope] Error building scope', error, { resource, role, userId });
    // On error, be safe and deny all
    return { id: -1 };
  }
}

/**
 * Build scope for GIANG_VIEN (teacher)
 * Teachers only see data from classes they supervise
 */
async function buildTeacherScope(resource, userId) {
  // Get all classes where teacher is homeroom teacher (chu_nhiem)
  const classes = await prisma.lop.findMany({
    where: { chu_nhiem: userId },
    select: { id: true }
  });
  
  const classIds = classes.map(c => c.id);
  
  if (classIds.length === 0) {
    // Teacher has no classes -> see nothing
    return { id: { equals: 'NEVER_MATCH' } };
  }
  
  // Apply scope based on resource type
  switch (resource) {
    case 'activities':
      // Teachers see activities created by students in their homeroom classes
      // Get all student user IDs in teacher's classes
      const students = await prisma.sinhVien.findMany({
        where: { lop_id: { in: classIds } },
        select: { nguoi_dung_id: true }
      });
      const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);
      
      if (studentUserIds.length === 0) {
        return { id: { equals: 'NEVER_MATCH' } };
      }
      
      // Filter by creator (activities created by students in teacher's classes)
      return { nguoi_tao_id: { in: studentUserIds } };
    
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
 */
async function buildStudentScope(resource, userId) {
  // Get student info to find their class
  const student = await prisma.sinhVien.findUnique({
    where: { nguoi_dung_id: userId },
    select: { lop_id: true, id: true }
  });
  
  if (!student || !student.lop_id) {
    // Student has no class -> see nothing
    return { id: -1 };
  }
  
  const { lop_id, id: studentId } = student;
  
  // Apply scope based on resource type
  switch (resource) {
    case 'activities':
      // Students see activities from their class
      return { lop_id };
    
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
 */
async function buildOwnershipScope(resource, user) {
  const { role, sub: userId } = user;
  const normalizedRole = normalizeRole(role);
  
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
 */
async function canAccessItem(resource, itemId, user) {
  const { role, sub: userId } = user;
  const normalizedRole = normalizeRole(role);
  
  // Admin can access everything
  if (normalizedRole === 'ADMIN') {
    return true;
  }
  
  try {
    const scope = await buildScope(resource, user);
    
    switch (resource) {
      case 'activities':
        const activity = await prisma.hoatDong.findFirst({
          where: { id: parseInt(itemId), ...scope },
          select: { id: true, nguoi_tao_id: true }
        });
        
        if (!activity) return false;
        
        // Creator or elevated role can access
        return activity.nguoi_tao_id === userId || ['GIANG_VIEN'].includes(normalizedRole);
      
      case 'registrations':
        const registration = await prisma.dangKy.findFirst({
          where: { id: parseInt(itemId), ...scope },
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
    logError('[Scope] Error checking item access', error, { resource, itemId, userId });
    return false;
  }
}

module.exports = {
  buildScope,
  buildOwnershipScope,
  canAccessItem
};
