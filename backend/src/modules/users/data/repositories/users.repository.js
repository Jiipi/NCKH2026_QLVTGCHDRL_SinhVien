/**
 * Users Repository - Pure Data Access Layer
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

const usersRepository = {
  /**
   * Lấy danh sách users
   */
  async findMany({ where = {}, skip = 0, limit = 20, orderBy = { ngay_tao: 'desc' }, select = {} }) {
    const [items, total] = await Promise.all([
      prisma.nguoiDung.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: Object.keys(select).length > 0 ? select : undefined,
        include: {
          vai_tro: true,
          sinh_vien: {
            include: {
              lop: true
            }
          }
        }
      }),
      prisma.nguoiDung.count({ where })
    ]);

    return { items, total };
  },

  /**
   * Lấy user theo ID
   */
  async findById(id, select = {}) {
    return prisma.nguoiDung.findUnique({
      where: { id: id },
      select: Object.keys(select).length > 0 ? select : undefined,
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  },

  /**
   * Lấy user theo MSSV
   */
  async findByMSSV(mssv, select = {}) {
    return prisma.nguoiDung.findUnique({
      where: { mssv },
      select: Object.keys(select).length > 0 ? select : undefined
    });
  },

  /**
   * Lấy user theo email
   */
  async findByEmail(email, select = {}) {
    return prisma.nguoiDung.findUnique({
      where: { email },
      select: Object.keys(select).length > 0 ? select : undefined
    });
  },

  /**
   * Tạo user mới
   */
  async create(data) {
    return prisma.nguoiDung.create({
      data: {
        mssv: data.mssv,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role || 'SINH_VIEN',
        class: data.class || null,
        major: data.major || null,
        faculty: data.faculty || null,
        phone: data.phone || null,
        address: data.address || null
      }
    });
  },

  /**
   * Update user
   */
  async update(id, data) {
    const updateData = {};
    
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.class !== undefined) updateData.class = data.class;
    if (data.major !== undefined) updateData.major = data.major;
    if (data.faculty !== undefined) updateData.faculty = data.faculty;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.nguoiDung.update({
      where: { id },
      data: updateData
    });
  },

  /**
   * Xóa user
   */
  async delete(id) {
    return prisma.nguoiDung.delete({
      where: { id }
    });
  },

  /**
   * Đếm users
   */
  async count(where = {}) {
    return prisma.nguoiDung.count({ where });
  },

  /**
   * Tìm kiếm users
   */
  async search(searchTerm, limit = 20) {
    return prisma.nguoiDung.findMany({
      where: {
        OR: [
          { ho_ten: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { mssv: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: limit,
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  },

  /**
   * Lấy users theo class
   */
  async findByClass(classId, options = {}) {
    const { skip = 0, limit = 20 } = options;
    
    return prisma.nguoiDung.findMany({
      where: {
        sinh_vien: {
          lop_id: classId
        }
      },
      skip,
      take: limit,
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  },

  /**
   * Lấy thống kê users
   */
  async getStats() {
    const [total, byRole, byStatus] = await Promise.all([
      prisma.nguoiDung.count(),
      prisma.nguoiDung.groupBy({
        by: ['vai_tro_id'],
        _count: true
      }),
      prisma.nguoiDung.groupBy({
        by: ['trang_thai'],
        _count: true
      })
    ]);

    return {
      total,
      byRole,
      byStatus
    };
  }
};

module.exports = usersRepository;

