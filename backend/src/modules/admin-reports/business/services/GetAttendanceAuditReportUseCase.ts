import type { Prisma } from '@prisma/client';
import type { IAdminReportsRepository } from '../interfaces/IAdminReportsRepository';

interface QueryParams {
  page?: string | number;
  limit?: string | number;
  from?: string;
  to?: string;
  action?: string;
  result?: string;
  reason?: string;
  activityId?: string;
  studentId?: string;
  actorId?: string;
  classId?: string;
  ip?: string;
  q?: string;
}

function parsePositiveInt(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

class GetAttendanceAuditReportUseCase {
  constructor(private readonly repository: IAdminReportsRepository) {}

  async execute(query: QueryParams, forcedClassId?: string) {
    const page = parsePositiveInt(query.page, 1, 10000);
    const limit = parsePositiveInt(query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const where: Prisma.NhatKyDiemDanhWhereInput = {};

    if (query.from || query.to) {
      where.thoi_gian = {};
      if (query.from) where.thoi_gian.gte = new Date(query.from);
      if (query.to) where.thoi_gian.lte = new Date(query.to);
    }

    if (query.action) where.hanh_dong = query.action;
    if (query.result) where.ket_qua = query.result;
    if (query.reason) where.ly_do = query.reason;
    if (query.activityId) where.hoat_dong_id = query.activityId;
    if (query.studentId) where.sinh_vien_id = query.studentId;
    if (query.actorId) where.nguoi_thuc_hien_id = query.actorId;
    if (query.ip) where.dia_chi_ip = query.ip;

    const classId = forcedClassId || query.classId;
    if (classId) {
      where.OR = [
        { sinh_vien: { lop_id: classId } },
        { hoat_dong: { lop_id: classId } }
      ];
    }

    if (query.q) {
      const searchFilter: Prisma.NhatKyDiemDanhWhereInput[] = [
        { ly_do: { contains: query.q, mode: 'insensitive' } },
        { dia_chi_ip: { equals: query.q } },
        { sinh_vien: { mssv: { contains: query.q, mode: 'insensitive' } } },
        { sinh_vien: { nguoi_dung: { ho_ten: { contains: query.q, mode: 'insensitive' } } } },
        { hoat_dong: { ten_hd: { contains: query.q, mode: 'insensitive' } } },
        { nguoi_thuc_hien: { ho_ten: { contains: query.q, mode: 'insensitive' } } }
      ];
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: searchFilter }];
    }

    const [{ items, total }, summary] = await Promise.all([
      this.repository.findAttendanceAuditWithFilters(where, skip, limit),
      this.repository.getAttendanceAuditSummary(where)
    ]);

    return {
      items,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export default GetAttendanceAuditReportUseCase;
