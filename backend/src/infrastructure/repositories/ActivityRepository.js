/**
 * Activity Repository
 * Domain-specific repository for Activity (HoatDong) entity
 */

const BaseRepository = require('./BaseRepository');
const { prisma } = require('../prisma/client');
const { logInfo } = require('../../core/logger');

class ActivityRepository extends BaseRepository {
  constructor() {
    super(prisma.hoatDong);
    this.modelName = 'Activity';
  }

  /**
   * Default include for activity queries
   * @returns {Object}
   */
  getDefaultInclude() {
    return {
      nguoi_tao: {
        select: {
          id: true,
          mssv: true,
          ten_day_du: true,
          email: true,
        },
      },
      nguoi_duyet: {
        select: {
          id: true,
          mssv: true,
          ten_day_du: true,
        },
      },
      hoc_ky: {
        select: {
          id: true,
          ten_hoc_ky: true,
          trang_thai: true,
        },
      },
      loai_hoat_dong: {
        select: {
          id: true,
          ten_loai: true,
          diem_toi_da: true,
        },
      },
      _count: {
        select: {
          dang_ky: true,
        },
      },
    };
  }

  /**
   * Find activities by creator
   * @param {number} creatorId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByCreator(creatorId, options = {}) {
    return this.findMany(
      {
        nguoi_tao_id: creatorId,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Find activities by status
   * @param {string} status - PENDING, APPROVED, REJECTED
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
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Find activities by semester
   * @param {number} semesterId
   * @param {Object} additionalWhere
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findBySemester(semesterId, additionalWhere = {}, options = {}) {
    return this.findMany(
      {
        hoc_ky_id: semesterId,
        ...additionalWhere,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
        sort: options.sort || 'ngay_cap_nhat',
        order: options.order || 'desc',
      }
    );
  }

  /**
   * Find activities by type
   * @param {number} typeId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByType(typeId, options = {}) {
    return this.findMany(
      {
        loai_hoat_dong_id: typeId,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Find approved activities
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findApproved(options = {}) {
    return this.findByStatus('APPROVED', options);
  }

  /**
   * Find pending activities (for approval)
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findPending(options = {}) {
    return this.findByStatus('PENDING', options);
  }

  /**
   * Find upcoming activities (future events)
   * @param {Date} fromDate
   * @param {Object} additionalWhere
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findUpcoming(fromDate = new Date(), additionalWhere = {}, options = {}) {
    return this.findMany(
      {
        ngay_bat_dau: {
          gte: fromDate,
        },
        trang_thai: 'APPROVED',
        ...additionalWhere,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
        sort: options.sort || 'ngay_bat_dau',
        order: options.order || 'asc',
      }
    );
  }

  /**
   * Count activities by status
   * @param {string} status
   * @param {Object} additionalWhere
   * @returns {Promise<number>}
   */
  async countByStatus(status, additionalWhere = {}) {
    return this.count({
      trang_thai: status,
      ...additionalWhere,
    });
  }

  /**
   * Approve activity
   * @param {number} id
   * @param {number} approvedById
   * @returns {Promise<Object>}
   */
  async approve(id, approvedById) {
    logInfo(`Approving activity ${id} by user ${approvedById}`);
    return this.update(id, {
      trang_thai: 'APPROVED',
      nguoi_duyet_id: approvedById,
      ngay_duyet: new Date(),
    });
  }

  /**
   * Reject activity
   * @param {number} id
   * @param {number} rejectedById
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  async reject(id, rejectedById, reason = null) {
    logInfo(`Rejecting activity ${id} by user ${rejectedById}`, { reason });
    return this.update(id, {
      trang_thai: 'REJECTED',
      nguoi_duyet_id: rejectedById,
      ngay_duyet: new Date(),
      ly_do_tu_choi: reason,
    });
  }

  /**
   * Search activities by keyword
   * @param {string} keyword
   * @param {Object} additionalWhere
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async search(keyword, additionalWhere = {}, options = {}) {
    return this.findMany(
      {
        OR: [
          { ten_hoat_dong: { contains: keyword, mode: 'insensitive' } },
          { mo_ta: { contains: keyword, mode: 'insensitive' } },
          { dia_diem: { contains: keyword, mode: 'insensitive' } },
        ],
        ...additionalWhere,
      },
      {
        ...options,
        include: options.include || this.getDefaultInclude(),
      }
    );
  }

  /**
   * Get activities with registration count
   * @param {Object} where
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findWithRegistrationCount(where = {}, options = {}) {
    const result = await this.findMany(where, {
      ...options,
      include: {
        ...this.getDefaultInclude(),
        dang_ky: {
          select: {
            id: true,
            trang_thai: true,
          },
        },
      },
    });

    // Add computed registration stats
    result.items = result.items.map((activity) => ({
      ...activity,
      stats: {
        total: activity.dang_ky?.length || 0,
        approved: activity.dang_ky?.filter((r) => r.trang_thai === 'APPROVED').length || 0,
        pending: activity.dang_ky?.filter((r) => r.trang_thai === 'PENDING').length || 0,
      },
    }));

    return result;
  }
}

module.exports = new ActivityRepository();




