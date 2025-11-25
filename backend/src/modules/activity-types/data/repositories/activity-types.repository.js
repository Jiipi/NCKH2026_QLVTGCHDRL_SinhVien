const { prisma } = require('../../../../data/infrastructure/prisma/client');

/**
 * Activity Types Repository
 * Data access layer for activity type management
 * Follows Repository Pattern
 */
class ActivityTypesRepository {
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

  async findById(id) {
    return prisma.loaiHoatDong.findUnique({
      where: { id: String(id) },
    });
  }

  async findByName(name) {
    return prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: name },
    });
  }

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

  async delete(id) {
    return prisma.loaiHoatDong.delete({
      where: { id: String(id) },
    });
  }
}

module.exports = new ActivityTypesRepository();

