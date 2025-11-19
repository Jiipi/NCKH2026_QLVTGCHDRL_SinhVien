/**
 * Teachers Service - Business Logic for Teacher Operations
 */

const teachersRepo = require('./teachers.repo');
const activitiesService = require('../activities/activities.service');
const registrationsService = require('../registrations/registrations.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../app/errors/AppError');
const { buildScope } = require('../../app/scopes/scopeBuilder');

const getUserId = (user) => user?.sub || user?.id;

const teachersService = {
  /**
   * Get teacher dashboard data (V1 compatible)
   * @param {Object} user - User object with id and role
   * @param {string} semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   */
  async getDashboard(user, semester = null, classId = null) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Use user.sub (from JWT) or user.id (from middleware)
    const userId = user.sub || user.id;

    const [stats, classes, pendingActivities, pendingRegistrations, students] = await Promise.all([
      teachersRepo.getDashboardStats(userId, semester, classId),
      teachersRepo.getTeacherClasses(userId),
      teachersRepo.getPendingActivitiesList(userId, semester, 5, classId),
      registrationsService.list(user, { status: 'PENDING' }, { page: 1, limit: 5 }),
      teachersRepo.getTeacherStudents(userId, { classId, semester })
    ]);

    return {
      summary: stats,
      pendingActivities,
      pendingRegistrations: pendingRegistrations.data || [],
      classes: classes.map(c => ({
        id: c.id,
        ten_lop: c.ten_lop
      })),
      students: students.map(s => {
        const totalPoints = s.dang_ky_hd?.reduce((sum, dk) => {
          const points = parseFloat(dk.hoat_dong?.diem_rl || 0);
          return sum + points;
        }, 0) || 0;
        
        return {
          id: s.nguoi_dung?.id,
          ho_ten: s.nguoi_dung?.ho_ten,
          avatar: s.nguoi_dung?.anh_dai_dien,
          mssv: s.mssv,
          lop: s.lop?.ten_lop,
          diem_rl: totalPoints
        };
      })
    };
  },

  /**
   * Get teacher's classes
   */
  async getClasses(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Include shape must match Prisma schema. Use counts only to avoid invalid relation names.
    const userId = getUserId(user);
    return await teachersRepo.getTeacherClasses(userId);
  },

  /**
   * Get students in teacher's classes
   */
  async getStudents(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const userId = getUserId(user);
    const students = await teachersRepo.getTeacherStudents(userId, filters);

    // Remove sensitive data
    students.forEach(s => delete s.password);

    return students;
  },

  /**
   * Get pending activities from teacher's classes
   */
  async getPendingActivities(user, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Build scope for teacher (only activities from their classes)
    const scope = await buildScope('activities', user);

    // Extract semester from pagination object, default limit to 100
    const { semester, page = 1, limit = 100 } = pagination;
    
    const listFilters = {
      trangThai: 'cho_duyet',
      scope: { activityFilter: scope }
    };
    
    // Add semester filter if provided
    if (semester) {
      listFilters.semester = semester;
    }

    // Use activities service list(filters, user)
    return await activitiesService.list({
      ...listFilters,
      page,
      limit
    }, user);
  },

  /**
   * Get activity history
   */
  async getActivityHistory(user, filters = {}, pagination = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    // Default limit to 100 for teacher pages
    const { page = 1, limit = 100 } = pagination;

    // Build scope for teacher (only activities from their classes)
    const scope = await buildScope('activities', user);
    
    // Get all activities for teacher (pending + approved + rejected)
    // Then filter client-side or let activitiesService handle it
    const listFilters = {};
    
    // If specifically filtering one status
    if (filters && typeof filters.status === 'string' && ['cho_duyet', 'da_duyet', 'tu_choi'].includes(filters.status)) {
      listFilters.trangThai = filters.status;
    }
    // Otherwise, get all (no filter on trangThai)
    
    if (filters && typeof filters.semester === 'string' && filters.semester) {
      listFilters.semester = filters.semester; // e.g., hoc_ky_1-2025
    }

    // Apply scope filter
    listFilters.scope = { activityFilter: scope };

    return await activitiesService.list({
      ...listFilters,
      page,
      limit
    }, user);
  },

  /**
   * Approve activity
   */
  async approveActivity(activityId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt hoạt động');
    }

    // V1 behavior: Teachers can approve ANY activity, not just their class students
    // No hasAccessToActivity() check needed here
    // Permission check happens via RBAC middleware in routes

    return await activitiesService.approve(activityId, user);
  },

  /**
   * Reject activity
   */
  async rejectActivity(activityId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối hoạt động');
    }

    // V1 behavior: Teachers can reject ANY activity, not just their class students
    // No hasAccessToActivity() check needed here
    // Permission check happens via RBAC middleware in routes

    return await activitiesService.reject(activityId, reason, user);
  },

  /**
   * Get all registrations for teacher's classes
   */
  async getAllRegistrations(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { status, semester, classId } = filters;
    
    // Use user.sub (from JWT) or user.id (from middleware)
    const userId = user.sub || user.id;
    
    console.log('[getAllRegistrations] user:', userId, 'filters:', filters);
    
    // Get teacher's classes
    let classes = await teachersRepo.getTeacherClasses(userId);
    console.log('[getAllRegistrations] Found classes:', classes.length);
    
    // Filter by specific class if provided
    if (classId) {
      classes = classes.filter(c => String(c.id) === String(classId));
      console.log('[getAllRegistrations] Filtered to class:', classId, 'found:', classes.length);
    }
    
    if (!classes || classes.length === 0) {
      console.log('[getAllRegistrations] No classes found for teacher');
      return [];
    }
    
    const classIds = classes.map(c => c.id);
    console.log('[getAllRegistrations] Class IDs:', classIds);
    
    // Get all registrations from students in teacher's classes
    const registrations = await teachersRepo.getClassRegistrations(classIds, {
      status,
      semester
    });
    
    console.log('[getAllRegistrations] Found registrations:', registrations.length);
    
    return registrations;
  },

  /**
   * Get pending registrations
   */
  async getPendingRegistrations(user, options = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được truy cập');
    }

    const { page, limit, classId, semester, status } = options;
    
    // If classId or semester provided, use getAllRegistrations with filters
    if (classId || semester) {
      const registrations = await this.getAllRegistrations(user, {
        status: status || 'cho_duyet',
        semester,
        classId
      });
      
      // Apply pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const startIdx = (pageNum - 1) * limitNum;
      const endIdx = startIdx + limitNum;
      
      return {
        items: registrations.slice(startIdx, endIdx),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: registrations.length,
          totalPages: Math.ceil(registrations.length / limitNum)
        }
      };
    }
    
    // Use registrations service for default behavior
    return await registrationsService.list(user, {
      status: 'PENDING'
    }, { page, limit });
  },

  /**
   * Approve registration
   */
  async approveRegistration(regId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.approve(regId, user);
  },

  /**
   * Reject registration
   */
  async rejectRegistration(regId, reason, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được từ chối đăng ký');
    }

    return await registrationsService.reject(regId, reason, user);
  },

  /**
   * Bulk approve registrations
   */
  async bulkApproveRegistrations(regIds, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được duyệt đăng ký');
    }

    return await registrationsService.bulkApprove(regIds, user);
  },

  /**
   * Get class statistics
   */
  async getClassStatistics(className, semesterId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem thống kê');
    }

    // Check access
    const userId = getUserId(user);
    const hasAccess = await teachersRepo.hasAccessToClass(userId, className);
    if (!hasAccess) {
      throw new ForbiddenError('Bạn không có quyền xem lớp này');
    }

    return await teachersRepo.getClassStats(className, semesterId);
  },

  /**
   * Export students list
   */
  async exportStudents(user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được export');
    }

    const userId = getUserId(user);
    return await teachersRepo.exportStudents(userId);
  },

  /**
   * Create a single student in teacher's class
   */
  async createStudent(user, payload) {
    if (user.role !== 'GIANG_VIEN' && user.role !== 'GIANG_VIÊN') {
      throw new ForbiddenError('Chỉ giảng viên mới được tạo sinh viên');
    }
    const userId = getUserId(user);
    return await teachersRepo.createStudent(userId, payload);
  },

  /**
   * Get statistics for reports
   */
  async getReportStatistics(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem báo cáo');
    }

    const userId = getUserId(user);
    const classNames = await teachersRepo.getTeacherClassNames(userId);

    // Get aggregated stats for all teacher's classes
    const stats = await Promise.all(
      classNames.map(className => 
        teachersRepo.getClassStats(className, filters.semesterId)
      )
    );

    // Get ALL registrations for activity counting
    const allRegistrations = await teachersRepo.getTeacherClassRegistrationsForChartsAll(
      userId, 
      filters.semesterId
    );

    // Get PARTICIPATED registrations for points/participation calculations
    const participatedRegistrations = await teachersRepo.getTeacherClassRegistrationsForReports(
      userId, 
      filters.semesterId
    );

    // Count total approved activities (strict semester filter)
    const totalActivities = await teachersRepo.countActivitiesForTeacherClassesStrict(
      userId,
      filters.semesterId
    );

    const totalStudents = stats.reduce((sum, s) => sum + s.totalStudents, 0);
    const approvedActivities = stats.reduce((sum, s) => sum + s.approvedActivities, 0);
    const approvedRegistrations = stats.reduce((sum, s) => sum + s.approvedRegistrations, 0);

    // Calculate average points from PARTICIPATED registrations only
    const studentPointsMap = new Map();
    participatedRegistrations.forEach(r => {
      const svId = r.sv_id;
      const points = Number(r.hoat_dong?.diem_rl || 0);
      studentPointsMap.set(svId, (studentPointsMap.get(svId) || 0) + points);
    });
    
    const totalPoints = Array.from(studentPointsMap.values()).reduce((sum, pts) => sum + pts, 0);
    const avgPoints = totalStudents > 0 ? totalPoints / totalStudents : 0;
    
    // Participation rate: students with PARTICIPATED registrations / total students
    const uniqueParticipants = new Set(participatedRegistrations.map(r => r.sv_id)).size;
    const participationRate = totalStudents > 0 ? (uniqueParticipants / totalStudents) * 100 : 0;

    // Calculate chart data using helper methods - pass both types of registrations
    const monthlyActivities = this._calculateMonthlyActivities(allRegistrations, participatedRegistrations);
    const activityTypes = this._calculateActivityTypes(allRegistrations);
    const topStudents = this._calculateTopStudents(participatedRegistrations);
    const pointsDistribution = this._calculatePointsDistribution(participatedRegistrations, totalStudents);
    const attendanceRate = this._calculateAttendanceRate(participatedRegistrations, totalStudents);

    return {
      classNames,
      stats,
      summary: {
        totalStudents,
        totalActivities,
        approvedActivities,
        totalRegistrations: stats.reduce((sum, s) => sum + s.totalRegistrations, 0),
        approvedRegistrations
      },
      overview: {
        totalStudents,
        totalActivities,
        avgPoints: Math.round(avgPoints * 10) / 10,
        participationRate: Math.round(participationRate * 10) / 10
      },
      monthlyActivities,
      pointsDistribution,
      activityTypes,
      topStudents,
      attendanceRate
    };
  }
  ,

  // Helper methods for chart calculations (similar to monitor service)
  _calculateMonthlyActivities(regs, participatedRegs = []) {
    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthlyActivityIds = new Map();
    const monthlyParticipantSets = new Map();
    
    // Count activities from all registrations (regs)
    regs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = monthKey(d);
      if (!monthlyActivityIds.has(key)) monthlyActivityIds.set(key, new Set());
      if (r.hoat_dong?.id) monthlyActivityIds.get(key).add(r.hoat_dong.id);
    });
    
    // Count participants from participated registrations only
    participatedRegs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = monthKey(d);
      if (!monthlyParticipantSets.has(key)) monthlyParticipantSets.set(key, new Set());
      monthlyParticipantSets.get(key).add(r.sv_id);
    });
    
    return Array.from(monthlyActivityIds.keys()).sort().map(key => {
      const [year, mm] = key.split('-');
      const monthNumber = parseInt(mm, 10);
      const label = `T${monthNumber}/${year}`;
      const activities = monthlyActivityIds.get(key)?.size || 0;
      const participants = monthlyParticipantSets.get(key)?.size || 0;
      return { month: label, activities, participants };
    });
  }
  ,

  _calculateActivityTypes(regs) {
    const activitiesById = new Map();
    regs.forEach(r => {
      const id = r.hoat_dong?.id;
      if (!id || activitiesById.has(id)) return;
      activitiesById.set(id, {
        typeName: r.hoat_dong?.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: Number(r.hoat_dong?.diem_rl || 0)
      });
    });
    
    const typeAgg = new Map();
    activitiesById.forEach(({ typeName, diem_rl }) => {
      const cur = typeAgg.get(typeName) || { name: typeName, count: 0, points: 0 };
      cur.count += 1;
      cur.points += diem_rl;
      typeAgg.set(typeName, cur);
    });
    
    return Array.from(typeAgg.values());
  }
  ,

  _calculateTopStudents(regs) {
    const studentPoints = new Map();
    regs.forEach(r => {
      const id = r.sv_id;
      const cur = studentPoints.get(id) || { 
        id, 
        name: r.sinh_vien?.nguoi_dung?.ho_ten || '', 
        mssv: r.sinh_vien?.mssv || '', 
        points: 0, 
        activities: 0 
      };
      cur.points += Number(r.hoat_dong?.diem_rl || 0);
      cur.activities += 1;
      studentPoints.set(id, cur);
    });
    
    return Array.from(studentPoints.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((s, idx) => ({ rank: idx + 1, ...s }));
  }
  ,

  _calculatePointsDistribution(regs, totalStudents) {
    const studentPoints = new Map();
    regs.forEach(r => {
      const id = r.sv_id;
      const cur = studentPoints.get(id) || { points: 0 };
      cur.points += Number(r.hoat_dong?.diem_rl || 0);
      studentPoints.set(id, cur);
    });

    const bins = [
      { range: '0-49', min: 0, max: 49 },
      { range: '50-64', min: 50, max: 64 },
      { range: '65-79', min: 65, max: 79 },
      { range: '80-89', min: 80, max: 89 },
      { range: '90-100', min: 90, max: 100 }
    ];

    const binCounts = bins.map(() => 0);
    const studentsWithPoints = Array.from(studentPoints.values());
    studentsWithPoints.forEach(s => {
      const p = Math.max(0, Math.min(100, Math.round(Number(s.points || 0))));
      const idx = bins.findIndex(b => p >= b.min && p <= b.max);
      if (idx >= 0) binCounts[idx] += 1;
    });

    // Count participants from participated registrations
    const participantsCount = new Set(regs.map(r => r.sv_id)).size;
    const nonParticipants = Math.max(0, totalStudents - participantsCount);
    binCounts[0] += nonParticipants;

    return bins.map((b, i) => ({
      range: b.range,
      count: binCounts[i],
      name: b.range,
      value: binCounts[i],
      percentage: totalStudents > 0 ? Math.round((binCounts[i] / totalStudents) * 100) : 0
    }));
  }
  ,

  _calculateAttendanceRate(regs, totalStudents) {
    // Group by month and calculate attendance rate
    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthlyParticipants = new Map();
    
    regs.forEach(r => {
      const d = r.ngay_dang_ky ? new Date(r.ngay_dang_ky) : new Date();
      const key = monthKey(d);
      if (!monthlyParticipants.has(key)) monthlyParticipants.set(key, new Set());
      monthlyParticipants.get(key).add(r.sv_id);
    });
    
    return Array.from(monthlyParticipants.keys()).sort().map(key => {
      const [year, mm] = key.split('-');
      const monthNumber = parseInt(mm, 10);
      const label = `T${monthNumber}/${year}`;
      const rate = totalStudents > 0 
        ? Math.round((monthlyParticipants.get(key).size / totalStudents) * 100) 
        : 0;
      return { month: label, rate };
    });
  }
  ,

  /**
   * Assign class monitor (teacher only)
   * @param {string} classId - Lop.id
   * @param {string} studentId - SinhVien.id
   * @param {Object} user - Auth user
   */
  async assignClassMonitor(classId, studentId, user) {
    if (user.role !== 'GIANG_VIÊN' && user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được gán lớp trưởng');
    }

    const teacherId = getUserId(user);
    if (!classId || !studentId) {
      throw new ValidationError('Thiếu classId hoặc sinh_vien_id');
    }

    const result = await teachersRepo.assignClassMonitor(String(teacherId), String(classId), String(studentId));
    return result;
  }
};

module.exports = teachersService;





