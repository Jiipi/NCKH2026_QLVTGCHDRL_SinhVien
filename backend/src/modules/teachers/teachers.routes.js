/**
 * Teachers Routes - V2 API
 * Simplified teacher endpoints using service layer
 */

const express = require('express');
const router = express.Router();
const teachersService = require('./teachers.service');
const { auth } = require('../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../app/errors/AppError');

// All routes require GIANG_VIEN role (handled in service layer)

/**
 * GET /teachers/dashboard
 * Get teacher dashboard with stats and classes
 */
router.get('/dashboard', auth, asyncHandler(async (req, res) => {
  const dashboard = await teachersService.getDashboard(req.user);
  
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
  const { class: className } = req.query;
  
  const filters = {};
  if (className) filters.class = className;
  
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
  const { page, limit } = req.query;
  
  const result = await teachersService.getPendingActivities(req.user, {
    page,
    limit
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
  const { page, limit, status, semesterId } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (semesterId) filters.semesterId = parseInt(semesterId);
  
  const result = await teachersService.getActivityHistory(req.user, filters, {
    page,
    limit
  });
  
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
 * GET /teachers/registrations/pending
 * Get pending registrations
 */
router.get('/registrations/pending', auth, asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  
  const result = await teachersService.getPendingRegistrations(req.user, {
    page,
    limit
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
 * GET /teachers/students/export
 * Export students list
 */
router.get('/students/export', auth, asyncHandler(async (req, res) => {
  const students = await teachersService.exportStudents(req.user);
  
  res.json({
    success: true,
    data: students,
    message: 'Use this data to generate Excel/CSV'
  });
}));

/**
 * GET /teachers/reports/statistics
 * Get statistics for reports
 */
router.get('/reports/statistics', auth, asyncHandler(async (req, res) => {
  const { semesterId } = req.query;
  
  const stats = await teachersService.getReportStatistics(req.user, {
    semesterId
  });
  
  res.json({
    success: true,
    data: stats
  });
}));

module.exports = router;





