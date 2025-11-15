/**
 * Activities Service
 * Business logic layer
 * - Xử lý nghiệp vụ (normalize semester, validate dates, etc.)
 * - Apply scope
 * - Check permissions
 */

const activitiesRepo = require('./activities.repo');
const { buildScope, canAccessItem } = require('../../app/scopes/scopeBuilder');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../app/errors/AppError');
const { normalizeRole } = require('../../core/utils/roleHelper');
const { determineSemesterFromDate } = require('../../core/utils/semester');
const crypto = require('crypto');

class ActivitiesService {
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
    
    // Semester filter
    if (semester) {
      const semesterInfo = this.parseSemester(semester);
      if (semesterInfo.hoc_ky && semesterInfo.nam_hoc) {
        where.hoc_ky = semesterInfo.hoc_ky;
        where.nam_hoc = semesterInfo.nam_hoc;
        console.log('✅ Applied semester filter:', { 
          semester, 
          parsed: semesterInfo,
          filter: { hoc_ky: semesterInfo.hoc_ky, nam_hoc: semesterInfo.nam_hoc }
        });
      } else {
        console.warn('⚠️ Failed to parse semester:', semester, 'parsed:', semesterInfo);
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
      const enriched = await this.enrichActivitiesWithRegistrations(result.items, user.sub, user.role);
      console.log('✅ Enriched activities:', { count: enriched.length });
      result.items = enriched;
    }
    
    return result;
  }
  
  /**
   * Enrich activities with student's registration status
   * For LOP_TRUONG: also add has_class_registrations, class_relation, registrationCount
   */
  async enrichActivitiesWithRegistrations(activities, userId, userRole) {
    const { prisma } = require('../../infrastructure/prisma/client');
    
    try {
      // Get student ID from user ID
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { id: true, lop_id: true }
      });
      
      if (!student) {
        return activities;
      }
      
      // Get all activity IDs
      const activityIds = activities.map(a => a.id).filter(Boolean);
      if (activityIds.length === 0) return activities;
      
      // Get registrations for this student and these activities
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
      
      // Create lookup map
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
        
        // Get all class students (for is_class_activity check)
        const allClassStudents = await prisma.sinhVien.findMany({
          where: { lop_id: lopId },
          select: { nguoi_dung_id: true }
        });
        classCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean);
        
        // Get homeroom teacher
        const lop = await prisma.lop.findUnique({
          where: { id: lopId },
          select: { chu_nhiem: true }
        });
        if (lop?.chu_nhiem) {
          classCreators.push(lop.chu_nhiem);
        }
        
        // Count registrations of students in this class for each activity
        const grouped = await prisma.dangKyHoatDong.groupBy({
          by: ['hd_id'],
          where: {
            hd_id: { in: activityIds },
            sinh_vien: { lop_id: lopId },
            trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] }
          },
          _count: { _all: true }
        }).catch(async () => {
          // Fallback: manual count
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
      
      // Enrich activities
      return activities.map(activity => {
        const regInfo = registrationMap.get(activity.id);
        
        // For LOP_TRUONG: calculate class relation
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
          is_class_activity: true,  // All activities in system are class-related
          // LOP_TRUONG additional fields (V1 compatibility)
          ...(userRole === 'LOP_TRUONG' ? {
            has_class_registrations: hasClassRegistrations,
            class_relation: classRelation,
            registrationCount: registrationCount
          } : {})
        };
      });
    } catch (error) {
      console.error('Error enriching activities with registrations:', error);
      // Return original activities if enrichment fails
      return activities;
    }
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
    return this.enrichActivity(activity, user);
  }
  
  /**
   * Create new activity
   */
  async create(data, user) {
    // Normalize and validate
    const normalized = this.normalizeActivityData(data);
    
    // Validate dates
    this.validateDates(normalized);
    
    // Auto-infer semester if missing
    if (!normalized.hoc_ky || !normalized.nam_hoc) {
      const semesterInfo = determineSemesterFromDate(new Date(normalized.ngay_bd));
      normalized.hoc_ky = normalized.hoc_ky || `hoc_ky_${semesterInfo.semester === 1 ? '1' : '2'}`;
      normalized.nam_hoc = normalized.nam_hoc || `${semesterInfo.year}-${semesterInfo.year + 1}`;
    }
    
    // Set creator
    normalized.nguoi_tao_id = user.sub;
    
    // Set initial status based on role (V1 compat logic)
    // GIANG_VIEN and ADMIN activities are auto-approved
    // LOP_TRUONG activities need approval
    const role = String(user.role || '').toUpperCase();
    normalized.trang_thai = normalized.trang_thai || 
      (role === 'GIANG_VIEN' || role === 'ADMIN' ? 'da_duyet' : 'cho_duyet');
    
    // Generate QR token (field name is 'qr' in Prisma schema)
    normalized.qr = this.generateQRToken();
    
    return activitiesRepo.create(normalized);
  }
  
  /**
   * Update activity (with ownership check)
   */
  async update(id, data, user, scope) {
    // Check if activity exists in scope
    const existing = await activitiesRepo.findById(id, scope);
    
    if (!existing) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền sửa hoạt động này');
    }
    
    // Normalize data
    const normalized = this.normalizeActivityData(data);
    
    // Validate dates if provided
    if (normalized.ngay_bd || normalized.ngay_kt || normalized.han_dk) {
      this.validateDates({
        ngay_bd: normalized.ngay_bd || existing.ngay_bd,
        ngay_kt: normalized.ngay_kt || existing.ngay_kt,
        han_dk: normalized.han_dk || existing.han_dk
      });
    }
    
    // Don't allow changing creator
    delete normalized.nguoi_tao_id;
    
    return activitiesRepo.update(id, normalized);
  }
  
  /**
   * Delete activity (with ownership check)
   */
  async delete(id, user, scope) {
    // Check if activity exists in scope
    const existing = await activitiesRepo.findById(id, scope);
    
    if (!existing) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    // Check ownership
    const canAccess = await canAccessItem('activities', id, user);
    if (!canAccess) {
      throw new ForbiddenError('Bạn không có quyền xóa hoạt động này');
    }
    
    // Check if activity has registrations
    const stats = await activitiesRepo.getRegistrationStats(id);
    if (stats.total > 0) {
      throw new ValidationError('Không thể xóa hoạt động đã có người đăng ký');
    }
    
    return activitiesRepo.delete(id);
  }
  
  /**
   * Approve activity (GIANG_VIEN, ADMIN only)
   */
  async approve(id, user) {
    const activity = await activitiesRepo.findById(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    if (activity.trang_thai === 'da_duyet') {
      throw new ValidationError('Hoạt động đã được duyệt');
    }
    
    // Schema doesn't have nguoi_duyet_id/ngay_duyet fields
    // Only update trang_thai (ngay_cap_nhat will auto-update via @updatedAt)
    return activitiesRepo.update(id, {
      trang_thai: 'da_duyet'
    });
  }
  
  /**
   * Reject activity (GIANG_VIEN, ADMIN only)
   */
  async reject(id, reason, user) {
    const activity = await activitiesRepo.findById(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    // Schema doesn't have nguoi_duyet_id/ngay_duyet fields
    // Only update trang_thai and ly_do_tu_choi (ngay_cap_nhat will auto-update via @updatedAt)
    return activitiesRepo.update(id, {
      trang_thai: 'tu_choi',
      ly_do_tu_choi: reason
    });
  }
  
  /**
   * Get activity details with registrations
   */
  async getDetails(id, user) {
    const activity = await activitiesRepo.findByIdWithDetails(id);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động', id);
    }
    
    return this.enrichActivity(activity, user);
  }
  
  // ==================== HELPER METHODS ====================
  
  /**
   * Normalize activity data
   */
  normalizeActivityData(data) {
    const normalized = { ...data };
    
    // Normalize arrays
    if (normalized.hinh_anh) {
      normalized.hinh_anh = this.normalizeFileArray(normalized.hinh_anh);
    }
    if (normalized.tep_dinh_kem) {
      normalized.tep_dinh_kem = this.normalizeFileArray(normalized.tep_dinh_kem);
    }
    
    // Convert dates
    if (normalized.ngay_bd) normalized.ngay_bd = new Date(normalized.ngay_bd);
    if (normalized.ngay_kt) normalized.ngay_kt = new Date(normalized.ngay_kt);
    if (normalized.han_dk) normalized.han_dk = new Date(normalized.han_dk);
    
    return normalized;
  }
  
  /**
   * Normalize file array (handle URLs)
   */
  normalizeFileArray(value) {
    if (!Array.isArray(value)) return [];
    
    const seen = new Set();
    const result = [];
    
    for (const item of value) {
      let url = null;
      
      if (typeof item === 'string') {
        url = item;
      } else if (item && typeof item === 'object') {
        url = item.url || item.src || item.path;
      }
      
      if (url && typeof url === 'string') {
        // Normalize to /uploads/... format
        const idx = url.indexOf('/uploads/');
        const normalized = idx >= 0 ? url.slice(idx) : url;
        
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          result.push(normalized);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Validate activity dates
   */
  validateDates(data) {
    const { ngay_bd, ngay_kt, han_dk } = data;
    
    if (ngay_bd && ngay_kt && new Date(ngay_bd) >= new Date(ngay_kt)) {
      throw new ValidationError('Ngày kết thúc phải sau ngày bắt đầu');
    }
    
    if (ngay_bd && han_dk && new Date(han_dk) >= new Date(ngay_bd)) {
      throw new ValidationError('Hạn đăng ký phải trước ngày bắt đầu');
    }
  }
  
  /**
   * Parse semester string
   */
  parseSemester(semester) {
    const s = String(semester || '');
    // Accept both dash and underscore formats: hoc_ky_1-2025 and hoc_ky_1_2025
    const normalized = s.replace(/_(\d{4})$/, '-$1');
    const match = normalized.match(/^(hoc_ky_1|hoc_ky_2)-(\d{4})$/);
    if (!match) {
      try {
        console.warn('[Activities] parseSemester failed for input:', s);
      } catch (_) {}
      return {};
    }
    
    const hoc_ky = match[1];
    const year = parseInt(match[2]);
    const nam_hoc = hoc_ky === 'hoc_ky_1' 
      ? `${year}-${year + 1}` 
      : `${year - 1}-${year}`;
    
    return { hoc_ky, nam_hoc };
  }
  
  /**
   * Generate unique QR token
   */
  generateQRToken() {
    return crypto.randomBytes(16).toString('hex');
  }
  
  /**
   * Enrich activity with computed fields
   */
  enrichActivity(activity, user) {
    // Add user-specific flags
    // Handle null/undefined user safely
    const userRole = user ? normalizeRole(user.role) : null;
    const userId = user?.sub || null;
    
    const enriched = {
      ...activity,
      is_creator: userId ? (activity.nguoi_tao_id === userId) : false,
      can_edit: userId ? (activity.nguoi_tao_id === userId || ['ADMIN', 'GIANG_VIEN'].includes(userRole)) : false,
      can_delete: userRole ? ['ADMIN', 'GIANG_VIEN'].includes(userRole) : false
    };
    
    return enriched;
  }
}

module.exports = new ActivitiesService();





