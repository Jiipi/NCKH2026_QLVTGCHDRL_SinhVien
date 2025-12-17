/**
 * Classes Repository - Pure Data Access Layer
 */

import type { Lop, HoatDong } from '@prisma/client';
import type { FindManyOptions, FindManyResult, ClassIncludeOptions, ClassStats, StudentWithUser } from '../../business/interfaces/IClassRepository';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require('../../../../data/infrastructure/prisma/client');

/**
 * Class item with student count
 */
interface ClassItem extends Lop {
  _count?: {
    sinh_viens?: number;
    students?: number;
    activities?: number;
    teachers?: number;
  };
  total_sinh_vien?: number;
}

/**
 * Where clause with search
 */
interface WhereClause {
  search?: string;
  OR?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

const classesRepository = {
  /**
   * Lấy danh sách classes
   */
  async findMany({ where = {}, skip = 0, limit = 20, orderBy = { ten_lop: 'asc' } }: FindManyOptions): Promise<FindManyResult<ClassItem>> {
    const { search, ...rest } = where as WhereClause;

    const prismaWhere: WhereClause = { ...rest };
    if (search) {
      prismaWhere.OR = [
        { ten_lop: { contains: search, mode: 'insensitive' } },
        { khoa: { contains: search, mode: 'insensitive' } },
        { nien_khoa: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.lop.findMany({
        where: prismaWhere,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              sinh_viens: true
            }
          }
        }
      }),
      prisma.lop.count({ where: prismaWhere })
    ]);

    return {
      items: items.map((item: ClassItem) => ({
        ...item,
        total_sinh_vien: item._count?.sinh_viens ?? 0
      })),
      total
    };
  },

  /**
   * Lấy class theo ID
   */
  async findById(id: string | number, include: ClassIncludeOptions = {}): Promise<Lop | null> {
    return prisma.class.findUnique({
      where: { id: parseInt(String(id)) },
      include: {
        students: include.students ? {
          select: {
            id: true,
            mssv: true,
            fullName: true,
            email: true
          }
        } : false,
        teachers: include.teachers ? {
          select: {
            id: true,
            mssv: true,
            fullName: true,
            email: true
          }
        } : false,
        _count: {
          select: {
            students: true,
            activities: true
          }
        },
        ...include
      }
    });
  },

  /**
   * Lấy class theo name
   */
  async findByName(name: string): Promise<Lop | null> {
    return prisma.class.findUnique({
      where: { name },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
  },

  /**
   * Tạo class mới
   */
  async create(data: Partial<Lop> & { name?: string; faculty?: string | null; major?: string | null; academicYear?: string | null; semester?: string | null }): Promise<Lop> {
    return prisma.class.create({
      data: {
        name: data.name,
        faculty: data.faculty || null,
        major: data.major || null,
        academicYear: data.academicYear || null,
        semester: data.semester || null
      }
    });
  },

  /**
   * Update class
   */
  async update(id: string | number, data: Partial<Lop> & { name?: string; faculty?: string | null; major?: string | null; academicYear?: string | null; semester?: string | null }): Promise<Lop> {
    const updateData: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.faculty !== undefined) updateData.faculty = data.faculty;
    if (data.major !== undefined) updateData.major = data.major;
    if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;
    if (data.semester !== undefined) updateData.semester = data.semester;

    return prisma.class.update({
      where: { id: parseInt(String(id)) },
      data: updateData
    });
  },

  /**
   * Xóa class
   */
  async delete(id: string | number): Promise<Lop> {
    return prisma.class.delete({
      where: { id: parseInt(String(id)) }
    });
  },

  /**
   * Check class exists
   */
  async exists(id: string | number): Promise<boolean> {
    const count = await prisma.class.count({
      where: { id: parseInt(String(id)) }
    });
    return count > 0;
  },

  /**
   * Lấy classes theo faculty
   */
  async findByFaculty(faculty: string): Promise<Lop[]> {
    return prisma.class.findMany({
      where: { faculty },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
  },

  /**
   * Assign teacher to class
   */
  async assignTeacher(classId: string | number, teacherId: string | number): Promise<Lop> {
    return prisma.class.update({
      where: { id: parseInt(String(classId)) },
      data: {
        teachers: {
          connect: { id: parseInt(String(teacherId)) }
        }
      }
    });
  },

  /**
   * Remove teacher from class
   */
  async removeTeacher(classId: string | number, teacherId: string | number): Promise<Lop> {
    return prisma.class.update({
      where: { id: parseInt(String(classId)) },
      data: {
        teachers: {
          disconnect: { id: parseInt(String(teacherId)) }
        }
      }
    });
  },

  /**
   * Get class stats
   */
  async getStats(classId: string | number): Promise<ClassStats | null> {
    const classData = await prisma.class.findUnique({
      where: { id: parseInt(String(classId)) },
      include: {
        _count: {
          select: {
            students: true,
            activities: true,
            teachers: true
          }
        }
      }
    }) as ClassItem | null;

    if (!classData) return null;

    return {
      totalStudents: classData._count?.students ?? 0,
      totalActivities: classData._count?.activities ?? 0,
      totalTeachers: classData._count?.teachers ?? 0
    };
  },

  /**
   * Get students in class
   */
  async getStudents(classId: string | number): Promise<StudentWithUser[]> {
    const classData = await prisma.lop.findUnique({
      where: { id: classId },
      include: {
        sinh_viens: {
          select: {
            id: true,
            mssv: true,
            nguoi_dung: {
              select: {
                id: true,
                ho_ten: true,
                email: true
              }
            }
          }
        }
      }
    });
    return classData?.sinh_viens || [];
  },

  /**
   * Get activities for class
   */
  async getActivities(classId: string | number): Promise<HoatDong[]> {
    const activities = await prisma.hoatDong.findMany({
      where: { lop_id: classId },
      include: {
        loai_hoat_dong: true
      },
      orderBy: { ngay_bd: 'desc' }
    });
    return activities;
  }
};

export default classesRepository;
module.exports = classesRepository;
