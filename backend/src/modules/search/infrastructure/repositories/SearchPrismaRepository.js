const { prisma } = require('../../../../infrastructure/prisma/client');
const ISearchRepository = require('../../domain/interfaces/ISearchRepository');

/**
 * SearchPrismaRepository
 * Prisma implementation of ISearchRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class SearchPrismaRepository extends ISearchRepository {
  async searchActivities(filters, options = {}) {
    const { take = 5, orderBy = { ngay_tao: 'desc' } } = options;
    
    return await prisma.hoatDong.findMany({
      where: filters,
      select: {
        id: true,
        ten_hd: true,
        mo_ta: true,
        dia_diem: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        trang_thai: true,
        nguoi_tao: {
          select: {
            ho_ten: true,
            vai_tro: { select: { ten_vt: true } }
          }
        }
      },
      take,
      orderBy
    });
  }

  async searchStudents(filters, options = {}) {
    const { take = 5 } = options;
    
    return await prisma.sinhVien.findMany({
      where: filters,
      select: {
        nguoi_dung_id: true,
        mssv: true,
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
            anh_dai_dien: true
          }
        },
        lop: {
          select: {
            ten_lop: true
          }
        }
      },
      take
    });
  }

  async searchClasses(filters, options = {}) {
    const { take = 5 } = options;
    
    return await prisma.lop.findMany({
      where: filters,
      select: {
        id: true,
        ten_lop: true,
        chu_nhiem_rel: { select: { ho_ten: true } },
        _count: { select: { sinh_viens: true } }
      },
      take
    });
  }

  async searchTeachers(filters, options = {}) {
    const { take = 5 } = options;
    
    return await prisma.nguoiDung.findMany({
      where: filters,
      select: {
        id: true,
        ho_ten: true,
        email: true,
        anh_dai_dien: true,
        vai_tro: { select: { ten_vt: true } }
      },
      take
    });
  }

  async getStudentByUserId(userId) {
    return await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true, lop_id: true }
    });
  }

  async getClassCreators(classId) {
    return await prisma.sinhVien.findMany({
      where: { lop_id: classId },
      select: { nguoi_dung_id: true }
    });
  }

  async getClassHomeroom(classId) {
    return await prisma.lop.findUnique({
      where: { id: classId },
      select: { chu_nhiem: true }
    });
  }

  async getTeacherClasses(teacherId) {
    return await prisma.lop.findMany({
      where: { chu_nhiem: teacherId },
      select: { id: true }
    });
  }
}

module.exports = SearchPrismaRepository;

