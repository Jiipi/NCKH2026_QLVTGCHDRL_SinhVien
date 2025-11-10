/**
 * Users Repository - Pure Data Access Layer
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const usersRepo = {
  /**
   * Lấy danh sách users
   */
  async findMany({ where = {}, skip = 0, limit = 20, orderBy = { createdAt: 'desc' }, select = {} }) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: Object.keys(select).length > 0 ? select : undefined
      }),
      prisma.user.count({ where })
    ]);

    return { items, total };
  },

  /**
   * Lấy user theo ID
   */
  async findById(id, select = {}) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: Object.keys(select).length > 0 ? select : undefined
    });
  },

  /**
   * Lấy user theo MSSV
   */
  async findByMSSV(mssv, select = {}) {
    return prisma.user.findUnique({
      where: { mssv },
      select: Object.keys(select).length > 0 ? select : undefined
    });
  },

  /**
   * Lấy user theo email
   */
  async findByEmail(email, select = {}) {
    return prisma.user.findUnique({
      where: { email },
      select: Object.keys(select).length > 0 ? select : undefined
    });
  },

  /**
   * Tạo user mới
   */
  async create(data) {
    return prisma.user.create({
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

    return prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  },

  /**
   * Xóa user (soft delete - set isActive = false)
   */
  async softDelete(id) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });
  },

  /**
   * Xóa user (hard delete)
   */
  async delete(id) {
    return prisma.user.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Check user exists
   */
  async exists(id) {
    const count = await prisma.user.count({
      where: { id: parseInt(id) }
    });
    return count > 0;
  },

  /**
   * Đếm users theo role
   */
  async countByRole(role) {
    return prisma.user.count({
      where: { role }
    });
  },

  /**
   * Lấy users theo class
   */
  async findByClass(className) {
    return prisma.user.findMany({
      where: { class: className },
      orderBy: { mssv: 'asc' }
    });
  },

  /**
   * Lấy users theo faculty
   */
  async findByFaculty(faculty) {
    return prisma.user.findMany({
      where: { faculty },
      orderBy: { fullName: 'asc' }
    });
  },

  /**
   * Search users
   */
  async search(searchTerm) {
    return prisma.user.findMany({
      where: {
        OR: [
          { mssv: { contains: searchTerm } },
          { fullName: { contains: searchTerm } },
          { email: { contains: searchTerm } }
        ]
      },
      take: 20
    });
  },

  /**
   * Get user stats
   */
  async getStats() {
    const [total, admin, giangVien, lopTruong, sinhVien, active] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'GIANG_VIEN' } }),
      prisma.user.count({ where: { role: 'LOP_TRUONG' } }),
      prisma.user.count({ where: { role: 'SINH_VIEN' } }),
      prisma.user.count({ where: { isActive: true } })
    ]);

    return {
      total,
      byRole: {
        ADMIN: admin,
        GIANG_VIEN: giangVien,
        LOP_TRUONG: lopTruong,
        SINH_VIEN: sinhVien
      },
      active,
      inactive: total - active
    };
  }
};

module.exports = usersRepo;
