const { prisma } = require('../../infrastructure/prisma/client');

/**
 * Activity Types Repository
 * Data access layer for activity type management
 */
class ActivityTypesRepository {
  /**
   * Find all activity types with pagination and search
   * @param {Object} options - Query options
   * @param {number} options.skip - Number of records to skip
   * @param {number} options.take - Number of records to take
   * @param {string} [options.search] - Search term for name/description
   * @returns {Promise<Array>} Array of activity types
   */
  async findAll({ skip, take, search }) {
    const where = search
      ? {
          OR: [
            { ten_loai_hd: { contains: search, mode: 'insensitive' } },
            { mo_ta: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return prisma.loaiHoatDong.findMany({
      skip,
      take,
      where,
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Count total activity types matching search criteria
   * @param {string} [search] - Search term for name/description
   * @returns {Promise<number>} Total count
   */
  async count(search) {
    const where = search
      ? {
          OR: [
            { ten_loai_hd: { contains: search, mode: 'insensitive' } },
            { mo_ta: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return prisma.loaiHoatDong.count({ where });
  }

  /**
   * Find activity type by ID
   * @param {string} id - Activity type ID (UUID)
   * @returns {Promise<Object|null>} Activity type or null
   */
  async findById(id) {
    return prisma.loaiHoatDong.findUnique({
      where: { id: String(id) },
    });
  }

  /**
   * Find activity type by name
   * @param {string} name - Activity type name
   * @returns {Promise<Object|null>} Activity type or null
   */
  async findByName(name) {
    return prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: name },
    });
  }

  /**
   * Create new activity type
   * @param {Object} data - Activity type data
   * @param {string} data.ten_loai_hd - Activity type name (required)
   * @param {string} [data.mo_ta] - Description
   * @param {number} [data.diem_mac_dinh] - Default points (default: 0)
   * @param {number} [data.diem_toi_da] - Maximum points (default: 10)
   * @param {string} [data.mau_sac] - Color code
   * @returns {Promise<Object>} Created activity type
   */
  async create(data) {
    return prisma.loaiHoatDong.create({
      data: {
        ten_loai_hd: data.ten_loai_hd,
        mo_ta: data.mo_ta || null,
        diem_mac_dinh: data.diem_mac_dinh ?? 0,
        diem_toi_da: data.diem_toi_da ?? 10,
        mau_sac: data.mau_sac || null,
      },
    });
  }

  /**
   * Update existing activity type
   * @param {string} id - Activity type ID (UUID)
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated activity type
   */
  async update(id, data) {
    const updateData = {};

    if (data.ten_loai_hd !== undefined) updateData.ten_loai_hd = data.ten_loai_hd;
    if (data.mo_ta !== undefined) updateData.mo_ta = data.mo_ta;
    if (data.diem_mac_dinh !== undefined) updateData.diem_mac_dinh = Number(data.diem_mac_dinh);
    if (data.diem_toi_da !== undefined) updateData.diem_toi_da = Number(data.diem_toi_da);
    if (data.mau_sac !== undefined) updateData.mau_sac = data.mau_sac;
    if (data.hinh_anh !== undefined) updateData.hinh_anh = data.hinh_anh;

    return prisma.loaiHoatDong.update({
      where: { id: String(id) },
      data: updateData,
    });
  }

  /**
   * Delete activity type by ID
   * @param {string} id - Activity type ID (UUID)
   * @returns {Promise<Object>} Deleted activity type
   */
  async delete(id) {
    return prisma.loaiHoatDong.delete({
      where: { id: String(id) },
    });
  }
}

module.exports = new ActivityTypesRepository();





