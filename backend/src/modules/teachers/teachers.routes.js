/**
 * Teachers Routes - V2 API
 * Clean Architecture with use cases
 */

const express = require('express');
const router = express.Router();
const { createTeachersController } = require('./presentation/teachers.factory');
const { auth } = require('../../core/http/middleware/authJwt');
const { prisma } = require('../../infrastructure/prisma/client');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');
const { uploadExcel } = require('../../core/http/middleware/uploadExcel');
const { parseExcelFile, validateStudents, importStudents, cleanupFile } = require('../../core/utils/excelParser');

const teachersController = createTeachersController();

// All routes require GIANG_VIEN role (handled in use cases)

/**
 * GET /teachers/dashboard
 * Get teacher dashboard with stats and classes
 */
router.get('/dashboard', auth, asyncHandler((req, res) => teachersController.getDashboard(req, res)));

/**
 * GET /teachers/classes
 * Get classes assigned to teacher
 */
router.get('/classes', auth, asyncHandler((req, res) => teachersController.getClasses(req, res)));

/**
 * GET /teachers/students
 * Get students in teacher's classes
 */
router.get('/students', auth, asyncHandler((req, res) => teachersController.getStudents(req, res)));

/**
 * GET /teachers/activities/pending
 * Get pending activities from teacher's classes
 */
router.get('/activities/pending', auth, asyncHandler((req, res) => teachersController.getPendingActivities(req, res)));

/**
 * GET /teachers/activities/history
 * Get approved/rejected activities history
 */
router.get('/activities/history', auth, asyncHandler((req, res) => teachersController.getActivityHistory(req, res)));

/**
 * POST /teachers/activities/:id/approve
 * Approve activity
 */
router.post('/activities/:id/approve', auth, asyncHandler((req, res) => teachersController.approveActivity(req, res)));

/**
 * POST /teachers/activities/:id/reject
 * Reject activity
 */
router.post('/activities/:id/reject', auth, asyncHandler((req, res) => teachersController.rejectActivity(req, res)));

/**
 * GET /teachers/registrations
 * Get all registrations for teacher's classes with filters
 */
router.get('/registrations', auth, asyncHandler((req, res) => teachersController.getAllRegistrations(req, res)));

/**
 * GET /teachers/registrations/pending
 * Get pending registrations
 */
router.get('/registrations/pending', auth, asyncHandler((req, res) => teachersController.getPendingRegistrations(req, res)));

/**
 * POST /teachers/registrations/:id/approve
 * Approve registration
 */
router.post('/registrations/:id/approve', auth, asyncHandler((req, res) => teachersController.approveRegistration(req, res)));

/**
 * POST /teachers/registrations/:id/reject
 * Reject registration
 */
router.post('/registrations/:id/reject', auth, asyncHandler((req, res) => teachersController.rejectRegistration(req, res)));

/**
 * POST /teachers/registrations/bulk-approve
 * Bulk approve registrations
 */
router.post('/registrations/bulk-approve', auth, asyncHandler((req, res) => teachersController.bulkApproveRegistrations(req, res)));

/**
 * GET /teachers/classes/:className/stats
 * Get class statistics
 */
router.get('/classes/:className/stats', auth, asyncHandler((req, res) => teachersController.getClassStatistics(req, res)));

/**
 * GET /teachers/classes/:id/statistics
 * Alias by class ID for convenience from frontend
 */
router.get('/classes/:id/statistics', auth, asyncHandler((req, res) => teachersController.getClassStatisticsById(req, res)));

/**
 * PATCH /teachers/classes/:id/monitor
 * Assign class monitor for a class the teacher owns
 * Body: { sinh_vien_id: string }
 */
router.patch('/classes/:id/monitor', auth, asyncHandler((req, res) => teachersController.assignClassMonitor(req, res)));

/**
 * POST /teachers/students
 * Create a single student (teacher's class only)
 */
router.post('/students', auth, asyncHandler((req, res) => teachersController.createStudent(req, res)));

/**
 * POST /teachers/students/preview
 * Upload Excel/CSV and return validation results (no DB writes)
 */
router.post('/students/preview', auth, uploadExcel.single('file'), asyncHandler(async (req, res) => {
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
router.get('/students/export', auth, asyncHandler((req, res) => teachersController.exportStudents(req, res)));

/**
 * GET /teachers/reports/statistics
 * Get statistics for reports
 */
router.get('/reports/statistics', auth, asyncHandler((req, res) => teachersController.getReportStatistics(req, res)));

module.exports = router;





