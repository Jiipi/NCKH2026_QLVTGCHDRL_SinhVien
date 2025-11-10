const express = require('express');
const router = express.Router();
const MonitorService = require('./monitor.service');
const { ApiResponse, sendResponse } = require('../../utils/response');
const { auth } = require('../../middlewares/auth');
const { isClassMonitor } = require('../../middlewares/rbac');

/**
 * @route   GET /api/v2/monitor/students
 * @desc    Get all students in monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/students', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const { semester } = req.query;
    
    const students = await MonitorService.getClassStudents(classId, semester);
    return sendResponse(res, 200, ApiResponse.success(students, 'Danh sách sinh viên lớp'));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách sinh viên'));
  }
});

/**
 * @route   GET /api/v2/monitor/registrations
 * @desc    Get registrations for monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/registrations', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const { status, semester } = req.query;
    
    const registrations = await MonitorService.getPendingRegistrations(classId, status, semester);
    
    // Normalize image URLs
    const base = `${req.protocol}://${req.get('host')}`;
    const normalized = registrations.map(r => {
      try {
        const imgs = Array.isArray(r?.hoat_dong?.hinh_anh) ? r.hoat_dong.hinh_anh : [];
        const abs = imgs.map(u => (typeof u === 'string' && u.startsWith('/uploads/')) ? (base + u) : u).filter(Boolean);
        return { ...r, hoat_dong: { ...r.hoat_dong, hinh_anh: abs } };
      } catch (_) { 
        return r; 
      }
    });
    
    return sendResponse(res, 200, ApiResponse.success(
      normalized,
      `Tìm thấy ${registrations.length} đăng ký`
    ));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách đăng ký'));
  }
});

/**
 * @route   GET /api/v2/monitor/registrations/pending-count
 * @desc    Get count of pending registrations
 * @access  Private (Class Monitor)
 */
router.get('/registrations/pending-count', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const count = await MonitorService.getPendingRegistrationsCount(classId);
    return sendResponse(res, 200, ApiResponse.success({ count }, 'Số đăng ký chờ duyệt'));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy số lượng đăng ký chờ duyệt'));
  }
});

/**
 * @route   PUT /api/v2/monitor/registrations/:registrationId/approve
 * @desc    Approve a registration
 * @access  Private (Class Monitor)
 */
router.put('/registrations/:registrationId/approve', auth, isClassMonitor, async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.sub;
    const userRole = req.user.role;
    
    await MonitorService.approveRegistration(registrationId, userId, userRole);
    return sendResponse(res, 200, ApiResponse.success(null, 'Phê duyệt đăng ký thành công'));
  } catch (error) {
    if (error.message === 'REGISTRATION_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy đăng ký'));
    }
    if (error.status === 423) {
      return sendResponse(res, 423, ApiResponse.error(error.message, error.details));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi phê duyệt đăng ký'));
  }
});

/**
 * @route   PUT /api/v2/monitor/registrations/:registrationId/reject
 * @desc    Reject a registration
 * @access  Private (Class Monitor)
 */
router.put('/registrations/:registrationId/reject', auth, isClassMonitor, async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { reason } = req.body;
    const userId = req.user.sub;
    const userRole = req.user.role;
    
    await MonitorService.rejectRegistration(registrationId, userId, userRole, reason);
    return sendResponse(res, 200, ApiResponse.success(null, 'Từ chối đăng ký thành công'));
  } catch (error) {
    if (error.message === 'REGISTRATION_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy đăng ký'));
    }
    if (error.status === 423) {
      return sendResponse(res, 423, ApiResponse.error(error.message, error.details));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi từ chối đăng ký'));
  }
});

/**
 * @route   GET /api/v2/monitor/dashboard
 * @desc    Get monitor dashboard summary
 * @access  Private (Class Monitor)
 */
router.get('/dashboard', auth, isClassMonitor, async (req, res) => {
  try {
    const classId = req.classMonitor?.lop_id;
    const className = req.classMonitor?.lop?.ten_lop;
    const { semester } = req.query;
    
    if (!classId) {
      return sendResponse(res, 403, ApiResponse.error('Bạn chưa được gán vào lớp nào'));
    }
    
    const dashboard = await MonitorService.getMonitorDashboard(classId, className, semester);
    return sendResponse(res, 200, ApiResponse.success(dashboard));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin dashboard'));
  }
});

module.exports = router;
