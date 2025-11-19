/**
 * Teachers Routes - V2 API
 * Simplified teacher endpoints using service layer
 */

const express = require('express');
const router = express.Router();
const teachersService = require('./teachers.service');
const { auth } = require('../../core/http/middleware/authJwt');
const { prisma } = require('../../infrastructure/prisma/client');
const { asyncHandler } = require('../../app/errors/AppError');
const { uploadExcel } = require('../../core/http/middleware/uploadExcel');
const { parseExcelFile, validateStudents, importStudents, cleanupFile } = require('../../core/utils/excelParser');
const XLSX = require('xlsx');

// All routes require GIANG_VIEN role (handled in service layer)

/**
 * GET /teachers/dashboard
 * Get teacher dashboard with stats and classes
 */
router.get('/dashboard', auth, asyncHandler(async (req, res) => {
  const { semester, classId } = req.query;

  // Pass semester param directly (e.g., "hoc_ky_1-2025")
  const dashboard = await teachersService.getDashboard(req.user, semester, classId);
  
  res.json({
    success: true,
    data: dashboard
  });
}));

/**
 * GET /teachers/classes
 * Get classes assigned to teacher
 */
router.get('/classes', auth, asyncHandler(async (req, res) => {
  const classes = await teachersService.getClasses(req.user);
  
  res.json({
    success: true,
    data: classes
  });
}));

/**
 * GET /teachers/students
 * Get students in teacher's classes
 */
router.get('/students', auth, asyncHandler(async (req, res) => {
  const { class: className, classId, classFilter, search, semester } = req.query;

  const filters = {};
  // Prefer explicit classId from client; fallback to alias keys; finally accept className
  if (classId) filters.classId = String(classId);
  else if (classFilter) filters.classId = String(classFilter);
  else if (className) filters.class = String(className);
  if (search) filters.search = String(search);
  if (semester) filters.semester = String(semester);

  const students = await teachersService.getStudents(req.user, filters);
  
  res.json({
    success: true,
    data: students
  });
}));

/**
 * GET /teachers/activities/pending
 * Get pending activities from teacher's classes
 */
router.get('/activities/pending', auth, asyncHandler(async (req, res) => {
  const { page, limit, semester } = req.query;
  
  const filters = {};
  if (semester) filters.semester = String(semester);
  
  const result = await teachersService.getPendingActivities(req.user, {
    page,
    limit,
    ...filters
  });
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * GET /teachers/activities/history
 * Get approved/rejected activities history
 */
router.get('/activities/history', auth, asyncHandler(async (req, res) => {
  const { page, limit, status, semester } = req.query;

  const filters = {};
  if (status) filters.status = status; // semantic status (open/soon/closed) not used here but safe
  if (semester) filters.semester = String(semester); // prefer semantic semester string like hoc_ky_1-2025

  const result = await teachersService.getActivityHistory(req.user, filters, { page, limit });
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * POST /teachers/activities/:id/approve
 * Approve activity
 */
router.post('/activities/:id/approve', auth, asyncHandler(async (req, res) => {
  const activity = await teachersService.approveActivity(req.params.id, req.user);
  
  res.json({
    success: true,
    message: 'Đã duyệt hoạt động thành công',
    data: activity
  });
}));

/**
 * POST /teachers/activities/:id/reject
 * Reject activity
 */
router.post('/activities/:id/reject', auth, asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const activity = await teachersService.rejectActivity(
    req.params.id,
    reason,
    req.user
  );
  
  res.json({
    success: true,
    message: 'Đã từ chối hoạt động',
    data: activity
  });
}));

/**
 * GET /teachers/registrations
 * Get all registrations for teacher's classes with filters
 */
router.get('/registrations', auth, asyncHandler(async (req, res) => {
  const { status, semester, classId } = req.query;
  
  const result = await teachersService.getAllRegistrations(req.user, {
    status,
    semester,
    classId
  });
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * GET /teachers/registrations/pending
 * Get pending registrations
 */
router.get('/registrations/pending', auth, asyncHandler(async (req, res) => {
  const { page, limit, classId, semester, status } = req.query;
  
  const result = await teachersService.getPendingRegistrations(req.user, {
    page,
    limit,
    classId,
    semester,
    status
  });
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * POST /teachers/registrations/:id/approve
 * Approve registration
 */
router.post('/registrations/:id/approve', auth, asyncHandler(async (req, res) => {
  const registration = await teachersService.approveRegistration(
    req.params.id,
    req.user
  );
  
  res.json({
    success: true,
    message: 'Đã duyệt đăng ký thành công',
    data: registration
  });
}));

/**
 * POST /teachers/registrations/:id/reject
 * Reject registration
 */
router.post('/registrations/:id/reject', auth, asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const registration = await teachersService.rejectRegistration(
    req.params.id,
    reason,
    req.user
  );
  
  res.json({
    success: true,
    message: 'Đã từ chối đăng ký',
    data: registration
  });
}));

/**
 * POST /teachers/registrations/bulk-approve
 * Bulk approve registrations
 */
router.post('/registrations/bulk-approve', auth, asyncHandler(async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({
      success: false,
      message: 'ids phải là array'
    });
  }
  
  const result = await teachersService.bulkApproveRegistrations(ids, req.user);
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * GET /teachers/classes/:className/stats
 * Get class statistics
 */
router.get('/classes/:className/stats', auth, asyncHandler(async (req, res) => {
  const { semesterId } = req.query;
  
  const stats = await teachersService.getClassStatistics(
    req.params.className,
    semesterId,
    req.user
  );
  
  res.json({
    success: true,
    data: stats
  });
}));

/**
 * GET /teachers/classes/:id/statistics
 * Alias by class ID for convenience from frontend
 */
router.get('/classes/:id/statistics', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { semesterId } = req.query;

  const lop = await prisma.lop.findUnique({ where: { id: String(id) }, select: { ten_lop: true } });
  if (!lop) {
    return res.json({
      success: true,
      data: {
        totalStudents: 0,
        totalActivities: 0,
        approvedActivities: 0,
        totalRegistrations: 0,
        approvedRegistrations: 0
      }
    });
  }

  const stats = await teachersService.getClassStatistics(lop.ten_lop, semesterId, req.user);
  res.json({ success: true, data: stats });
}));

/**
 * PATCH /teachers/classes/:id/monitor
 * Assign class monitor for a class the teacher owns
 * Body: { sinh_vien_id: string }
 */
router.patch('/classes/:id/monitor', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sinh_vien_id } = req.body || {};

  if (!sinh_vien_id) {
    return res.status(400).json({ success: false, message: 'Thiếu sinh_vien_id' });
  }

  const result = await teachersService.assignClassMonitor(String(id), String(sinh_vien_id), req.user);
  res.json({ success: true, message: 'Gán lớp trưởng thành công', data: result });
}));

/**
 * POST /teachers/students
 * Create a single student (teacher's class only)
 */
router.post('/students', auth, asyncHandler(async (req, res) => {
  const user = req.user;
  if (user?.role !== 'GIANG_VIEN' && user?.role !== 'GIANG_VIÊN') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên mới được tạo sinh viên' });
  }

  const body = req.body || {};
  const required = ['ho_ten','email','mssv','ten_dn','mat_khau','lop_id'];
  const missing = required.filter(k => !String(body[k] || '').trim());
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Thiếu trường bắt buộc: ${missing.join(', ')}` });
  }

  const result = await teachersService.createStudent(user, body);
  res.status(201).json({ success: true, message: 'Tạo sinh viên thành công', data: result });
}));

/**
 * POST /teachers/students/preview
 * Upload Excel/CSV and return validation results (no DB writes)
 */
router.post('/students/preview', auth, uploadExcel.single('file'), asyncHandler(async (req, res) => {
  // Ensure only teacher role can import
  if (req.user?.role !== 'GIANG_VIEN' && req.user?.role !== 'GIANG_VIÊN') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên mới được import sinh viên' });
  }

  if (!req.file || !req.file.path) {
    return res.status(400).json({ success: false, message: 'Thiếu file upload. Vui lòng chọn file Excel/CSV' });
  }

  const filePath = req.file.path;
  try {
    const rows = parseExcelFile(filePath);
    const result = await validateStudents(rows);
    res.json({ success: true, data: result });
  } finally {
    cleanupFile(filePath);
  }
}));

/**
 * POST /teachers/students/import
 * Upload Excel/CSV, validate and import valid rows into DB
 */
router.post('/students/import', auth, uploadExcel.single('file'), asyncHandler(async (req, res) => {
  if (req.user?.role !== 'GIANG_VIEN' && req.user?.role !== 'GIANG_VIÊN') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên mới được import sinh viên' });
  }

  if (!req.file || !req.file.path) {
    return res.status(400).json({ success: false, message: 'Thiếu file upload. Vui lòng chọn file Excel/CSV' });
  }

  const filePath = req.file.path;
  try {
    const rows = parseExcelFile(filePath);
    const { valid, invalid } = await validateStudents(rows);
    if (!valid || valid.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dòng hợp lệ để import', data: { imported: 0, failed: invalid?.length || 0, invalid } });
    }
    const { imported, failed } = await importStudents(valid);
    res.json({ success: true, message: 'Import hoàn tất', data: { imported, failed, invalid } });
  } finally {
    cleanupFile(filePath);
  }
}));

/**
 * GET /teachers/students/export
 * Export students list
 */
router.get('/students/export', auth, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'GIANG_VIEN' && req.user?.role !== 'GIANG_VIÊN') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên mới được export' });
  }
  const format = String(req.query.format || 'xlsx').toLowerCase();
  const students = await teachersService.exportStudents(req.user);

  // Normalize rows for export
  const rows = students.map(s => ({
    MSSV: s.mssv,
    'Họ và tên': s.ho_ten,
    Email: s.email,
    Lớp: s.lop,
    Khoa: s.khoa,
    'Niên khóa': s.nien_khoa,
    'Số điện thoại': s.sdt || ''
  }));

  const dateStr = new Date().toISOString().slice(0,10);
  if (format === 'csv') {
    // Build CSV with BOM
    const headers = Object.keys(rows[0] || {
      MSSV: '', 'Họ và tên': '', Email: '', Lớp: '', Khoa: '', 'Niên khóa': '', 'Số điện thoại': ''
    });
    const escape = (v) => {
      const s = v == null ? '' : String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const lines = [headers.join(',')].concat(rows.map(r => headers.map(h => escape(r[h])).join(',')));
    const csv = '\uFEFF' + lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="danh_sach_sinh_vien_${dateStr}.csv"`);
    return res.status(200).send(csv);
  }

  // Default: xlsx with explicit cellDates and UTF-8 handling
  const ws = XLSX.utils.json_to_sheet(rows, { cellDates: true, dateNF: 'yyyy-mm-dd' });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SinhVien');
  // Use bookSST option to properly handle UTF-8 strings
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer', bookSST: true });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="danh_sach_sinh_vien_${dateStr}.xlsx"`);
  return res.status(200).send(buffer);
}));

/**
 * GET /teachers/reports/statistics
 * Get statistics for reports
 */
router.get('/reports/statistics', auth, asyncHandler(async (req, res) => {
  // Accept both semesterId (preferred) and legacy semester param
  const { semesterId, semester } = req.query;
  const sem = semesterId || semester || null;
  
  const stats = await teachersService.getReportStatistics(req.user, {
    semesterId: sem
  });
  
  res.json({
    success: true,
    data: stats
  });
}));

module.exports = router;





