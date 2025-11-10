const activityTypesRepo = require('./activity-types.repo');
const { logInfo, logError } = require('../../utils/logger');

/**
 * Activity Types Service
 * Business logic for activity type management
 */
class ActivityTypesService {
  /**
   * Get paginated list of activity types with search
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search term
   * @returns {Promise<Object>} Paginated result with items and metadata
   */
  async getList({ page = 1, limit = 10, search }) {
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [items, total] = await Promise.all([
      activityTypesRepo.findAll({ skip, take, search }),
      activityTypesRepo.count(search),
    ]);

    return {
      items,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Get single activity type by ID
   * @param {number} id - Activity type ID
   * @returns {Promise<Object|null>} Activity type or null if not found
   */
  async getById(id) {
    return activityTypesRepo.findById(id);
  }

  /**
   * Create new activity type
   * @param {Object} data - Activity type data
   * @param {string} data.ten_loai_hd - Activity type name (required)
   * @param {string} [data.mo_ta] - Description
   * @param {number} [data.diem_mac_dinh] - Default points
   * @param {number} [data.diem_toi_da] - Maximum points
   * @param {string} [data.mau_sac] - Color code
   * @param {number} adminId - ID of admin creating the type
   * @returns {Promise<Object>} Created activity type
   * @throws {Error} If name is missing or duplicate exists
   */
  async create(data, adminId) {
    // Validate required field
    if (!data.ten_loai_hd) {
      throw new Error('Tên loại hoạt động không được để trống');
    }

    // Check for duplicate
    const existing = await activityTypesRepo.findByName(data.ten_loai_hd);
    if (existing) {
      throw new Error('Loại hoạt động đã tồn tại');
    }

    // Create activity type
    const activityType = await activityTypesRepo.create(data);

    logInfo(`Admin ${adminId} created activity type: ${data.ten_loai_hd}`);

    return activityType;
  }

  /**
   * Update existing activity type
   * @param {number} id - Activity type ID
   * @param {Object} data - Update data
   * @param {number} adminId - ID of admin updating the type
   * @returns {Promise<Object>} Updated activity type
   * @throws {Error} If activity type not found
   */
  async update(id, data, adminId) {
    // Check if exists
    const existing = await activityTypesRepo.findById(id);
    if (!existing) {
      throw new Error('Loại hoạt động không tồn tại');
    }

    // Check for duplicate name if name is being changed
    if (data.ten_loai_hd && data.ten_loai_hd !== existing.ten_loai_hd) {
      const duplicate = await activityTypesRepo.findByName(data.ten_loai_hd);
      if (duplicate && duplicate.id !== parseInt(id)) {
        throw new Error('Tên loại hoạt động đã tồn tại');
      }
    }

    // Update activity type
    const updated = await activityTypesRepo.update(id, data);

    logInfo(`Admin ${adminId} updated activity type ID ${id}`);

    return updated;
  }

  /**
   * Delete activity type
   * @param {number} id - Activity type ID
   * @param {number} adminId - ID of admin deleting the type
   * @returns {Promise<void>}
   * @throws {Error} If activity type not found or has dependencies
   */
  async delete(id, adminId) {
    // Check if exists
    const existing = await activityTypesRepo.findById(id);
    if (!existing) {
      throw new Error('Loại hoạt động không tồn tại');
    }

    // Delete activity type (Prisma will throw error if foreign key constraints exist)
    await activityTypesRepo.delete(id);

    logInfo(`Admin ${adminId} deleted activity type ID ${id}: ${existing.ten_loai_hd}`);
  }
}

module.exports = new ActivityTypesService();
