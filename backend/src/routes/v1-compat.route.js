// src/routes/v1-compat.route.js
// V1 Compatibility Wrapper Routes
// These routes provide backward compatibility for frontend still calling V1 endpoints
// All routes proxy to V2 modules with appropriate data transformation

const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { isClassMonitor } = require('../middlewares/rbac');
const MonitorService = require('../modules/monitor/monitor.service');
const TeacherService = require('../modules/teachers/teachers.service');
const ActivitiesService = require('../modules/activities/activities.service');
const ActivityTypeService = require('../modules/activity-types/activity-types.service');
const NotificationsController = require('../controllers/notifications.controller');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logInfo } = require('../utils/logger');

// Helper to normalize image URLs
function normalizeImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return url; // Frontend will handle baseURL
  return url;
}

// ==================== /class/* ROUTES (Monitor/Class Leader) ====================
const classRouter = Router();

classRouter.get('/registrations/pending-count', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const count = await MonitorService.getPendingRegistrationsCount(classId);
    return sendResponse(res, 200, ApiResponse.success({ count }, 'Số đăng ký chờ duyệt'));
  } catch (error) {
    logInfo('V1 compat /class/registrations/pending-count error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy số lượng đăng ký chờ duyệt'));
  }
});

classRouter.get('/dashboard', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const className = req.classMonitor?.ten_lop || 'Lớp';
    const { semester } = req.query;
    
    const dashboard = await MonitorService.getMonitorDashboard(classId, className, semester);
    return sendResponse(res, 200, ApiResponse.success(dashboard, 'Dashboard lớp trưởng'));
  } catch (error) {
    logInfo('V1 compat /class/dashboard error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy dashboard'));
  }
});

classRouter.get('/registrations', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const { status, semester } = req.query;
    
    const registrations = await MonitorService.getPendingRegistrations(classId, status, semester);
    
    return sendResponse(res, 200, ApiResponse.success(registrations, `Tìm thấy ${registrations.length} đăng ký`));
  } catch (error) {
    logInfo('V1 compat /class/registrations error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách đăng ký'));
  }
});

classRouter.post('/registrations/bulk-approve', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const { ids } = req.body;
    
    // Call MonitorService bulk approve (if exists) or loop through individual approvals
    const results = [];
    for (const id of ids || []) {
      try {
        await MonitorService.approveRegistration(id, classId);
        results.push({ id, status: 'approved' });
      } catch (err) {
        results.push({ id, status: 'failed', error: err.message });
      }
    }
    
    return sendResponse(res, 200, ApiResponse.success({ results }, 'Đã xử lý duyệt hàng loạt'));
  } catch (error) {
    logInfo('V1 compat /class/registrations/bulk-approve error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt hàng loạt'));
  }
});

classRouter.get('/students', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const { semester, page = 1, limit = 20 } = req.query;
    
    const students = await MonitorService.getClassStudents(classId, semester);
    
    // V1 pagination format
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const endIdx = startIdx + parseInt(limit);
    const paginatedStudents = students.slice(startIdx, endIdx);
    
    return sendResponse(res, 200, ApiResponse.success({
      students: paginatedStudents,
      total: students.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(students.length / parseInt(limit))
    }, 'Danh sách sinh viên'));
  } catch (error) {
    logInfo('V1 compat /class/students error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách sinh viên'));
  }
});

classRouter.get('/reports', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const { semester, timeRange = 'semester' } = req.query;
    
    // Use V1 controller logic directly for complex reports
    const ClassController = require('../controllers/class.controller');
    return ClassController.getClassReports(req, res);
  } catch (error) {
    logInfo('V1 compat /class/reports error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi tạo báo cáo'));
  }
});

// ==================== /teacher/* ROUTES ====================
const teacherRouter = Router();

teacherRouter.get('/registrations/pending', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN' };
    
    // Get teacher's pending approvals from registrations service
    const registrations = await TeacherService.getPendingRegistrations(user, { limit: 1000 });
    const count = registrations?.length || 0;
    
    return sendResponse(res, 200, ApiResponse.success({ count }, 'Số đăng ký chờ duyệt'));
  } catch (error) {
    logInfo('V1 compat /teacher/registrations/pending error:', error.message);
    return sendResponse(res, 200, ApiResponse.success({ count: 0 }, 'Không có đăng ký chờ duyệt'));
  }
});

teacherRouter.post('/registrations/bulk-approve', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN' };
    const { ids } = req.body;
    
    const results = await TeacherService.bulkApproveRegistrations(ids, user);
    
    return sendResponse(res, 200, ApiResponse.success({ results }, 'Đã duyệt hàng loạt'));
  } catch (error) {
    logInfo('V1 compat /teacher/registrations/bulk-approve error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi duyệt hàng loạt'));
  }
});

teacherRouter.get('/dashboard', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN' };
    const { semester } = req.query;
    
    // Parse semester filter if provided
    let semesterFilter = {};
    if (semester) {
      const { parseSemesterString } = require('../utils/semester');
      const semesterInfo = parseSemesterString(semester);
      if (semesterInfo) {
        semesterFilter.hoc_ky = semesterInfo.hocKy || semesterInfo.semester;
        semesterFilter.nam_hoc = semesterInfo.namHoc || `${semesterInfo.year}-${parseInt(semesterInfo.year) + 1}`;
      }
    }
    
    const dashboard = await TeacherService.getDashboard(user, semesterFilter);
    
    return sendResponse(res, 200, ApiResponse.success(dashboard, 'Dashboard giáo viên'));
  } catch (error) {
    logInfo('V1 compat /teacher/dashboard error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy dashboard'));
  }
});

teacherRouter.get('/activities/pending', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN', sub: req.user.sub };
    const { page = 1, limit = 100, search = '', semester } = req.query;
    
    console.log('🔍 V1 GET /teacher/activities/pending:', { page, limit, search, semester });
    
    // Get pending activities
    const result = await TeacherService.getPendingActivities(user, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    const activities = result?.items || result?.data || result || [];
    const total = result?.total || activities.length;
    
    console.log('📦 V1 /teacher/activities/pending result:', { activitiesCount: activities.length, total });
    
    // Get stats - count activities by status
    // We need to get ALL activities (not just pending) to calculate stats
    const { prisma } = require('../config/database');
    
    // Get teacher's classes
    const classes = await prisma.lop.findMany({
      where: { chu_nhiem: user.id },
      select: { id: true }
    });
    
    const classIds = classes.map(c => c.id);
    let stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    if (classIds.length > 0) {
      // Get all students in teacher's classes
      const students = await prisma.sinhVien.findMany({
        where: { lop_id: { in: classIds } },
        select: { nguoi_dung_id: true }
      });
      
      const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);
      
      if (studentUserIds.length > 0) {
        // Parse semester filter if provided
        let semesterFilter = {};
        if (semester) {
          const { parseSemesterString } = require('../utils/semester');
          const semesterInfo = parseSemesterString(semester);
          if (semesterInfo) {
            semesterFilter.hoc_ky = semesterInfo.hocKy || semesterInfo.semester;
            semesterFilter.nam_hoc = semesterInfo.namHoc || `${semesterInfo.year}-${parseInt(semesterInfo.year) + 1}`;
          }
        }
        
        const statsWhere = {
          nguoi_tao_id: { in: studentUserIds },
          ...semesterFilter
        };
        
        // Count by status
        const [totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
          prisma.hoatDong.count({ where: statsWhere }),
          prisma.hoatDong.count({ where: { ...statsWhere, trang_thai: 'cho_duyet' } }),
          prisma.hoatDong.count({ where: { ...statsWhere, trang_thai: 'da_duyet' } }),
          prisma.hoatDong.count({ where: { ...statsWhere, trang_thai: 'tu_choi' } })
        ]);
        
        stats = {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        };
      }
    }
    
    console.log('📊 V1 /teacher/activities/pending stats:', stats);
    
    return sendResponse(res, 200, ApiResponse.success({
      items: activities,  // V1 uses 'items', not 'activities'
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      stats  // Include stats object
    }, 'Hoạt động chờ duyệt'));
  } catch (error) {
    console.error('V1 compat /teacher/activities/pending ERROR:', error);
    logInfo('V1 compat /teacher/activities/pending error:', error.message);
    return sendResponse(res, 200, ApiResponse.success({ 
      items: [], 
      total: 0,
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 }
    }, 'Không có hoạt động chờ duyệt'));
  }
});

// activities history for teacher
teacherRouter.get('/activities/history', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN', sub: req.user.sub };
    const { page = 1, limit = 100, semester, search = '', status = '' } = req.query;

    console.log('🔍 V1 GET /teacher/activities/history:', { page, limit, semester, status, search });

    const result = await TeacherService.getActivityHistory(user, { semester }, { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
    
    const activities = result?.items || result?.data || result || [];
    const total = result?.total || result?.pagination?.total || activities.length;

    console.log('📦 V1 /teacher/activities/history result:', { activitiesCount: activities.length, total });

    return sendResponse(res, 200, ApiResponse.success({ 
      items: activities,  // V1 uses 'items', not 'activities'
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    }, 'Lịch sử hoạt động'));
  } catch (error) {
    console.error('V1 compat /teacher/activities/history ERROR:', error);
    logInfo('V1 compat /teacher/activities/history error:', error.message);
    return sendResponse(res, 200, ApiResponse.success({ items: [], total: 0 }, 'Không có lịch sử hoạt động'));
  }
});

teacherRouter.get('/classes', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN' };
    
    const classes = await TeacherService.getClasses(user);
    
    return sendResponse(res, 200, ApiResponse.success(classes, 'Danh sách lớp'));
  } catch (error) {
    logInfo('V1 compat /teacher/classes error:', error.message);
    return sendResponse(res, 200, ApiResponse.success([], 'Không có lớp'));
  }
});

teacherRouter.get('/students', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN' };
    const { semester, page = 1, limit = 20, search = '', classFilter = '' } = req.query;
    
    console.log('🔍 V1 GET /teacher/students:', { search, classFilter, page, limit });
    
    // Get students with filters
    const students = await TeacherService.getStudents(user, { 
      search: search || undefined,
      classFilter: classFilter || undefined
    });
    
    console.log('📦 V1 /teacher/students result:', { studentsCount: students.length });
    
    // V1 pagination format (in-memory pagination)
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const endIdx = startIdx + parseInt(limit);
    const paginatedStudents = students.slice(startIdx, endIdx);
    
    return sendResponse(res, 200, ApiResponse.success({
      students: paginatedStudents,
      total: students.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(students.length / parseInt(limit)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: students.length,
        pages: Math.ceil(students.length / parseInt(limit))
      }
    }, 'Lấy danh sách sinh viên thành công'));
  } catch (error) {
    console.error('V1 compat /teacher/students ERROR:', error);
    logInfo('V1 compat /teacher/students error:', error.message);
    return sendResponse(res, 200, ApiResponse.success({ 
      students: [], 
      total: 0,
      pagination: { page: parseInt(req.query.page || 1), limit: parseInt(req.query.limit || 20), total: 0, pages: 0 }
    }, 'Không có sinh viên'));
  }
});

teacherRouter.get('/reports/statistics', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: 'GIANG_VIEN' };
    const { semester } = req.query;
    
    const stats = await TeacherService.getReportStatistics(user, { semesterId: semester });
    
    return sendResponse(res, 200, ApiResponse.success(stats, 'Thống kê giáo viên'));
  } catch (error) {
    logInfo('V1 compat /teacher/reports/statistics error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi tạo thống kê'));
  }
});

// POST /teacher/activities/:id/approve - Approve activity (V1 compat)
teacherRouter.post('/activities/:id/approve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = { id: req.user.sub, role: 'GIANG_VIEN', sub: req.user.sub };
    
    console.log('🔍 V1 POST /teacher/activities/:id/approve:', { activityId: id, teacher: user.id });
    
    const result = await TeacherService.approveActivity(id, user);
    
    console.log('✅ V1 Approved activity:', { id, trang_thai: result?.trang_thai });
    
    return sendResponse(res, 200, ApiResponse.success(result, 'Đã duyệt hoạt động'));
  } catch (error) {
    console.error('V1 compat /teacher/activities/:id/approve ERROR:', error);
    logInfo('V1 compat /teacher/activities/:id/approve error:', error.message);
    
    if (error.message && error.message.includes('không có quyền')) {
      return sendResponse(res, 403, ApiResponse.forbidden(error.message));
    }
    if (error.message && error.message.includes('không tìm thấy')) {
      return sendResponse(res, 404, ApiResponse.notFound(error.message));
    }
    
    return sendResponse(res, 500, ApiResponse.error('Không thể duyệt hoạt động'));
  }
});

// POST /teacher/activities/:id/reject - Reject activity (V1 compat)
teacherRouter.post('/activities/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const user = { id: req.user.sub, role: 'GIANG_VIEN', sub: req.user.sub };
    
    console.log('🔍 V1 POST /teacher/activities/:id/reject:', { activityId: id, reason, teacher: user.id });
    
    const result = await TeacherService.rejectActivity(id, reason, user);
    
    console.log('✅ V1 Rejected activity:', { id, trang_thai: result?.trang_thai });
    
    return sendResponse(res, 200, ApiResponse.success(result, 'Đã từ chối hoạt động'));
  } catch (error) {
    console.error('V1 compat /teacher/activities/:id/reject ERROR:', error);
    logInfo('V1 compat /teacher/activities/:id/reject error:', error.message);
    
    if (error.message && error.message.includes('không có quyền')) {
      return sendResponse(res, 403, ApiResponse.forbidden(error.message));
    }
    if (error.message && error.message.includes('không tìm thấy')) {
      return sendResponse(res, 404, ApiResponse.notFound(error.message));
    }
    
    return sendResponse(res, 500, ApiResponse.error('Không thể từ chối hoạt động'));
  }
});

// POST /teacher/registrations/:regId/approve - Approve registration (V1 compat)
teacherRouter.post('/registrations/:regId/approve', auth, async (req, res) => {
  try {
    const { regId } = req.params;
    const user = { id: req.user.sub, role: 'GIANG_VIEN', sub: req.user.sub };
    
    console.log('🔍 V1 POST /teacher/registrations/:regId/approve:', { regId, teacher: user.id });
    
    const result = await TeacherService.approveRegistration(regId, user);
    
    console.log('✅ V1 Approved registration:', { regId, trang_thai_dk: result?.trang_thai_dk });
    
    return sendResponse(res, 200, ApiResponse.success(result, 'Đã duyệt đăng ký'));
  } catch (error) {
    console.error('V1 compat /teacher/registrations/:regId/approve ERROR:', error);
    logInfo('V1 compat /teacher/registrations/:regId/approve error:', error.message);
    
    if (error.message && error.message.includes('không có quyền')) {
      return sendResponse(res, 403, ApiResponse.forbidden(error.message));
    }
    if (error.message && error.message.includes('không tìm thấy')) {
      return sendResponse(res, 404, ApiResponse.notFound(error.message));
    }
    
    return sendResponse(res, 500, ApiResponse.error('Không thể duyệt đăng ký'));
  }
});

// POST /teacher/registrations/:regId/reject - Reject registration (V1 compat)
teacherRouter.post('/registrations/:regId/reject', auth, async (req, res) => {
  try {
    const { regId } = req.params;
    const { reason } = req.body || {};
    const user = { id: req.user.sub, role: 'GIANG_VIEN', sub: req.user.sub };
    
    console.log('🔍 V1 POST /teacher/registrations/:regId/reject:', { regId, reason, teacher: user.id });
    
    const result = await TeacherService.rejectRegistration(regId, reason, user);
    
    console.log('✅ V1 Rejected registration:', { regId, trang_thai_dk: result?.trang_thai_dk });
    
    return sendResponse(res, 200, ApiResponse.success(result, 'Đã từ chối đăng ký'));
  } catch (error) {
    console.error('V1 compat /teacher/registrations/:regId/reject ERROR:', error);
    logInfo('V1 compat /teacher/registrations/:regId/reject error:', error.message);
    
    if (error.message && error.message.includes('không có quyền')) {
      return sendResponse(res, 403, ApiResponse.forbidden(error.message));
    }
    if (error.message && error.message.includes('không tìm thấy')) {
      return sendResponse(res, 404, ApiResponse.notFound(error.message));
    }
    
    return sendResponse(res, 500, ApiResponse.error('Không thể từ chối đăng ký'));
  }
});

// ==================== /activities ROUTES ====================
const activitiesRouter = Router();

activitiesRouter.get('/', auth, async (req, res) => {
  try {
    const { semester, page = 1, limit = 20 } = req.query;
    const user = { id: req.user.sub, role: req.user.role, sub: req.user.sub };
    
    console.log('🔍 V1 /activities request:', { semester, page, limit, user: { role: user.role, id: user.id } });
    
    // V2 activitiesService.list(filters, user)
    const result = await ActivitiesService.list({
      semester,
      page: parseInt(page),
      limit: parseInt(limit)
    }, user);
    
    console.log('📦 V1 /activities result:', { itemsCount: result?.items?.length, total: result?.total });
    
    const activities = result?.items || result?.data || result || [];
    const total = result?.total || activities.length;
    
    // Normalize image URLs for V1 (expecting a single image string)
    const normalizedActivities = activities.map(a => {
      const imgs = Array.isArray(a?.hinh_anh)
        ? a.hinh_anh.map(normalizeImageUrl).filter(Boolean)
        : [normalizeImageUrl(a?.hinh_anh)].filter(Boolean);
      return {
        ...a,
        hinh_anh: imgs[0] || null
      };
    });
    
    console.log('✅ V1 /activities response:', { activitiesCount: normalizedActivities.length, total });
    
    return sendResponse(res, 200, ApiResponse.success({
      items: normalizedActivities,  // Frontend expects 'items', not 'activities'
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    }, 'Danh sách hoạt động'));
  } catch (error) {
    console.error('V1 compat /activities ERROR:', error);
    logInfo('V1 compat /activities error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách hoạt động'));
  }
});

activitiesRouter.get('/types/list', auth, async (req, res) => {
  try {
    // V2 activityTypesService.getList({ page, limit, search })
    const result = await ActivityTypeService.getList({ limit: 1000 });
    
    const types = result?.items || result || [];
    
    return sendResponse(res, 200, ApiResponse.success(types, 'Danh sách loại hoạt động'));
  } catch (error) {
    logInfo('V1 compat /activities/types/list error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy loại hoạt động'));
  }
});

// GET /activities/:id - Get activity detail
activitiesRouter.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = { id: req.user.sub, role: req.user.role, sub: req.user.sub };
    
    console.log('🔍 V1 /activities/:id request:', { id, user: { role: user.role, id: user.id } });
    
    // For LOP_TRUONG/GIANG_VIEN/ADMIN: use empty scope (allow all activities)
    // For SINH_VIEN: apply class filtering (same as list)
    let scope = {};
    if (user.role === 'SINH_VIEN') {
      const { prisma } = require('../config/database');
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: user.sub },
        select: { lop_id: true }
      });
      
      if (student && student.lop_id) {
        const allClassStudents = await prisma.sinhVien.findMany({
          where: { lop_id: student.lop_id },
          select: { nguoi_dung_id: true }
        });
        
        const lop = await prisma.lop.findUnique({
          where: { id: student.lop_id },
          select: { chu_nhiem: true }
        });
        
        const allowedCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean);
        if (lop?.chu_nhiem) {
          allowedCreators.push(lop.chu_nhiem);
        }
        
        scope = { nguoi_tao_id: { in: allowedCreators } };
      } else {
        scope = { nguoi_tao_id: { in: [] } };
      }
    } else if (user.role === 'LOP_TRUONG') {
      // LỚP TRƯỞNG: Apply OR filter (created by class OR has class registrations)
      const { prisma } = require('../config/database');
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: user.sub },
        select: { lop_id: true }
      });
      
      if (student && student.lop_id) {
        const allClassStudents = await prisma.sinhVien.findMany({
          where: { lop_id: student.lop_id },
          select: { nguoi_dung_id: true }
        });
        
        const lop = await prisma.lop.findUnique({
          where: { id: student.lop_id },
          select: { chu_nhiem: true }
        });
        
        const allowedCreators = allClassStudents.map(s => s.nguoi_dung_id).filter(Boolean);
        if (lop?.chu_nhiem) {
          allowedCreators.push(lop.chu_nhiem);
        }
        
        const creatorFilter = { nguoi_tao_id: { in: allowedCreators } };
        const hasClassRegistrations = { dang_ky_hd: { some: { sinh_vien: { lop_id: student.lop_id } } } };
        scope = { OR: [creatorFilter, hasClassRegistrations] };
      } else {
        scope = { nguoi_tao_id: { in: [] } };
      }
    }
    // else: GIANG_VIEN/ADMIN use empty scope (see all)
    
    const activity = await ActivitiesService.getById(id, scope, user);
    
    if (!activity) {
      console.log('❌ Activity not found or not accessible:', id);
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    }
    
    // Normalize image for V1 (single string instead of array)
    const imgs = Array.isArray(activity?.hinh_anh)
      ? activity.hinh_anh.map(normalizeImageUrl).filter(Boolean)
      : [normalizeImageUrl(activity?.hinh_anh)].filter(Boolean);
    
    const normalized = {
      ...activity,
      hinh_anh: imgs[0] || null
    };
    
    console.log('✅ V1 /activities/:id response:', { id: normalized.id, ten_hd: normalized.ten_hd });
    
    return sendResponse(res, 200, ApiResponse.success(normalized, 'Chi tiết hoạt động'));
  } catch (error) {
    console.error('V1 compat /activities/:id ERROR:', error);
    logInfo('V1 compat /activities/:id error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết hoạt động'));
  }
});

// POST /activities - Create activity (V1 compat)
activitiesRouter.post('/', auth, async (req, res) => {
  try {
    const user = { id: req.user.sub, role: req.user.role, sub: req.user.sub };
    const role = String(user.role || '').toUpperCase();
    
    // Check permission
    if (!['GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'].includes(role)) {
      return sendResponse(res, 403, ApiResponse.forbidden('Bạn không có quyền tạo hoạt động'));
    }
    
    console.log('🔍 V1 POST /activities request:', { user: { role: user.role, id: user.id }, body: req.body });
    
    // V2 expects the same payload structure as V1
    const created = await ActivitiesService.create(req.body, user);
    
    console.log('✅ V1 POST /activities created:', { id: created.id, ten_hd: created.ten_hd });
    
    return sendResponse(res, 201, ApiResponse.success(created, 'Tạo hoạt động thành công'));
  } catch (error) {
    console.error('V1 compat POST /activities ERROR:', error);
    logInfo('V1 compat POST /activities error:', error.message);
    return sendResponse(res, 500, ApiResponse.error(error.message || 'Không thể tạo hoạt động'));
  }
});

// PUT /activities/:id - Update activity (V1 compat)
activitiesRouter.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = { id: req.user.sub, role: req.user.role, sub: req.user.sub };
    
    console.log('🔍 V1 PUT /activities/:id request:', { id, user: { role: user.role, id: user.id }, body: req.body });
    
    // V2 service handles ownership and permission checks
    const updated = await ActivitiesService.update(id, req.body, user, {});
    
    if (!updated) {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    }
    
    console.log('✅ V1 PUT /activities/:id updated:', { id: updated.id, ten_hd: updated.ten_hd });
    
    return sendResponse(res, 200, ApiResponse.success(updated, 'Cập nhật hoạt động thành công'));
  } catch (error) {
    console.error('V1 compat PUT /activities/:id ERROR:', error);
    logInfo('V1 compat PUT /activities/:id error:', error.message);
    
    if (error.message && error.message.includes('không có quyền')) {
      return sendResponse(res, 403, ApiResponse.forbidden(error.message));
    }
    
    return sendResponse(res, 500, ApiResponse.error(error.message || 'Không thể cập nhật hoạt động'));
  }
});

// ==================== /monitor/* ROUTES (Additional V1 endpoints) ====================
const monitorRouter = Router();

monitorRouter.get('/students', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const { semester, page = 1, limit = 20 } = req.query;
    
    const students = await MonitorService.getClassStudents(classId, semester);
    
    // V1 pagination format
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const endIdx = startIdx + parseInt(limit);
    const paginatedStudents = students.slice(startIdx, endIdx);
    
    return sendResponse(res, 200, ApiResponse.success({
      students: paginatedStudents,
      total: students.length,
      page: parseInt(page),
      limit: parseInt(limit)
    }, 'Danh sách sinh viên'));
  } catch (error) {
    logInfo('V1 compat /monitor/students error:', error.message);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách sinh viên'));
  }
});

// ==================== /notifications/* ROUTES (V1 Compatibility) ====================
const notificationsRouter = Router();

// NotificationsController is exported as instance, not class
const notificationsController = NotificationsController;

// Proxy all notification routes to V1 controller
notificationsRouter.get('/', auth, notificationsController.getNotifications);
notificationsRouter.get('/unread-count', auth, notificationsController.getUnreadCount);
notificationsRouter.get('/sent', auth, notificationsController.getSentNotifications);
notificationsRouter.get('/sent/:notificationId', auth, notificationsController.getSentNotificationDetail);
notificationsRouter.get('/:notificationId', auth, notificationsController.getNotificationById);
notificationsRouter.put('/:notificationId/read', auth, notificationsController.markAsRead);
notificationsRouter.patch('/:notificationId/read', auth, notificationsController.markAsRead);
notificationsRouter.put('/mark-all-read', auth, notificationsController.markAllAsRead);
notificationsRouter.post('/', auth, notificationsController.createNotification);
notificationsRouter.delete('/:notificationId', auth, notificationsController.deleteNotification);

// Export all routers
module.exports = {
  classRouter,
  teacherRouter,
  activitiesRouter,
  monitorRouter,
  notificationsRouter
};
