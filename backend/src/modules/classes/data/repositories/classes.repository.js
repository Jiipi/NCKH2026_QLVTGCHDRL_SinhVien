/**
 * Classes Repository - Pure Data Access Layer
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

const classesRepository = {
  /**
   * Lấy danh sách classes
   */
  async findMany({ where = {}, skip = 0, limit = 20, orderBy = { ten_lop: 'asc' } }) {
    const { search, ...rest } = where;

    const prismaWhere = { ...rest };
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
      items: items.map(item => ({
        ...item,
        total_sinh_vien: item._count?.sinh_viens ?? 0
      })),
      total
    };
  },

  /**
   * Lấy class theo ID
   */
  async findById(id, include = {}) {
    return prisma.class.findUnique({
      where: { id: parseInt(id) },
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
  async findByName(name) {
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
  async create(data) {
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
  async update(id, data) {
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.faculty !== undefined) updateData.faculty = data.faculty;
    if (data.major !== undefined) updateData.major = data.major;
    if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;
    if (data.semester !== undefined) updateData.semester = data.semester;

    return prisma.class.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  },

  /**
   * Xóa class
   */
  async delete(id) {
    return prisma.class.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Check class exists
   */
  async exists(id) {
    const count = await prisma.class.count({
      where: { id: parseInt(id) }
    });
    return count > 0;
  },

  /**
   * Lấy classes theo faculty
   */
  async findByFaculty(faculty) {
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
  async assignTeacher(classId, teacherId) {
    return prisma.class.update({
      where: { id: parseInt(classId) },
      data: {
        teachers: {
          connect: { id: parseInt(teacherId) }
        }
      }
    });
  },

  /**
   * Remove teacher from class
   */
  async removeTeacher(classId, teacherId) {
    return prisma.class.update({
      where: { id: parseInt(classId) },
      data: {
        teachers: {
          disconnect: { id: parseInt(teacherId) }
        }
      }
    });
  },

  /**
   * Get class stats
   */
  async getStats(classId) {
    const classData = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
      include: {
        _count: {
          select: {
            students: true,
            activities: true,
            teachers: true
          }
        }
      }
    });

    if (!classData) return null;

    return {
      totalStudents: classData._count.students,
      totalActivities: classData._count.activities,
      totalTeachers: classData._count.teachers
    };
  },

  /**
   * Get students in class
   */
  async getStudents(classId) {
    const { prisma } = require('../../../../data/infrastructure/prisma/client');
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
  async getActivities(classId) {
    const { prisma } = require('../../../../data/infrastructure/prisma/client');
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

module.exports = classesRepository;

