/**
 * Class Repository
 * Domain-specific repository for Class (Lop) entity
 */

const BaseRepository = require('./BaseRepository');
const { prisma } = require('../prisma/client');
const { logInfo } = require('../../core/logger');

class ClassRepository extends BaseRepository {
  constructor() {
    super(prisma.lop);
    this.modelName = 'Class';
  }

  /**
   * Default include for class queries
   * @returns {Object}
   */
  getDefaultInclude() {
    return {
      giao_vien_chu_nhiem: {
        select: {
          id: true,
          mssv: true,
          ten_day_du: true,
          email: true,
        },
      },
      _count: {
        select: {
          sinh_vien: true,
        },
      },
    };
  }

  /**
   * Find class by name
   * @param {string} className
   * @returns {Promise<Object|null>}
   */
  async findByName(className) {
    return this.model.findUnique({
      where: { ten_lop: className },
      include: this.getDefaultInclude(),
    });
  }

  /**
   * Find classes by faculty
   * @param {string} faculty
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByFaculty(faculty, options = {}) {
    return this.findMany(
      {
        khoa: faculty,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Find classes by major
   * @param {string} major
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByMajor(major, options = {}) {
    return this.findMany(
      {
        nganh: major,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Find classes by homeroom teacher
   * @param {number} teacherId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByTeacher(teacherId, options = {}) {
    return this.findMany(
      {
        giao_vien_chu_nhiem_id: teacherId,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Find class with students
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findWithStudents(id) {
    return this.findById(id, {
      giao_vien_chu_nhiem: {
        select: {
          id: true,
          mssv: true,
          ten_day_du: true,
          email: true,
        },
      },
      sinh_vien: {
        select: {
          id: true,
          mssv: true,
          ten_day_du: true,
          email: true,
          so_dien_thoai: true,
        },
        where: {
          is_active: true,
        },
        orderBy: {
          mssv: 'asc',
        },
      },
      _count: {
        select: {
          sinh_vien: true,
        },
      },
    });
  }

  /**
   * Get class statistics
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getStatistics(id) {
    const classData = await this.model.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sinh_vien: true,
          },
        },
      },
    });

    if (!classData) return null;

    // Get active students count
    const activeStudents = await prisma.nguoiDung.count({
      where: {
        lop_id: id,
        is_active: true,
      },
    });

    // Get activities created by class members
    const studentIds = await prisma.nguoiDung.findMany({
      where: { lop_id: id },
      select: { id: true },
    });

    const activitiesCount = await prisma.hoatDong.count({
      where: {
        nguoi_tao_id: { in: studentIds.map((s) => s.id) },
      },
    });

    return {
      classInfo: classData,
      totalStudents: classData._count.sinh_vien,
      activeStudents,
      activitiesCreated: activitiesCount,
    };
  }

  /**
   * Check if class name exists
   * @param {string} className
   * @param {number} excludeId - Exclude this ID (for update)
   * @returns {Promise<boolean>}
   */
  async nameExists(className, excludeId = null) {
    const where = { ten_lop: className };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }

  /**
   * Assign homeroom teacher
   * @param {number} classId
   * @param {number} teacherId
   * @returns {Promise<Object>}
   */
  async assignTeacher(classId, teacherId) {
    logInfo(`Assigning teacher ${teacherId} to class ${classId}`);
    return this.update(classId, {
      giao_vien_chu_nhiem_id: teacherId,
    });
  }

  /**
   * Remove homeroom teacher
   * @param {number} classId
   * @returns {Promise<Object>}
   */
  async removeTeacher(classId) {
    logInfo(`Removing teacher from class ${classId}`);
    return this.update(classId, {
      giao_vien_chu_nhiem_id: null,
    });
  }

  /**
   * Search classes by keyword
   * @param {string} keyword
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async search(keyword, options = {}) {
    return this.findMany(
      {
        OR: [
          { ten_lop: { contains: keyword, mode: 'insensitive' } },
          { khoa: { contains: keyword, mode: 'insensitive' } },
          { nganh: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Get all faculties (distinct)
   * @returns {Promise<Array<string>>}
   */
  async getAllFaculties() {
    const result = await this.model.findMany({
      where: {
        khoa: { not: null },
      },
      select: {
        khoa: true,
      },
      distinct: ['khoa'],
      orderBy: {
        khoa: 'asc',
      },
    });
    return result.map((r) => r.khoa).filter(Boolean);
  }

  /**
   * Get all majors (distinct)
   * @returns {Promise<Array<string>>}
   */
  async getAllMajors() {
    const result = await this.model.findMany({
      where: {
        nganh: { not: null },
      },
      select: {
        nganh: true,
      },
      distinct: ['nganh'],
      orderBy: {
        nganh: 'asc',
      },
    });
    return result.map((r) => r.nganh).filter(Boolean);
  }
}

module.exports = new ClassRepository();




