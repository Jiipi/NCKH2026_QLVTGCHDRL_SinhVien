/**
 * Registrations Repository - Pure Data Access Layer
 * Chỉ chứa Prisma queries, không có business logic
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import { ValidationError } from '../../../../core/errors/AppError';
import { auditIntegrityService } from '../../../audit-integrity/services/auditIntegrity.service';
import type { DangKyHoatDong, Prisma, HocKy, TrangThaiDangKy } from '@prisma/client';
import type { 
  IRegistrationRepository, 
  FindManyParams, 
  FindManyResult, 
  RegistrationIncludeOptions,
  CreateRegistrationData,
  UpdateRegistrationData,
  UserRegistrationFilters,
  ActivityStats,
  BulkUpdateResult,
  StudentIdentity,
  ActivityForRegistrationValidation,
  RegistrationExportFilters,
  RegistrationExportItem
} from '../../business/interfaces/IRegistrationRepository';
import type { RegistrationStatusVN, RegistrationStatusEN } from '../../registrations.types';

/**
 * Status mapping from EN to VN
 */
const STATUS_MAP_EN_TO_VN: Record<RegistrationStatusEN, RegistrationStatusVN> = {
  'PENDING': 'cho_duyet',
  'APPROVED': 'da_duyet',
  'REJECTED': 'tu_choi',
  'ATTENDED': 'da_tham_gia'
};

/**
 * Status mapping from VN to EN
 */
const STATUS_MAP_VN_TO_EN: Record<RegistrationStatusVN, RegistrationStatusEN> = {
  'cho_duyet': 'PENDING',
  'da_duyet': 'APPROVED',
  'tu_choi': 'REJECTED',
  'da_tham_gia': 'ATTENDED'
};

/**
 * Normalized registration with unified fields
 */
interface NormalizedRegistration {
  id: string;
  sv_id?: string;
  hd_id?: string;
  trang_thai_dk?: RegistrationStatusVN;
  status?: RegistrationStatusEN;
  activity?: unknown;
  activityId?: string;
  user?: unknown;
  userId?: string;
  student?: unknown;
  [key: string]: unknown;
}

/**
 * RegistrationsRepository
 */
class RegistrationsRepository implements IRegistrationRepository {
  async findRegistrationsForExport(filters: RegistrationExportFilters = {}): Promise<RegistrationExportItem[]> {
    const where: Prisma.DangKyHoatDongWhereInput = {
      ...(filters.status ? { trang_thai_dk: filters.status as TrangThaiDangKy } : {}),
      ...(filters.classId ? { sinh_vien: { lop_id: filters.classId } } : {}),
      ...((filters.hoc_ky || filters.nam_hoc)
        ? {
            hoat_dong: {
              ...(filters.hoc_ky ? { hoc_ky: filters.hoc_ky as HocKy } : {}),
              ...(filters.nam_hoc ? { nam_hoc: filters.nam_hoc } : {})
            }
          }
        : {}),
    };

    return prisma.dangKyHoatDong.findMany({
      where,
      include: {
        sinh_vien: { include: { nguoi_dung: true, lop: true } },
        hoat_dong: { include: { loai_hd: true } }
      },
      orderBy: { ngay_dang_ky: 'desc' }
    }) as unknown as RegistrationExportItem[];
  }

  async findStudentByUserId(userId: string): Promise<StudentIdentity | null> {
    return prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: String(userId) },
      select: { id: true, nguoi_dung_id: true, lop_id: true }
    }) as Promise<StudentIdentity | null>;
  }

  async findActivityForRegistrationValidation(activityId: string): Promise<ActivityForRegistrationValidation | null> {
    return prisma.hoatDong.findUnique({
      where: { id: String(activityId) },
      select: {
        id: true,
        ten_hd: true,
        nguoi_tao_id: true,
        trang_thai: true,
        sl_toi_da: true,
        han_dk: true,
        ngay_bd: true,
        _count: {
          select: {
            dang_ky_hd: {
              where: {
                trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
              }
            }
          }
        }
      }
    }) as Promise<ActivityForRegistrationValidation | null>;
  }

  /**
   * Normalize raw item to unified shape
   */
  private normalize(item: Record<string, unknown>): NormalizedRegistration {
    const normalized: NormalizedRegistration = { ...item } as NormalizedRegistration;
    
    // Add unified status for callers expecting EN locale
    if (normalized.trang_thai_dk) {
      const mappedStatus = STATUS_MAP_VN_TO_EN[normalized.trang_thai_dk as RegistrationStatusVN];
      normalized.status = (mappedStatus || normalized.trang_thai_dk) as RegistrationStatusEN;
    }
    
    // Map legacy relations
    if (normalized.hoat_dong) {
      normalized.activity = normalized.hoat_dong;
      normalized.activityId = normalized.hd_id;
      delete normalized.hoat_dong;
    }
    
    if (normalized.sinh_vien) {
      const sinhVien = normalized.sinh_vien as Record<string, unknown>;
      normalized.user = sinhVien.nguoi_dung;
      normalized.userId = normalized.sv_id;
      normalized.student = normalized.sinh_vien;
      delete normalized.sinh_vien;
    }
    
    return normalized;
  }

  /**
   * Lấy danh sách registrations với filter và pagination
   */
  async findMany<T = unknown>({ 
    where = {}, 
    skip = 0, 
    limit = 20, 
    orderBy = { ngay_dang_ky: 'desc' }, 
    include = {} 
  }: FindManyParams): Promise<FindManyResult<T>> {
    const hasLimit = typeof limit === 'number' && Number.isFinite(limit) && limit > 0;
    
    // Map generic filters to legacy schema
    const mappedWhere: Record<string, unknown> = { ...where };
    if (mappedWhere.status) {
      const status = mappedWhere.status as RegistrationStatusEN;
      mappedWhere.trang_thai_dk = STATUS_MAP_EN_TO_VN[status] || mappedWhere.status;
      delete mappedWhere.status;
    }

    // Build include for legacy relations
    const prismaInclude: Prisma.DangKyHoatDongInclude = {};
    if (include.activity) {
      prismaInclude.hoat_dong = true;
    }
    if (include.user) {
      prismaInclude.sinh_vien = { include: { nguoi_dung: true, lop: true } };
    }

    const queryOptions: Prisma.DangKyHoatDongFindManyArgs = {
      where: mappedWhere as Prisma.DangKyHoatDongWhereInput,
      orderBy: orderBy as Prisma.DangKyHoatDongOrderByWithRelationInput,
      include: prismaInclude
    };

    if (hasLimit) {
      queryOptions.skip = skip;
      queryOptions.take = limit;
    }

    const [rawItems, total] = await Promise.all([
      prisma.dangKyHoatDong.findMany(queryOptions),
      prisma.dangKyHoatDong.count({ where: mappedWhere as Prisma.DangKyHoatDongWhereInput })
    ]);

    // Normalize to unified shape when include requested
    const items = rawItems.map(item => this.normalize(item as unknown as Record<string, unknown>) as T);

    return { items, total };
  }

  async findById<T = unknown>(id: string, include: RegistrationIncludeOptions = {}): Promise<T | null> {
    const prismaInclude: Prisma.DangKyHoatDongInclude = {};
    if (include.activity) {
      prismaInclude.hoat_dong = true;
    }
    if (include.user) {
      prismaInclude.sinh_vien = { include: { nguoi_dung: true, lop: true } };
    }

    // id là UUID (String), không parse
    const item = await prisma.dangKyHoatDong.findUnique({
      where: { id: String(id) }, // UUID - giữ nguyên string
      include: prismaInclude
    });

    if (!item) return null;

    return this.normalize(item as unknown as Record<string, unknown>) as T;
  }

  async findByUserAndActivity(userId: string, activityId: string): Promise<DangKyHoatDong | null> {
    // sv_id và hd_id là UUID (String), không parse
    const item = await prisma.dangKyHoatDong.findFirst({
      where: {
        sv_id: String(userId), // UUID - giữ nguyên string
        hd_id: String(activityId) // UUID - giữ nguyên string
      }
    });
    return item || null;
  }

  async create<T = unknown>(data: CreateRegistrationData): Promise<T> {
    // sv_id và hd_id là UUID (String), không parse
    // Map status nếu có
    let trangThaiDk: RegistrationStatusVN = data.trang_thai_dk || 'cho_duyet';
    if (data.status && !data.trang_thai_dk) {
      trangThaiDk = STATUS_MAP_EN_TO_VN[data.status as RegistrationStatusEN] || 'cho_duyet';
    }
    
    // Validate required fields
    const svId = String(data.userId || data.sv_id);
    const hdId = String(data.activityId || data.hd_id);
    
    if (!svId || svId === 'undefined' || svId === 'null') {
      throw new ValidationError('sv_id (userId) is required and must be a valid UUID');
    }
    if (!hdId || hdId === 'undefined' || hdId === 'null') {
      throw new ValidationError('hd_id (activityId) is required and must be a valid UUID');
    }
    
    const created = await prisma.dangKyHoatDong.create({
      data: {
        sv_id: svId, // UUID - giữ nguyên string
        hd_id: hdId, // UUID - giữ nguyên string
        trang_thai_dk: trangThaiDk,
        ngay_dang_ky: data.ngay_dang_ky || new Date(),
        ...(data.note && { ly_do_dk: data.note }), // note -> ly_do_dk
        ...(data.ly_do && { ly_do_dk: data.ly_do }), // ly_do -> ly_do_dk
        ...(data.ghi_chu && { ghi_chu: data.ghi_chu })
      },
      include: {
        hoat_dong: true,
        sinh_vien: { include: { nguoi_dung: true, lop: true } }
      }
    });

    return this.normalize(created as unknown as Record<string, unknown>) as T;
  }

  async update<T = unknown>(id: string, data: UpdateRegistrationData): Promise<T> {
    const updateData: Prisma.DangKyHoatDongUpdateInput = {};
    
    if (data.status !== undefined) {
      const status = data.status as RegistrationStatusEN;
      updateData.trang_thai_dk = STATUS_MAP_EN_TO_VN[status] || data.status as RegistrationStatusVN;
    }
    if (data.trang_thai_dk !== undefined) {
      updateData.trang_thai_dk = data.trang_thai_dk;
    }
    if (data.ly_do !== undefined) {
      updateData.ly_do_tu_choi = data.ly_do;
    }
    if (data.ly_do_tu_choi !== undefined) {
      updateData.ly_do_tu_choi = data.ly_do_tu_choi;
    }
    if (data.ngay_duyet !== undefined) {
      updateData.ngay_duyet = data.ngay_duyet;
    }
    if (data.ngay_tham_gia !== undefined) {
      (updateData as Record<string, unknown>).ngay_tham_gia = data.ngay_tham_gia;
    }
    // Lưu người duyệt khi approve/reject
    if (data.nguoi_duyet_id !== undefined) {
      updateData.nguoi_duyet = { connect: { id: data.nguoi_duyet_id } };
    }
    if (data.note !== undefined) {
      updateData.ghi_chu = data.note;
    }

    // id là UUID (String), không parse
    const updated = await prisma.dangKyHoatDong.update({
      where: { id: String(id) }, // UUID - giữ nguyên string
      data: updateData,
      include: {
        hoat_dong: true,
        sinh_vien: { include: { nguoi_dung: true, lop: true } }
      }
    });

    return this.normalize(updated as unknown as Record<string, unknown>) as T;
  }

  async delete(id: string): Promise<DangKyHoatDong> {
    // id là UUID (String), không parse
    return prisma.dangKyHoatDong.delete({
      where: { id: String(id) } // UUID - giữ nguyên string
    });
  }

  async bulkApprove(ids: string[], approverId?: string): Promise<BulkUpdateResult> {
    // id là UUID (String), không parse
    const result = await prisma.dangKyHoatDong.updateMany({
      where: {
        id: { in: ids.map(id => String(id)) } // UUID - giữ nguyên string
      },
      data: {
        trang_thai_dk: 'da_duyet',
        ngay_duyet: new Date(),
        nguoi_duyet_id: approverId || null
      }
    });
    return { count: result.count };
  }

  async bulkReject(ids: string[], reason?: string, approverId?: string): Promise<BulkUpdateResult> {
    // id là UUID (String), không parse
    const result = await prisma.dangKyHoatDong.updateMany({
      where: {
        id: { in: ids.map(id => String(id)) } // UUID - giữ nguyên string
      },
      data: {
        trang_thai_dk: 'tu_choi',
        ngay_duyet: new Date(),
        nguoi_duyet_id: approverId || null,
        ...(reason && { ly_do_tu_choi: reason })
      }
    });
    return { count: result.count };
  }

  async checkIn<T = unknown>(id: string, checkInTime?: Date, audit?: { actorId?: string | null; requestId?: string | null; ipAddress?: string | null; userAgent?: string | null }): Promise<T> {
    // id là UUID (String), không parse
    const updated = await prisma.$transaction(async (tx) => {
      const registration = await tx.dangKyHoatDong.update({
        where: { id: String(id) }, // UUID - giữ nguyên string
        data: {
          trang_thai_dk: 'da_tham_gia',
          // Note: ngay_tham_gia is not in schema, store in ghi_chu or another field
        },
        include: {
          hoat_dong: true,
          sinh_vien: { include: { nguoi_dung: true, lop: true } }
        }
      });

      await auditIntegrityService.appendEvent(tx, {
        chainScope: 'registration',
        entityType: 'dang_ky_hoat_dong',
        entityId: registration.id,
        action: 'registration_marked_attended_manual',
        actorId: audit?.actorId || null,
        requestId: audit?.requestId || null,
        ipAddress: audit?.ipAddress || null,
        userAgent: audit?.userAgent || null,
        payload: {
          registrationId: registration.id,
          sinhVienId: registration.sv_id,
          hoatDongId: registration.hd_id,
          trangThaiDk: registration.trang_thai_dk,
          checkInTime: checkInTime || null
        }
      });

      return registration;
    });

    return this.normalize(updated as unknown as Record<string, unknown>) as T;
  }

  async findByUser(userId: string, filters: UserRegistrationFilters = {}): Promise<DangKyHoatDong[]> {
    // sv_id là UUID (String), không parse
    const where: Prisma.DangKyHoatDongWhereInput = {
      sv_id: String(userId) // UUID - giữ nguyên string
    };

    if (filters.status) {
      const status = filters.status as RegistrationStatusEN;
      where.trang_thai_dk = STATUS_MAP_EN_TO_VN[status] || filters.status as RegistrationStatusVN;
    }

    return prisma.dangKyHoatDong.findMany({
      where,
      include: {
        hoat_dong: true
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });
  }

  async getActivityStats(activityId: string): Promise<ActivityStats> {
    // hd_id là UUID (String), không parse
    const stats = await prisma.dangKyHoatDong.groupBy({
      by: ['trang_thai_dk'],
      where: {
        hd_id: String(activityId) // UUID - giữ nguyên string
      },
      _count: {
        id: true
      }
    });

    const result: ActivityStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      attended: 0
    };

    stats.forEach(stat => {
      result.total += stat._count.id;
      switch (stat.trang_thai_dk) {
        case 'cho_duyet':
          result.pending = stat._count.id;
          break;
        case 'da_duyet':
          result.approved = stat._count.id;
          break;
        case 'tu_choi':
          result.rejected = stat._count.id;
          break;
        case 'da_tham_gia':
          result.attended = stat._count.id;
          break;
      }
    });

    return result;
  }
}

// Export singleton instance
const registrationsRepository = new RegistrationsRepository();
export { registrationsRepository, RegistrationsRepository };
export default registrationsRepository;
module.exports = registrationsRepository;
