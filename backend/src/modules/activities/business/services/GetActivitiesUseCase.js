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
    const where = await this.buildWhereClause(dto, user);
    const options = this.buildQueryOptions(dto);

    const result = await this.activityRepository.findMany(where, options);

    // Enrich activities with registration status for students
    if (user && (user.role === 'SINH_VIEN' || user.role === 'LOP_TRUONG') && result.items && result.items.length > 0) {
      result.items = await this.enrichActivitiesWithRegistrations(result.items, user.sub, user.role);
    }

    return result;
  }

  async buildWhereClause(dto, user) {
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

    // Filter by status - cho phép filter thêm (và override scope nếu cần)
    if (dto.status) {
      where.trang_thai = String(dto.status);
    }

    // Filter by time-based status (chỉ dùng cho các status đặc biệt open/soon/closed)
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
        // Data đã được chuẩn hóa sang năm đơn, dùng exact match
        where.nam_hoc = parsed.year;
      }
    }

    /**
     * Admin - filter theo lớp (tab "Theo lớp" trên màn admin activities)
     * ---------------------------------------------------------------
     * - Frontend gửi lop_id / classId khi scopeTab === 'class'.
     * - Định nghĩa mới: hoạt động thuộc lớp = hoat_dong.lop_id = classId,
     *   không quan tâm người tạo hay đăng ký.
     * - Luôn filter theo lop_id, cộng thêm hoc_ky/nam_hoc nếu có.
     * - Nếu admin không chọn status cụ thể, auto lọc da_duyet + ket_thuc.
     */
    if (dto.classId && user && user.role === 'ADMIN') {
      // Lọc theo lớp trực tiếp trên bảng HoatDong
      where.lop_id = String(dto.classId);

      // Nếu admin không chọn status cụ thể, tự động giới hạn về da_duyet + ket_thuc
      if (!dto.status && !where.trang_thai) {
        where.trang_thai = { in: ['da_duyet', 'ket_thuc'] };
      }
    }

    return where;
  }

  buildQueryOptions(dto) {
    // Handle 'all' limit - return undefined to fetch all records
    let effectiveLimit;
    if (dto.limit === 'all' || dto.limit === undefined) {
      effectiveLimit = undefined; // No limit - fetch all
    } else {
      const parsed = parseInt(dto.limit);
      effectiveLimit = isNaN(parsed) ? 10 : parsed;
    }
    
    const effectivePage = effectiveLimit === undefined ? 1 : parseInt(dto.page) || 1;

    return {
      page: effectivePage,
      limit: effectiveLimit,
      sort: dto.sort || 'ngay_cap_nhat',
      order: dto.order || 'desc'
    };
  }

  async enrichActivitiesWithRegistrations(activities, userId, userRole) {
    try {
      const student = await this.activityRepository.findStudentByUserId(userId);

      if (!student) {
        return activities;
      }

      const activityIds = activities.map(a => a.id).filter(Boolean);
      if (activityIds.length === 0) return activities;

      const registrations = await this.activityRepository.findRegistrationsByStudent(student.id, activityIds);

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

        const allClassStudents = await this.activityRepository.findStudentsByClass(lopId);
        classCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean);

        const lop = await this.activityRepository.findClassById(lopId);
        if (lop?.chu_nhiem) {
          classCreators.push(lop.chu_nhiem);
        }

        classRegistrationCounts = await this.activityRepository.countRegistrationsByClass(activityIds, lopId);
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

