/**
 * Activities Repository
 * DATA LAYER - Pure data access, Prisma queries only
 * No business logic
 * Implements IActivityRepository interface
 */

import type { PrismaClient, HoatDong, Prisma, DangKyHoatDong, SinhVien, Lop } from '@prisma/client';
import IActivityRepository from '../../business/interfaces/IActivityRepository';

const { prisma } = require('../../../../data/infrastructure/prisma/client');

interface FindManyResult {
  items: HoatDong[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FindManyOptions {
  page?: number;
  limit?: number | string | null;
  sort?: string;
  order?: 'asc' | 'desc';
  include?: Prisma.HoatDongInclude;
}

interface RegistrationStats {
  total: number;
  cho_duyet: number;
  da_duyet: number;
  tu_choi: number;
  da_tham_gia: number;
  [key: string]: number;
}

interface StudentRegistration {
  hd_id: string;
  trang_thai_dk: string | null;
  ngay_dang_ky: Date | null;
}

interface StudentInfo {
  id: string;
  lop_id: string | null;
}

interface ClassInfo {
  chu_nhiem: string | null;
  ten_lop: string;
}

interface StudentByClass {
  nguoi_dung_id: string;
}

class ActivitiesRepository extends IActivityRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = prisma;
  }

  /**
   * Find many activities with filters and pagination
   */
  async findMany(where: Prisma.HoatDongWhereInput = {}, options: FindManyOptions = {}): Promise<FindManyResult> {
    const {
      page = 1,
      limit, // No default - undefined means fetch all
      sort = 'ngay_cap_nhat',
      order = 'desc',
      include = this.getDefaultInclude()
    } = options;
    
    // Handle limit: undefined/null/'all' = no limit (fetch all)
    let effectiveLimit: number | undefined;
    if (limit === undefined || limit === null || limit === 'all') {
      effectiveLimit = undefined;
    } else {
      const parsed = typeof limit === 'string' ? parseInt(limit) : limit;
      effectiveLimit = isNaN(parsed) ? undefined : parsed;
    }
    
    const effectivePage = effectiveLimit === undefined ? 1 : parseInt(String(page));
    const skip = effectiveLimit ? (effectivePage - 1) * effectiveLimit : undefined;
    const take = effectiveLimit;
    
    const orderBy: Prisma.HoatDongOrderByWithRelationInput = sort ? { [sort]: order === 'asc' ? 'asc' : 'desc' } as Prisma.HoatDongOrderByWithRelationInput : {};
    
    const [items, total] = await Promise.all([
      this.prisma.hoatDong.findMany({
        where,
        skip: take ? skip : undefined,
        take,
        include,
        orderBy
      }),
      this.prisma.hoatDong.count({ where })
    ]);
    
    return {
      items,
      total,
      page: effectivePage,
      limit: effectiveLimit || total,
      totalPages: effectiveLimit ? Math.ceil(total / effectiveLimit) : 1
    };
  }
  
  /**
   * Find activity by ID
   */
  async findById(id: string, where: Prisma.HoatDongWhereInput = {}, include: Prisma.HoatDongInclude | null = null): Promise<HoatDong | null> {
    if (!id) return null;
    return this.prisma.hoatDong.findFirst({
      where: { id: String(id), ...where },
      include: include || this.getDefaultInclude()
    });
  }
  
  /**
   * Find activity by ID with full details (registrations)
   */
  async findByIdWithDetails(id: string): Promise<HoatDong | null> {
    if (!id) return null;
    return this.prisma.hoatDong.findUnique({
      where: { id: String(id) },
      include: {
        loai_hd: {
          select: {
            id: true,
            ten_loai_hd: true,
            diem_mac_dinh: true,
            diem_toi_da: true,
            mau_sac: true
          }
        },
        nguoi_tao: {
          select: {
            id: true,
            ho_ten: true,
            email: true
          }
        },
        dang_ky_hd: {
          include: {
            sinh_vien: {
              include: {
                nguoi_dung: {
                  select: { ho_ten: true, email: true }
                }
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Create new activity
   */
  async create(data: Prisma.HoatDongCreateInput): Promise<HoatDong> {
    return this.prisma.hoatDong.create({
      data: {
        ...data,
        hinh_anh: data.hinh_anh || [],
        tep_dinh_kem: data.tep_dinh_kem || []
      },
      include: this.getDefaultInclude()
    });
  }
  
  /**
   * Update activity
   */
  async update(id: string, data: Prisma.HoatDongUpdateInput): Promise<HoatDong> {
    return this.prisma.hoatDong.update({
      where: { id: String(id) },
      data,
      include: this.getDefaultInclude()
    });
  }
  
  /**
   * Delete activity
   */
  async delete(id: string): Promise<HoatDong> {
    return this.prisma.hoatDong.delete({
      where: { id: String(id) }
    });
  }
  
  /**
   * Check if activity exists
   */
  async exists(id: string, where: Prisma.HoatDongWhereInput = {}): Promise<boolean> {
    if (!id) return false;
    const count = await this.prisma.hoatDong.count({
      where: { id: String(id), ...where }
    });
    return count > 0;
  }
  
  /**
   * Count activities
   */
  async count(where: Prisma.HoatDongWhereInput = {}): Promise<number> {
    return this.prisma.hoatDong.count({ where });
  }
  
  /**
   * Get registration statistics for activity
   */
  async getRegistrationStats(id: string): Promise<RegistrationStats> {
    if (!id) return { total: 0, cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 };
    
    const stats = await this.prisma.dangKyHoatDong.groupBy({
      by: ['trang_thai_dk'],
      where: { hd_id: String(id) },
      _count: true
    });
    
    const result: RegistrationStats = {
      total: 0,
      cho_duyet: 0,
      da_duyet: 0,
      tu_choi: 0,
      da_tham_gia: 0
    };
    
    stats.forEach((stat: { trang_thai_dk: string | null; _count: number }) => {
      const status = stat.trang_thai_dk || 'cho_duyet';
      result[status] = stat._count;
      result.total += stat._count;
    });
    
    return result;
  }
  
  /**
   * Get user's registration for activity
   */
  async findUserRegistration(activityId: string, userId: string): Promise<DangKyHoatDong | null> {
    return this.prisma.dangKyHoatDong.findFirst({
      where: {
        hd_id: String(activityId),
        sv_id: String(userId)
      }
    });
  }

  /**
   * Get student info by user ID
   */
  async findStudentByUserId(userId: string): Promise<StudentInfo | null> {
    return this.prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true, lop_id: true }
    });
  }

  /**
   * Get registrations for activities by student ID
   */
  async findRegistrationsByStudent(studentId: string, activityIds: string[]): Promise<StudentRegistration[]> {
    return this.prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: studentId,
        hd_id: { in: activityIds }
      },
      select: {
        hd_id: true,
        trang_thai_dk: true,
        ngay_dang_ky: true
      }
    });
  }

  /**
   * Get all students in a class
   */
  async findStudentsByClass(classId: string): Promise<StudentByClass[]> {
    return this.prisma.sinhVien.findMany({
      where: { lop_id: classId },
      select: { nguoi_dung_id: true }
    });
  }

  /**
   * Get class info with homeroom teacher
   */
  async findClassById(classId: string): Promise<ClassInfo | null> {
    return this.prisma.lop.findUnique({
      where: { id: classId },
      select: { chu_nhiem: true, ten_lop: true }
    });
  }

  /**
   * Count registrations by activity and class
   */
  async countRegistrationsByClass(activityIds: string[], classId: string): Promise<Record<string, number>> {
    const grouped = await this.prisma.dangKyHoatDong.groupBy({
      by: ['hd_id'],
      where: {
        hd_id: { in: activityIds },
        sinh_vien: { lop_id: classId },
        trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
      },
      _count: { _all: true }
    }).catch(async (): Promise<Record<string, number>> => {
      // Fallback for older Prisma versions
      const rows = await this.prisma.dangKyHoatDong.findMany({
        where: {
          hd_id: { in: activityIds },
          sinh_vien: { lop_id: classId },
          trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
        },
        select: { hd_id: true }
      });
      return rows.reduce((acc: Record<string, number>, r: { hd_id: string }) => {
        acc[r.hd_id] = (acc[r.hd_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    });

    if (Array.isArray(grouped)) {
      return Object.fromEntries(grouped.map((g: { hd_id: string; _count?: { _all?: number } }) => [g.hd_id, g._count?._all || 0]));
    }
    return grouped || {};
  }
  
  /**
   * Default include for activity queries
   */
  getDefaultInclude(): Prisma.HoatDongInclude {
    return {
      loai_hd: {
        select: {
          id: true,
          ten_loai_hd: true,
          diem_mac_dinh: true,
          diem_toi_da: true,
          mau_sac: true
        }
      },
      nguoi_tao: {
        select: {
          id: true,
          ho_ten: true,
          email: true,
          sinh_vien: {
            select: {
              mssv: true,
              lop: {
                select: {
                  ten_lop: true
                }
              }
            }
          }
        }
      },
      dang_ky_hd: {
        select: {
          id: true,
          trang_thai_dk: true
        }
      }
    };
  }
}

// Export class as default and also create a singleton instance
export default ActivitiesRepository;
export const activitiesRepository = new ActivitiesRepository();
module.exports = activitiesRepository;
module.exports.default = ActivitiesRepository;
module.exports.activitiesRepository = activitiesRepository;
