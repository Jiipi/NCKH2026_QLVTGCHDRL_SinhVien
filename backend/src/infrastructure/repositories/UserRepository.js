/**
 * User Repository
 * Domain-specific repository for User (NguoiDung) entity
 */

const BaseRepository = require('./BaseRepository');
const { prisma } = require('../prisma/client');
const { logInfo } = require('../../core/logger');

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.nguoiDung);
    this.modelName = 'User';
  }

  /**
   * Default select for user queries (exclude password)
   * @returns {Object}
   */
  getDefaultSelect() {
    return {
      id: true,
      mssv: true,
      ten_day_du: true,
      email: true,
      vai_tro: true,
      lop_id: true,
      khoa: true,
      nganh: true,
      so_dien_thoai: true,
      dia_chi: true,
      ngay_sinh: true,
      gioi_tinh: true,
      anh_dai_dien: true,
      is_active: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Find user by MSSV
   * @param {string} mssv
   * @param {boolean} includePassword
   * @returns {Promise<Object|null>}
   */
  async findByMSSV(mssv, includePassword = false) {
    const select = includePassword ? undefined : this.getDefaultSelect();
    return this.model.findUnique({
      where: { mssv },
      select,
      include: {
        lop: {
          select: {
            id: true,
            ten_lop: true,
            khoa: true,
            nganh: true,
          },
        },
      },
    });
  }

  /**
   * Find user by email
   * @param {string} email
   * @param {boolean} includePassword
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email, includePassword = false) {
    const select = includePassword ? undefined : this.getDefaultSelect();
    return this.model.findUnique({
      where: { email },
      select,
    });
  }

  /**
   * Find users by role
   * @param {string} role - ADMIN, GIANG_VIEN, SINH_VIEN, BAN_CAN_SU
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByRole(role, options = {}) {
    return this.findMany(
      {
        vai_tro: role,
        is_active: true,
      },
      {
        ...options,
        select: options.select || this.getDefaultSelect(),
      }
    );
  }

  /**
   * Find users by class
   * @param {number} classId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findByClass(classId, options = {}) {
    return this.findMany(
      {
        lop_id: classId,
        is_active: true,
      },
      {
        ...options,
        select: options.select || this.getDefaultSelect(),
      }
    );
  }

  /**
   * Find students (vai_tro = SINH_VIEN)
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findStudents(options = {}) {
    return this.findByRole('SINH_VIEN', options);
  }

  /**
   * Find teachers (vai_tro = GIANG_VIEN)
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findTeachers(options = {}) {
    return this.findByRole('GIANG_VIEN', options);
  }

  /**
   * Find admins (vai_tro = ADMIN or BAN_CAN_SU)
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async findAdmins(options = {}) {
    return this.findMany(
      {
        vai_tro: { in: ['ADMIN', 'BAN_CAN_SU'] },
        is_active: true,
      },
      {
        ...options,
        select: options.select || this.getDefaultSelect(),
      }
    );
  }

  /**
   * Check if user exists by MSSV
   * @param {string} mssv
   * @returns {Promise<boolean>}
   */
  async existsByMSSV(mssv) {
    return this.exists({ mssv });
  }

  /**
   * Check if user exists by email
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async existsByEmail(email) {
    return this.exists({ email });
  }

  /**
   * Update user profile
   * @param {number} id
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  async updateProfile(id, profileData) {
    const allowedFields = [
      'ten_day_du',
      'email',
      'so_dien_thoai',
      'dia_chi',
      'ngay_sinh',
      'gioi_tinh',
      'anh_dai_dien',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    });

    logInfo(`Updating profile for user ${id}`, { fields: Object.keys(updateData) });
    return this.update(id, updateData);
  }

  /**
   * Update user password
   * @param {number} id
   * @param {string} hashedPassword
   * @returns {Promise<Object>}
   */
  async updatePassword(id, hashedPassword) {
    logInfo(`Updating password for user ${id}`);
    return this.update(id, {
      mat_khau: hashedPassword,
    });
  }

  /**
   * Activate user
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async activate(id) {
    logInfo(`Activating user ${id}`);
    return this.update(id, { is_active: true });
  }

  /**
   * Deactivate user (soft delete)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async deactivate(id) {
    logInfo(`Deactivating user ${id}`);
    return this.update(id, { is_active: false });
  }

  /**
   * Search users by keyword
   * @param {string} keyword
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async search(keyword, options = {}) {
    return this.findMany(
      {
        OR: [
          { mssv: { contains: keyword, mode: 'insensitive' } },
          { ten_day_du: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
        ],
        is_active: true,
      },
      {
        ...options,
        select: options.select || this.getDefaultSelect(),
      }
    );
  }

  /**
   * Count users by role
   * @param {string} role
   * @returns {Promise<number>}
   */
  async countByRole(role) {
    return this.count({
      vai_tro: role,
      is_active: true,
    });
  }

  /**
   * Bulk create users
   * @param {Array<Object>} usersData
   * @returns {Promise<Object>}
   */
  async bulkCreate(usersData) {
    logInfo(`Bulk creating ${usersData.length} users`);
    return this.batchCreate(usersData);
  }
}

module.exports = new UserRepository();




