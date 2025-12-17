import type { LoaiHoatDong, Prisma } from '@prisma/client';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type IActivityTypeRepository from '../../business/interfaces/IActivityTypeRepository';
import type { FindAllParams, UpdateActivityTypeData } from '../../business/interfaces/IActivityTypeRepository';
import type { CreateActivityTypeInput } from '../../business/dto/CreateActivityTypeDto';

/**
 * Activity Types Repository
 * Data access layer for activity type management
 * Follows Repository Pattern
 */
class ActivityTypesRepository implements IActivityTypeRepository {
  async findAll({ skip, take, search }: FindAllParams): Promise<LoaiHoatDong[]> {
    const where: Prisma.LoaiHoatDongWhereInput = search
      ? {
          OR: [
            { ten_loai_hd: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { mo_ta: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
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

  async count(search?: string): Promise<number> {
    const where: Prisma.LoaiHoatDongWhereInput = search
      ? {
          OR: [
            { ten_loai_hd: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { mo_ta: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }
      : {};

    return prisma.loaiHoatDong.count({ where });
  }

  async findById(id: string): Promise<LoaiHoatDong | null> {
    return prisma.loaiHoatDong.findUnique({
      where: { id: String(id) },
    });
  }

  async findByName(name: string): Promise<LoaiHoatDong | null> {
    return prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: name },
    });
  }

  async create(data: CreateActivityTypeInput): Promise<LoaiHoatDong> {
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

  async update(id: string, data: UpdateActivityTypeData): Promise<LoaiHoatDong> {
    const updateData: Prisma.LoaiHoatDongUpdateInput = {};
    if (data.ten_loai_hd !== undefined) updateData.ten_loai_hd = data.ten_loai_hd;
    if (data.mo_ta !== undefined) updateData.mo_ta = data.mo_ta;
    if (data.diem_mac_dinh !== undefined) updateData.diem_mac_dinh = Number(data.diem_mac_dinh);
    if (data.diem_toi_da !== undefined) updateData.diem_toi_da = Number(data.diem_toi_da);
    if (data.mau_sac !== undefined) updateData.mau_sac = data.mau_sac;

    return prisma.loaiHoatDong.update({
      where: { id: String(id) },
      data: updateData,
    });
  }

  async delete(id: string): Promise<LoaiHoatDong> {
    return prisma.loaiHoatDong.delete({
      where: { id: String(id) },
    });
  }
}

const activityTypesRepository = new ActivityTypesRepository();

export default activityTypesRepository;
module.exports = activityTypesRepository;
