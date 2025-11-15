/**
 * Semester Repository
 * Domain-specific repository for Semester (HocKy) entity
 */

const BaseRepository = require('./BaseRepository');
const { prisma } = require('../prisma/client');
const { logInfo } = require('../../core/logger');

class SemesterRepository extends BaseRepository {
  constructor() {
    super(prisma.hocKy);
    this.modelName = 'Semester';
  }

  /**
   * Find active semester
   * @returns {Promise<Object|null>}
   */
  async findActive() {
    return this.model.findFirst({
      where: {
        trang_thai: 'ACTIVE',
      },
      orderBy: {
        ngay_bat_dau: 'desc',
      },
    });
  }

  /**
   * Find semester by name
   * @param {string} name
   * @returns {Promise<Object|null>}
   */
  async findByName(name) {
    return this.model.findUnique({
      where: { ten_hoc_ky: name },
    });
  }

  /**
   * Find semesters by status
   * @param {string} status - ACTIVE, LOCKED, ARCHIVED
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByStatus(status, options = {}) {
    return this.findMany(
      {
        trang_thai: status,
      },
      {
        ...options,
        sort: options.sort || 'ngay_bat_dau',
        order: options.order || 'desc',
      }
    );
  }

  /**
   * Find semesters by academic year
   * @param {string} academicYear - e.g., "2023-2024"
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByAcademicYear(academicYear, options = {}) {
    return this.findMany(
      {
        nam_hoc: academicYear,
      },
      {
        ...options,
        sort: options.sort || 'ngay_bat_dau',
        order: options.order || 'desc',
      }
    );
  }

  /**
   * Find current semesters (within date range)
   * @param {Date} currentDate
   * @returns {Promise<Array<Object>>}
   */
  async findCurrent(currentDate = new Date()) {
    return this.model.findMany({
      where: {
        ngay_bat_dau: { lte: currentDate },
        ngay_ket_thuc: { gte: currentDate },
      },
      orderBy: {
        ngay_bat_dau: 'desc',
      },
    });
  }

  /**
   * Check if semester name exists
   * @param {string} name
   * @param {number} excludeId
   * @returns {Promise<boolean>}
   */
  async nameExists(name, excludeId = null) {
    const where = { ten_hoc_ky: name };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }

  /**
   * Activate semester (and deactivate others)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async activate(id) {
    logInfo(`Activating semester ${id}`);
    
    // Use transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // Deactivate all other semesters
      await tx.hocKy.updateMany({
        where: {
          trang_thai: 'ACTIVE',
          id: { not: id },
        },
        data: {
          trang_thai: 'LOCKED',
        },
      });

      // Activate the target semester
      return tx.hocKy.update({
        where: { id },
        data: {
          trang_thai: 'ACTIVE',
        },
      });
    });
  }

  /**
   * Lock semester
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async lock(id) {
    logInfo(`Locking semester ${id}`);
    return this.update(id, {
      trang_thai: 'LOCKED',
    });
  }

  /**
   * Archive semester
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async archive(id) {
    logInfo(`Archiving semester ${id}`);
    return this.update(id, {
      trang_thai: 'ARCHIVED',
    });
  }

  /**
   * Get semester statistics
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getStatistics(id) {
    const semester = await this.findById(id);
    if (!semester) return null;

    // Count activities in this semester
    const activitiesCount = await prisma.hoatDong.count({
      where: { hoc_ky_id: id },
    });

    const approvedActivitiesCount = await prisma.hoatDong.count({
      where: {
        hoc_ky_id: id,
        trang_thai: 'APPROVED',
      },
    });

    // Count registrations
    const registrationsCount = await prisma.dangKy.count({
      where: {
        hoat_dong: {
          hoc_ky_id: id,
        },
      },
    });

    return {
      semester,
      activities: {
        total: activitiesCount,
        approved: approvedActivitiesCount,
      },
      registrations: registrationsCount,
    };
  }

  /**
   * Get all academic years (distinct)
   * @returns {Promise<Array<string>>}
   */
  async getAllAcademicYears() {
    const result = await this.model.findMany({
      where: {
        nam_hoc: { not: null },
      },
      select: {
        nam_hoc: true,
      },
      distinct: ['nam_hoc'],
      orderBy: {
        nam_hoc: 'desc',
      },
    });
    return result.map((r) => r.nam_hoc).filter(Boolean);
  }

  /**
   * Find upcoming semesters
   * @param {Date} fromDate
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findUpcoming(fromDate = new Date(), options = {}) {
    return this.findMany(
      {
        ngay_bat_dau: { gte: fromDate },
      },
      {
        ...options,
        sort: options.sort || 'ngay_bat_dau',
        order: options.order || 'asc',
      }
    );
  }

  /**
   * Find past semesters
   * @param {Date} toDate
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findPast(toDate = new Date(), options = {}) {
    return this.findMany(
      {
        ngay_ket_thuc: { lt: toDate },
      },
      {
        ...options,
        sort: options.sort || 'ngay_ket_thuc',
        order: options.order || 'desc',
      }
    );
  }
}

module.exports = new SemesterRepository();




