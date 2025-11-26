/**
 * Activities Repository
 * DATA LAYER - Pure data access, Prisma queries only
 * No business logic
 * Implements IActivityRepository interface
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');
const IActivityRepository = require('../../business/interfaces/IActivityRepository');

class ActivitiesRepository extends IActivityRepository {
  constructor() {
    super();
    this.prisma = prisma;
  }
  /**
   * Find many activities with filters and pagination
   * @param {Object} where - Prisma where clause
   * @param {Object} options - { page, limit, sort, order, include }
   * @returns {Promise<Object>} { items, total, page, limit, totalPages }
   */
  async findMany(where = {}, options = {}) {
    const {
      page = 1,
      limit, // No default - undefined means fetch all
      sort = 'ngay_cap_nhat',
      order = 'desc',
      include = this.getDefaultInclude()
    } = options;
    
    // Handle limit: undefined/null/'all' = no limit (fetch all)
    let effectiveLimit;
    if (limit === undefined || limit === null || limit === 'all') {
      effectiveLimit = undefined;
    } else {
      const parsed = parseInt(limit);
      effectiveLimit = isNaN(parsed) ? undefined : parsed;
    }
    
    const effectivePage = effectiveLimit === undefined ? 1 : parseInt(page);
    const skip = effectiveLimit ? (effectivePage - 1) * effectiveLimit : undefined;
    const take = effectiveLimit;
    
    const orderBy = sort ? { [sort]: order === 'asc' ? 'asc' : 'desc' } : {};
    
    const [items, total] = await Promise.all([
      this.prisma.hoatDong.findMany({
        where,
        skip: take ? skip : undefined,
        take,
        include,
        orderBy
      }),
      this.prisma.hoatDong.count({ where })
    ]);
    
    return {
      items,
      total,
      page: effectivePage,
      limit: effectiveLimit || total,
      totalPages: effectiveLimit ? Math.ceil(total / effectiveLimit) : 1
    };
  }
  
  /**
   * Find activity by ID
   * @param {string} id - Activity ID
   * @param {Object} where - Additional where clause
   * @param {Object} include - Include relations
   * @returns {Promise<Object|null>}
   */
  async findById(id, where = {}, include = null) {
    if (!id) return null;
    return this.prisma.hoatDong.findFirst({
      where: { id: String(id), ...where },
      include: include || this.getDefaultInclude()
    });
  }
  
  /**
   * Find activity by ID with full details (registrations)
   * @param {string} id - Activity ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithDetails(id) {
    if (!id) return null;
    return this.prisma.hoatDong.findUnique({
      where: { id: String(id) },
      include: {
        loai_hd: {
          select: {
            id: true,
            ten_loai_hd: true,
            diem_mac_dinh: true,
            diem_toi_da: true,
            mau_sac: true
          }
        },
        nguoi_tao: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        },
        dang_ky_hd: {
          include: {
            sinh_vien: {
              include: {
                nguoi_dung: {
                  select: { ho_ten: true, email: true }
                }
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Create new activity
   * @param {Object} data - Activity data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return this.prisma.hoatDong.create({
      data: {
        ...data,
        hinh_anh: data.hinh_anh || [],
        tep_dinh_kem: data.tep_dinh_kem || []
      },
      include: this.getDefaultInclude()
    });
  }
  
  /**
   * Update activity
   * @param {string} id - Activity ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    return this.prisma.hoatDong.update({
      where: { id: String(id) },
      data,
      include: this.getDefaultInclude()
    });
  }
  
  /**
   * Delete activity
   * @param {string} id - Activity ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return this.prisma.hoatDong.delete({
      where: { id: String(id) }
    });
  }
  
  /**
   * Check if activity exists
   * @param {string} id - Activity ID
   * @param {Object} where - Additional where clause
   * @returns {Promise<boolean>}
   */
  async exists(id, where = {}) {
    if (!id) return false;
    const count = await this.prisma.hoatDong.count({
      where: { id: String(id), ...where }
    });
    return count > 0;
  }
  
  /**
   * Count activities
   * @param {Object} where - Where clause
   * @returns {Promise<number>}
   */
  async count(where = {}) {
    return this.prisma.hoatDong.count({ where });
  }
  
  /**
   * Get registration statistics for activity
   * @param {string} id - Activity ID
   * @returns {Promise<Object>}
   */
  async getRegistrationStats(id) {
    if (!id) return { total: 0, cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 };
    
    const stats = await this.prisma.dangKyHoatDong.groupBy({
      by: ['trang_thai_dk'],
      where: { hd_id: String(id) },
      _count: true
    });
    
    const result = {
      total: 0,
      cho_duyet: 0,
      da_duyet: 0,
      tu_choi: 0,
      da_tham_gia: 0
    };
    
    stats.forEach(stat => {
      const status = stat.trang_thai_dk || 'cho_duyet';
      result[status] = stat._count;
      result.total += stat._count;
    });
    
    return result;
  }
  
  /**
   * Get user's registration for activity
   * @param {string} activityId - Activity ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async findUserRegistration(activityId, userId) {
    return this.prisma.dangKyHoatDong.findFirst({
      where: {
        hd_id: String(activityId),
        sv_id: String(userId)
      }
    });
  }

  /**
   * Get student info by user ID
   * @param {string} userId - User ID (nguoi_dung_id)
   * @returns {Promise<Object|null>}
   */
  async findStudentByUserId(userId) {
    return this.prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true, lop_id: true }
    });
  }

  /**
   * Get registrations for activities by student ID
   * @param {string} studentId - Student ID
   * @param {string[]} activityIds - Activity IDs
   * @returns {Promise<Object[]>}
   */
  async findRegistrationsByStudent(studentId, activityIds) {
    return this.prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
        hd_id: { in: activityIds }
      },
      select: {
        hd_id: true,
        trang_thai_dk: true,
        ngay_dang_ky: true
      }
    });
  }

  /**
   * Get all students in a class
   * @param {string} classId - Class ID (lop_id)
   * @returns {Promise<Object[]>}
   */
  async findStudentsByClass(classId) {
    return this.prisma.sinhVien.findMany({
      where: { lop_id: classId },
      select: { nguoi_dung_id: true }
    });
  }

  /**
   * Get class info with homeroom teacher
   * @param {string} classId - Class ID
   * @returns {Promise<Object|null>}
   */
  async findClassById(classId) {
    return this.prisma.lop.findUnique({
      where: { id: classId },
      select: { chu_nhiem: true, ten_lop: true }
    });
  }

  /**
   * Count registrations by activity and class
   * @param {string[]} activityIds - Activity IDs
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Map of activityId -> count
   */
  async countRegistrationsByClass(activityIds, classId) {
    const grouped = await this.prisma.dangKyHoatDong.groupBy({
      by: ['hd_id'],
      where: {
        hd_id: { in: activityIds },
        sinh_vien: { lop_id: classId },
        trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
      },
      _count: { _all: true }
    }).catch(async () => {
      // Fallback for older Prisma versions
      const rows = await this.prisma.dangKyHoatDong.findMany({
        where: {
          hd_id: { in: activityIds },
          sinh_vien: { lop_id: classId },
          trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
        },
        select: { hd_id: true }
      });
      return rows.reduce((acc, r) => {
        acc[r.hd_id] = (acc[r.hd_id] || 0) + 1;
        return acc;
      }, {});
    });

    if (Array.isArray(grouped)) {
      return Object.fromEntries(grouped.map(g => [g.hd_id, g._count?._all || 0]));
    }
    return grouped || {};
  }
  
  /**
   * Default include for activity queries
   * @returns {Object}
   */
  getDefaultInclude() {
    return {
      loai_hd: {
        select: {
          id: true,
          ten_loai_hd: true,
          diem_mac_dinh: true,
          diem_toi_da: true,
          mau_sac: true
        }
      },
      nguoi_tao: {
        select: {
          id: true,
          ho_ten: true,
          email: true,
          sinh_vien: {
            select: {
              mssv: true,
              lop: {
                select: {
                  ten_lop: true
                }
              }
            }
          }
        }
      },
      dang_ky_hd: {
        select: {
          id: true,
          trang_thai_dk: true
        }
      }
    };
  }
}

module.exports = new ActivitiesRepository();

