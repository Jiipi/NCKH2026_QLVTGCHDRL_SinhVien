/**
 * Activities Repository
 * DATA LAYER - Pure data access, Prisma queries only
 * No business logic
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

class ActivitiesRepository {
  /**
   * Find many activities with filters and pagination
   * @param {Object} where - Prisma where clause
   * @param {Object} options - { page, limit, sort, order, include }
   * @returns {Promise<Object>} { items, total, page, limit, totalPages }
   */
  async findMany(where = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'ngay_cap_nhat',
      order = 'desc',
      include = this.getDefaultInclude()
    } = options;
    
    const effectiveLimit = limit === 'all' || limit === undefined ? undefined : parseInt(limit);
    const effectivePage = effectiveLimit === undefined ? 1 : parseInt(page);
    const skip = effectiveLimit ? (effectivePage - 1) * effectiveLimit : undefined;
    const take = effectiveLimit;
    
    const orderBy = sort ? { [sort]: order === 'asc' ? 'asc' : 'desc' } : {};
    
    const [items, total] = await Promise.all([
      prisma.hoatDong.findMany({
        where,
        skip: take ? skip : undefined,
        take,
        include,
        orderBy
      }),
      prisma.hoatDong.count({ where })
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
    return prisma.hoatDong.findFirst({
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
    return prisma.hoatDong.findUnique({
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
    return prisma.hoatDong.create({
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
    return prisma.hoatDong.update({
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
    return prisma.hoatDong.delete({
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
    const count = await prisma.hoatDong.count({
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
    return prisma.hoatDong.count({ where });
  }
  
  /**
   * Get registration statistics for activity
   * @param {string} id - Activity ID
   * @returns {Promise<Object>}
   */
  async getRegistrationStats(id) {
    if (!id) return { total: 0, cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 };
    
    const stats = await prisma.dangKyHoatDong.groupBy({
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
    return prisma.dangKyHoatDong.findFirst({
      where: {
        hd_id: String(activityId),
        sv_id: String(userId)
      }
    });
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

