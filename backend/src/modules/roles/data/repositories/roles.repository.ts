import { prisma } from '../../../../data/infrastructure/prisma/client';
import type { VaiTro, NguoiDung, SinhVien, HoatDong, Prisma } from '@prisma/client';
import type IRoleRepository from '../../business/interfaces/IRoleRepository';
import type {
  RoleFilters,
  Pagination,
  FindManyResult,
  RoleCreateData,
  RoleUpdateData,
  UserIdOnly,
  StudentIdOnly,
  ActivityIdOnly,
  BatchUpdateResult
} from '../../business/interfaces/IRoleRepository';

/**
 * Roles Repository
 * Data access layer for role management
 * Follows Repository Pattern
 */
class RolesRepository implements IRoleRepository {
  async findMany(filters: RoleFilters = {}, pagination: Pagination = {}): Promise<FindManyResult> {
    const { search } = filters;
    const { page = 1, limit = 20 } = pagination;
    
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const take = parseInt(String(limit));
    
    const where: Prisma.VaiTroWhereInput = search
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

  async findById(id: string): Promise<VaiTro | null> {
    return await prisma.vaiTro.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<VaiTro | null> {
    return await prisma.vaiTro.findFirst({ where: { ten_vt: name } });
  }

  async create(data: RoleCreateData): Promise<VaiTro> {
    return await prisma.vaiTro.create({ 
      data: { 
        ten_vt: data.ten_vt, 
        mo_ta: data.mo_ta || null, 
        quyen_han: data.quyen_han || null 
      } 
    });
  }

  async update(id: string, data: RoleUpdateData): Promise<VaiTro> {
    const updateData: Prisma.VaiTroUpdateInput = {};
    if (data.ten_vt !== undefined) updateData.ten_vt = data.ten_vt;
    if (data.mo_ta !== undefined) updateData.mo_ta = data.mo_ta;
    if (data.quyen_han !== undefined) updateData.quyen_han = data.quyen_han;
    
    return await prisma.vaiTro.update({ 
      where: { id }, 
      data: updateData
    });
  }

  async delete(id: string): Promise<VaiTro> {
    return await prisma.vaiTro.delete({ where: { id } });
  }

  async countUsersWithRole(roleId: string): Promise<number> {
    return await prisma.nguoiDung.count({ where: { vai_tro_id: roleId } });
  }

  async findUsersWithRole(roleId: string): Promise<UserIdOnly[]> {
    return await prisma.nguoiDung.findMany({ 
      where: { vai_tro_id: roleId }, 
      select: { id: true } 
    });
  }

  async reassignUsers(oldRoleId: string, newRoleId: string): Promise<BatchUpdateResult> {
    return await prisma.nguoiDung.updateMany({ 
      where: { vai_tro_id: oldRoleId }, 
      data: { vai_tro_id: newRoleId } 
    });
  }

  async assignRoleToUsers(roleId: string, userIds: string[]): Promise<BatchUpdateResult> {
    return await prisma.nguoiDung.updateMany({
      where: { id: { in: userIds } },
      data: { vai_tro_id: roleId }
    });
  }

  async countClassesWithHomeroom(userIds: string[]): Promise<number> {
    return await prisma.lop.count({ 
      where: { chu_nhiem: { in: userIds } } 
    });
  }

  async findStudentsByUserIds(userIds: string[]): Promise<StudentIdOnly[]> {
    return await prisma.sinhVien.findMany({ 
      where: { nguoi_dung_id: { in: userIds } }, 
      select: { id: true } 
    });
  }

  async findActivitiesByCreators(userIds: string[]): Promise<ActivityIdOnly[]> {
    return await prisma.hoatDong.findMany({ 
      where: { nguoi_tao_id: { in: userIds } }, 
      select: { id: true } 
    });
  }

  async cascadeDeleteUsers(userIds: string[], studentIds: string[], activityIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
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

const rolesRepository = new RolesRepository();

export default rolesRepository;
module.exports = rolesRepository;
