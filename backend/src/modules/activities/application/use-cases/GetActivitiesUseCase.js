const GetActivitiesDto = require('../dto/GetActivitiesDto');
const { parseSemesterString } = require('../../../../core/utils/semester');

/**
 * GetActivitiesUseCase
 * Use case for retrieving paginated list of activities with filters
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivitiesUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(dto, user) {
    const where = this.buildWhereClause(dto);
    const options = this.buildQueryOptions(dto);

    const result = await this.activityRepository.findMany(where, options);

    // Enrich activities with registration status for students
    if (user && (user.role === 'SINH_VIEN' || user.role === 'LOP_TRUONG') && result.items && result.items.length > 0) {
      result.items = await this.enrichActivitiesWithRegistrations(result.items, user.sub, user.role);
    }

    return result;
  }

  buildWhereClause(dto) {
    const where = {};

    // Apply scope filter from middleware
    if (dto.scope && dto.scope.activityFilter) {
      Object.assign(where, dto.scope.activityFilter);
    }

    // Text search
    if (dto.search) {
      where.ten_hd = { contains: String(dto.search), mode: 'insensitive' };
    }

    // Filter by activity type
    if (dto.type) {
      where.loai_hd_id = String(dto.type);
    }

    // Filter by status
    if (dto.status) {
      where.trang_thai = String(dto.status);
    }

    // Filter by time-based status
    const now = new Date();
    if (dto.status === 'open') {
      where.trang_thai = 'da_duyet';
      where.han_dk = { gte: now };
      where.ngay_bd = { gt: now };
    } else if (dto.status === 'soon') {
      where.trang_thai = 'da_duyet';
      where.ngay_bd = { lte: now };
      where.ngay_kt = { gte: now };
    } else if (dto.status === 'closed') {
      where.ngay_kt = { lt: now };
    }

    // Date range filter
    if (dto.from || dto.to) {
      const dateFilter = {};
      if (dto.from) {
        const fromDate = new Date(dto.from);
        fromDate.setHours(0, 0, 0, 0);
        dateFilter.gte = fromDate;
      }
      if (dto.to) {
        const toDate = new Date(dto.to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }
      if (Object.keys(dateFilter).length > 0) {
        where.ngay_bd = dateFilter;
      }
    }

    // Semester filter
    if (dto.semester) {
      const parsed = parseSemesterString(dto.semester);
      if (parsed && parsed.year) {
        where.hoc_ky = parsed.semester;
        where.nam_hoc = parsed.year;
      }
    }

    return where;
  }

  buildQueryOptions(dto) {
    const effectiveLimit = dto.limit === 'all' ? undefined : parseInt(dto.limit) || 10;
    const effectivePage = effectiveLimit === undefined ? 1 : parseInt(dto.page) || 1;

    return {
      page: effectivePage,
      limit: effectiveLimit,
      sort: dto.sort || 'ngay_cap_nhat',
      order: dto.order || 'desc'
    };
  }

  async enrichActivitiesWithRegistrations(activities, userId, userRole) {
    const { prisma } = require('../../../../infrastructure/prisma/client');

    try {
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { id: true, lop_id: true }
      });

      if (!student) {
        return activities;
      }

      const activityIds = activities.map(a => a.id).filter(Boolean);
      if (activityIds.length === 0) return activities;

      const registrations = await prisma.dangKyHoatDong.findMany({
        where: {
          sv_id: student.id,
          hd_id: { in: activityIds }
        },
        select: {
          hd_id: true,
          trang_thai_dk: true,
          ngay_dang_ky: true
        }
      });

      const registrationMap = new Map();
      registrations.forEach(reg => {
        registrationMap.set(reg.hd_id, {
          registration_status: reg.trang_thai_dk,
          trang_thai_dk: reg.trang_thai_dk,
          is_registered: true,
          ngay_dang_ky: reg.ngay_dang_ky
        });
      });

      // For LOP_TRUONG: calculate class-related metrics
      let classCreators = [];
      let classRegistrationCounts = {};

      if (userRole === 'LOP_TRUONG' && student.lop_id) {
        const lopId = student.lop_id;

        const allClassStudents = await prisma.sinhVien.findMany({
          where: { lop_id: lopId },
          select: { nguoi_dung_id: true }
        });
        classCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean);

        const lop = await prisma.lop.findUnique({
          where: { id: lopId },
          select: { chu_nhiem: true }
        });
        if (lop?.chu_nhiem) {
          classCreators.push(lop.chu_nhiem);
        }

        const grouped = await prisma.dangKyHoatDong.groupBy({
          by: ['hd_id'],
          where: {
            hd_id: { in: activityIds },
            sinh_vien: { lop_id: lopId },
            trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
          },
          _count: { _all: true }
        }).catch(async () => {
          const rows = await prisma.dangKyHoatDong.findMany({
            where: {
              hd_id: { in: activityIds },
              sinh_vien: { lop_id: lopId },
              trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
            },
            select: { hd_id: true }
          });
          return rows.reduce((acc, r) => {
            acc[r.hd_id] = (acc[r.hd_id] || 0) + 1;
            return acc;
          }, {});
        });

        if (Array.isArray(grouped)) {
          classRegistrationCounts = Object.fromEntries(grouped.map(g => [g.hd_id, g._count?._all || 0]));
        } else {
          classRegistrationCounts = grouped || {};
        }
      }

      return activities.map(activity => {
        const regInfo = registrationMap.get(activity.id);

        let hasClassRegistrations = false;
        let classRelation = 'none';
        let registrationCount = 0;

        if (userRole === 'LOP_TRUONG') {
          const createdByClassOrHomeroom = classCreators.includes(activity.nguoi_tao_id);
          registrationCount = classRegistrationCounts[activity.id] || 0;
          hasClassRegistrations = registrationCount > 0;
          classRelation = createdByClassOrHomeroom ? 'owned' : (hasClassRegistrations ? 'participated' : 'none');
        }

        return {
          ...activity,
          is_registered: regInfo?.is_registered || false,
          registration_status: regInfo?.registration_status || null,
          trang_thai_dk: regInfo?.trang_thai_dk || null,
          ngay_dang_ky: regInfo?.ngay_dang_ky || null,
          is_class_activity: true,
          ...(userRole === 'LOP_TRUONG' ? {
            has_class_registrations: hasClassRegistrations,
            class_relation: classRelation,
            registrationCount: registrationCount
          } : {})
        };
      });
    } catch (error) {
      console.error('Error enriching activities with registrations:', error);
      return activities;
    }
  }
}

module.exports = GetActivitiesUseCase;

