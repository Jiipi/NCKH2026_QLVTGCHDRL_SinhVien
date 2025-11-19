const { prisma } = require('../../../../infrastructure/prisma/client');
const IRoleRepository = require('../../domain/interfaces/IRoleRepository');

/**
 * RolePrismaRepository
 * Prisma implementation of IRoleRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class RolePrismaRepository extends IRoleRepository {
  async findMany(filters = {}, pagination = {}) {
    const { search } = filters;
    const { page = 1, limit = 20 } = pagination;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const where = search
      ? { 
          OR: [
            { ten_vt: { contains: search, mode: 'insensitive' } }, 
            { mo_ta: { contains: search, mode: 'insensitive' } }
          ] 
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.vaiTro.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { ngay_tao: 'desc' } 
      }),
      prisma.vaiTro.count({ where })
    ]);

    return { items, total };
  }

  async findById(id) {
    return await prisma.vaiTro.findUnique({ where: { id } });
  }

  async findByName(name) {
    return await prisma.vaiTro.findFirst({ where: { ten_vt: name } });
  }

  async create(data) {
    return await prisma.vaiTro.create({ 
      data: { 
        ten_vt: data.ten_vt, 
        mo_ta: data.mo_ta || null, 
        quyen_han: data.quyen_han || null 
      } 
    });
  }

  async update(id, data) {
    const updateData = {};
    if (data.ten_vt !== undefined) updateData.ten_vt = data.ten_vt;
    if (data.mo_ta !== undefined) updateData.mo_ta = data.mo_ta;
    if (data.quyen_han !== undefined) updateData.quyen_han = data.quyen_han;
    
    return await prisma.vaiTro.update({ 
      where: { id }, 
      data: updateData
    });
  }

  async delete(id) {
    return await prisma.vaiTro.delete({ where: { id } });
  }

  async countUsersWithRole(roleId) {
    return await prisma.nguoiDung.count({ where: { vai_tro_id: roleId } });
  }

  async findUsersWithRole(roleId) {
    return await prisma.nguoiDung.findMany({ 
      where: { vai_tro_id: roleId }, 
      select: { id: true } 
    });
  }

  async reassignUsers(oldRoleId, newRoleId) {
    return await prisma.nguoiDung.updateMany({ 
      where: { vai_tro_id: oldRoleId }, 
      data: { vai_tro_id: newRoleId } 
    });
  }

  async assignRoleToUsers(roleId, userIds) {
    return await prisma.nguoiDung.updateMany({
      where: { id: { in: userIds } },
      data: { vai_tro_id: roleId }
    });
  }

  async countClassesWithHomeroom(userIds) {
    return await prisma.lop.count({ 
      where: { chu_nhiem: { in: userIds } } 
    });
  }

  async findStudentsByUserIds(userIds) {
    return await prisma.sinhVien.findMany({ 
      where: { nguoi_dung_id: { in: userIds } }, 
      select: { id: true } 
    });
  }

  async findActivitiesByCreators(userIds) {
    return await prisma.hoatDong.findMany({ 
      where: { nguoi_tao_id: { in: userIds } }, 
      select: { id: true } 
    });
  }

  async cascadeDeleteUsers(userIds, studentIds, activityIds) {
    return await prisma.$transaction(async (tx) => {
      if (studentIds.length > 0) {
        await tx.lop.updateMany({ 
          where: { lop_truong: { in: studentIds } }, 
          data: { lop_truong: null } 
        });
      }

      if (studentIds.length > 0) {
        await tx.dangKyHoatDong.deleteMany({ where: { sv_id: { in: studentIds } } });
        await tx.diemDanh.deleteMany({ where: { sv_id: { in: studentIds } } });
      }

      if (userIds.length > 0) {
        await tx.diemDanh.deleteMany({ where: { nguoi_diem_danh_id: { in: userIds } } });
      }

      if (activityIds.length > 0) {
        await tx.dangKyHoatDong.deleteMany({ where: { hd_id: { in: activityIds } } });
        await tx.diemDanh.deleteMany({ where: { hd_id: { in: activityIds } } });
        await tx.hoatDong.deleteMany({ where: { id: { in: activityIds } } });
      }

      if (userIds.length > 0) {
        await tx.thongBao.deleteMany({ 
          where: { 
            OR: [
              { nguoi_gui_id: { in: userIds } }, 
              { nguoi_nhan_id: { in: userIds } }
            ] 
          } 
        });
      }

      if (userIds.length > 0) {
        await tx.sinhVien.deleteMany({ where: { nguoi_dung_id: { in: userIds } } });
      }

      await tx.nguoiDung.deleteMany({ where: { id: { in: userIds } } });
    });
  }
}

module.exports = RolePrismaRepository;

