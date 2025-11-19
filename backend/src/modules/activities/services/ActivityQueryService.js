/**
 * Activity Query Service
 * Handles querying and retrieving activities
 * Follows Single Responsibility Principle (SRP)
 */

const activitiesRepo = require('../activities.repo');
const { parseSemesterString } = require('../../../core/utils/semester');
const ActivityEnrichmentService = require('./ActivityEnrichmentService');

class ActivityQueryService {
  constructor() {
    this.enrichmentService = new ActivityEnrichmentService();
  }

  /**
   * List activities with filters and scope
   */
  async list(filters, user) {
    const { page, limit, sort, order, semester, q, loaiId, trangThai, status, from, to, scope, type, ...otherFilters } = filters;
    
    // Build where clause (exclude non-Prisma fields like 'type', 'search', etc.)
    const where = { ...otherFilters };
    // Remove any undefined or non-Prisma fields
    Object.keys(where).forEach(key => {
      if (where[key] === undefined || ['search', 'type'].includes(key)) {
        delete where[key];
      }
    });
    
    // Apply scope filter from middleware (class-based access control)
    if (scope && scope.activityFilter) {
      // Merge activityFilter from middleware (already handles role-based filtering)
      Object.assign(where, scope.activityFilter);
      console.log('✅ Applied activity scope filter:', JSON.stringify(scope.activityFilter));
      console.log('✅ User role:', user?.role, 'User ID:', user?.sub);
    } else {
      console.log('⚠️ No scope filter applied. Scope:', scope ? 'exists' : 'null', 'User role:', user?.role);
    }
    
    // Text search
    if (q) {
      where.ten_hd = { contains: String(q), mode: 'insensitive' };
    }
    
    // Filter by activity type (using 'type' from query)
    if (filters.type) {
      where.loai_hd_id = String(filters.type);
    }
    
    // Filter by status
    if (trangThai) {
      where.trang_thai = String(trangThai);
    }
    
    // Filter by time-based status
    const now = new Date();
    if (status === 'open') {
      // Đang mở đăng ký
      where.trang_thai = 'da_duyet';
      where.han_dk = { gte: now };
      where.ngay_bd = { gt: now };
    } else if (status === 'soon') {
      // Đang diễn ra
      where.trang_thai = 'da_duyet';
      where.ngay_bd = { lte: now };
      where.ngay_kt = { gte: now };
    } else if (status === 'closed') {
      // Đã kết thúc
      where.ngay_kt = { lt: now };
    }
    
    // Date range filter
    // Filter activities that start within the date range
    if (from || to) {
      const dateFilter = {};
      if (from) {
        // Set to start of day in local timezone
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        dateFilter.gte = fromDate;
      }
      if (to) {
        // Set to end of day in local timezone
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }
      if (Object.keys(dateFilter).length > 0) {
        where.ngay_bd = dateFilter;
      }
    }
    
    // Semester filter - simple single year format
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        where.hoc_ky = parsed.semester;
        where.nam_hoc = parsed.year;
        console.log('✅ Applied semester filter:', { semester, filter: { hoc_ky: parsed.semester, nam_hoc: parsed.year } });
      } else {
        console.warn('⚠️ Failed to parse semester:', semester);
      }
    } else {
      console.log('ℹ️ No semester filter applied');
    }
    
    // Merge with scope (lop_id filter based on role)
    // Scope is already in filters from middleware
    
    // Handle limit='all' case
    const effectiveLimit = limit === 'all' ? undefined : (parseInt(limit) || 10);
    const effectivePage = limit === 'all' ? 1 : (parseInt(page) || 1); // If limit='all', always use page 1
    
    const result = await activitiesRepo.findMany(where, {
      page: effectivePage,
      limit: effectiveLimit,
      sort,
      order
    });
    
    // Enrich activities with registration status for SINH_VIEN and LOP_TRUONG
    if (user && (user.role === 'SINH_VIEN' || user.role === 'LOP_TRUONG') && result.items && result.items.length > 0) {
      console.log('🎯 Enriching activities for role:', { role: user.role, userId: user.sub, itemsCount: result.items.length });
      const enriched = await this.enrichmentService.enrichActivitiesWithRegistrations(result.items, user.sub, user.role);
      console.log('✅ Enriched activities:', { count: enriched.length });
      result.items = enriched;
    }
    
    return result;
  }

  /**
   * Get activity by ID (with scope check)
   */
  async getById(id, scope, user) {
    // Build where clause with scope filter
    const where = {};
    
    // Apply scope filter from middleware (class-based access control)
    if (scope && scope.activityFilter) {
      // Merge activityFilter from middleware (already handles role-based filtering)
      Object.assign(where, scope.activityFilter);
    }
    
    const activity = await activitiesRepo.findById(id, where);
    
    if (!activity) {
      return null;
    }
    
    // Add computed fields
    return this.enrichmentService.enrichActivity(activity, user);
  }

  /**
   * Get activity details with registrations
   */
  async getDetails(id, user) {
    const { NotFoundError } = require('../../../core/errors/AppError');
    const activity = await activitiesRepo.findByIdWithDetails(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    return this.enrichmentService.enrichActivity(activity, user);
  }
}

module.exports = ActivityQueryService;

