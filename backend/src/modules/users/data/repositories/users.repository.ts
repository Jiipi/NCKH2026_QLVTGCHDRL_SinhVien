/**
 * Users Repository - Pure Data Access Layer
 */

import type { NguoiDung, Prisma } from '@prisma/client';
const { prisma } = require('../../../../data/infrastructure/prisma/client');

interface FindManyOptions {
  where?: Prisma.NguoiDungWhereInput;
  skip?: number;
  limit?: number;
  orderBy?: Prisma.NguoiDungOrderByWithRelationInput | Prisma.NguoiDungOrderByWithRelationInput[];
  select?: Prisma.NguoiDungSelect;
}

interface FindManyResult {
  items: NguoiDung[];
  total: number;
}

interface UserCreateData {
  mssv: string;
  fullName: string;
  email: string;
  password: string;
  role?: string;
  class?: string | null;
  major?: string | null;
  faculty?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface UserUpdateData {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  class?: string | null;
  major?: string | null;
  faculty?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
}

interface RoleCount {
  vai_tro_id: number | null;
  _count: number;
}

interface StatusCount {
  trang_thai: string | null;
  _count: number;
}

interface SessionGroup {
  nguoi_dung_id: number;
}

interface UserStats {
  total: number;
  byRole: RoleCount[];
  byStatus: StatusCount[];
  online: number;
}

interface FindByClassOptions {
  skip?: number;
  limit?: number;
}

const usersRepository = {
  /**
   * Lấy danh sách users
   */
  async findMany({ where = {}, skip = 0, limit = 20, orderBy = { ngay_tao: 'desc' }, select = {} }: FindManyOptions): Promise<FindManyResult> {
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
  async findById(id: number | string, select: Prisma.NguoiDungSelect = {}): Promise<NguoiDung | null> {
    return prisma.nguoiDung.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
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
  async findByMSSV(mssv: string, select: Prisma.NguoiDungSelect = {}): Promise<NguoiDung | null> {
    return prisma.nguoiDung.findUnique({
      where: { mssv },
      select: Object.keys(select).length > 0 ? select : undefined
    });
  },

  /**
   * Lấy user theo email
   */
  async findByEmail(email: string, select: Prisma.NguoiDungSelect = {}): Promise<NguoiDung | null> {
    return prisma.nguoiDung.findUnique({
      where: { email },
      select: Object.keys(select).length > 0 ? select : undefined
    });
  },

  /**
   * Tạo user mới
   */
  async create(data: UserCreateData): Promise<NguoiDung> {
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
  async update(id: number | string, data: UserUpdateData): Promise<NguoiDung> {
    const updateData: Record<string, unknown> = {};
    
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
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      data: updateData
    });
  },

  /**
   * Xóa user
   */
  async delete(id: number | string): Promise<NguoiDung> {
    return prisma.nguoiDung.delete({
      where: { id: typeof id === 'string' ? parseInt(id, 10) : id }
    });
  },

  /**
   * Đếm users
   */
  async count(where: Prisma.NguoiDungWhereInput = {}): Promise<number> {
    return prisma.nguoiDung.count({ where });
  },

  /**
   * Tìm kiếm users
   */
  async search(searchTerm: string, limit: number = 20): Promise<NguoiDung[]> {
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
  async findByClass(classId: number | string, options: FindByClassOptions = {}): Promise<NguoiDung[]> {
    const { skip = 0, limit = 20 } = options;
    
    return prisma.nguoiDung.findMany({
      where: {
        sinh_vien: {
          lop_id: typeof classId === 'string' ? parseInt(classId, 10) : classId
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
  async getStats(): Promise<UserStats> {
    // Ngưỡng thời gian: 5 phút
    const thresholdTime = new Date(Date.now() - 5 * 60 * 1000);
    
    const [total, byRole, byStatus, activeSessionUsers] = await Promise.all([
      prisma.nguoiDung.count(),
      prisma.nguoiDung.groupBy({
        by: ['vai_tro_id'],
        _count: true
      }),
      prisma.nguoiDung.groupBy({
        by: ['trang_thai'],
        _count: true
      }),
      // Đếm số user có session active trong 5 phút gần đây
      prisma.phienDangNhap.groupBy({
        by: ['nguoi_dung_id'],
        where: {
          lan_hoat_dong: {
            gte: thresholdTime
          }
        }
      })
    ]) as [number, RoleCount[], StatusCount[], SessionGroup[]];

    // Số user online (có session active)
    const onlineCount = activeSessionUsers.length;

    return {
      total,
      byRole,
      byStatus,
      online: onlineCount
    };
  }
};

export default usersRepository;
module.exports = usersRepository;
