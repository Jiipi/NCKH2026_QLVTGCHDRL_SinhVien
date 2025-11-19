/**
 * Users Repository - Pure Data Access Layer
 */

const { prisma } = require('../../infrastructure/prisma/client');

const usersRepo = {
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
      select: Object.keys(select).length > 0 ? select : undefined
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
      where: { id: parseInt(id) },
      data: updateData
    });
  },

  /**
   * Xóa user (soft delete - set isActive = false)
   */
  async softDelete(id) {
    return prisma.nguoiDung.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });
  },

  /**
   * Xóa user (hard delete)
   */
  async delete(id) {
    return prisma.nguoiDung.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Check user exists
   */
  async exists(id) {
    const count = await prisma.nguoiDung.count({
      where: { id: parseInt(id) }
    });
    return count > 0;
  },

  /**
   * Đếm users theo role
   */
  async countByRole(role) {
    return prisma.nguoiDung.count({
      where: { role }
    });
  },

  /**
   * Lấy users theo class
   */
  async findByClass(className) {
    return prisma.nguoiDung.findMany({
      where: { class: className },
      orderBy: { mssv: 'asc' }
    });
  },

  /**
   * Lấy users theo faculty
   */
  async findByFaculty(faculty) {
    return prisma.nguoiDung.findMany({
      where: { faculty },
      orderBy: { fullName: 'asc' }
    });
  },

  /**
   * Search users
   */
  async search(searchTerm) {
    return prisma.nguoiDung.findMany({
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
   * Get user stats (counts by role + status)
   */
  async getStats() {
    const [total, activeCount, lockedCount, groupedByRole] = await prisma.$transaction([
      prisma.nguoiDung.count(),
      prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } }),
      prisma.nguoiDung.count({ where: { trang_thai: 'khoa' } }),
      prisma.nguoiDung.groupBy({
        by: ['vai_tro_id'],
        _count: { _all: true }
      })
    ]);

    const roleIds = groupedByRole.map(group => group.vai_tro_id).filter(Boolean);
    const roleRecords = roleIds.length
      ? await prisma.vaiTro.findMany({
          where: { id: { in: roleIds } },
          select: { id: true, ten_vt: true }
        })
      : [];
    const roleNameMap = Object.fromEntries(roleRecords.map(r => [r.id, r.ten_vt || '']));

    const normalizeRoleName = (value = '') => {
      if (!value) return '';
      return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toUpperCase();
    };

    const ROLE_VARIANTS = {
      ADMIN: ['ADMIN', 'QUAN_TRI_VIEN', 'QUAN_TRI', 'QUAN_TRI_HE_THONG', 'NEO_ADMIN'],
      GIANG_VIEN: ['GIANG_VIEN', 'GIANGVIEN', 'GIANG_VIEN_CHU_NHIEM', 'GV', 'GIAO_VIEN'],
      LOP_TRUONG: ['LOP_TRUONG', 'LOPTRUONG', 'CLASS_LEADER', 'LT', 'BAN_CAN_SU', 'BAN_CAN_SU_LOP'],
      SINH_VIEN: ['SINH_VIEN', 'SINHVIEN', 'STUDENT', 'SV']
    };

    const byRole = { ADMIN: 0, GIANG_VIEN: 0, LOP_TRUONG: 0, SINH_VIEN: 0 };

    groupedByRole.forEach(group => {
      const roleName = roleNameMap[group.vai_tro_id] || '';
      const normalized = normalizeRoleName(roleName);
      const categoryEntry = Object.entries(ROLE_VARIANTS).find(([, variants]) =>
        variants.includes(normalized)
      );
      if (categoryEntry) {
        const [category] = categoryEntry;
        byRole[category] += group._count._all;
      }
    });

    return {
      total,
      byRole,
      active: activeCount,
      inactive: total - activeCount,
      locked: lockedCount
    };
  }
};

module.exports = usersRepo;





