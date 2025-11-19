const IClassRepository = require('../../domain/interfaces/IClassRepository');
const classesRepo = require('../../classes.repo');

/**
 * ClassPrismaRepository
 * Prisma implementation of IClassRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class ClassPrismaRepository extends IClassRepository {
  async findMany({ where, skip, limit, orderBy }) {
    return classesRepo.findMany({ where, skip, limit, orderBy });
  }

  async findById(id, include) {
    return classesRepo.findById(id, include);
  }

  async findByName(name) {
    return classesRepo.findByName(name);
  }

  async create(data) {
    return classesRepo.create(data);
  }

  async update(id, data) {
    return classesRepo.update(id, data);
  }

  async delete(id) {
    return classesRepo.delete(id);
  }

  async exists(id) {
    return classesRepo.exists(id);
  }

  async findByFaculty(faculty) {
    return classesRepo.findByFaculty(faculty);
  }

  async assignTeacher(classId, teacherId) {
    return classesRepo.assignTeacher(classId, teacherId);
  }

  async removeTeacher(classId, teacherId) {
    return classesRepo.removeTeacher(classId, teacherId);
  }

  async getStats(classId) {
    return classesRepo.getStats(classId);
  }

  async getStudents(classId) {
    // Implementation depends on actual schema
    const { prisma } = require('../../../../infrastructure/prisma/client');
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
  }

  async getActivities(classId) {
    // Implementation depends on actual schema
    const { prisma } = require('../../../../infrastructure/prisma/client');
    const activities = await prisma.hoatDong.findMany({
      where: { lop_id: classId },
      include: {
        loai_hoat_dong: true
      },
      orderBy: { ngay_bd: 'desc' }
    });
    return activities;
  }
}

module.exports = ClassPrismaRepository;

