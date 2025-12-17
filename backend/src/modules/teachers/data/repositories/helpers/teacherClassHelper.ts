/**
 * Teacher Class Helper
 * Shared helper functions for teacher class operations
 */

import { prisma } from '../../../../../data/infrastructure/prisma/client';

export interface TeacherClassInfo {
  id: string;
  ten_lop: string;
}

/**
 * Get classes where teacher is homeroom (chu_nhiem)
 * @param teacherId - Teacher's user ID
 * @returns Array of classes with id and ten_lop
 */
export async function findTeacherClassesRaw(teacherId: string): Promise<TeacherClassInfo[]> {
  return prisma.lop.findMany({
    where: { chu_nhiem: teacherId },
    select: { id: true, ten_lop: true }
  });
}

export default {
  findTeacherClassesRaw
};
