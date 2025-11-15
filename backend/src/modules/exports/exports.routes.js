const express = require('express');
const router = express.Router();
const ExportsService = require('./exports.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { auth } = require('../../core/http/middleware/authJwt');
const { requireAdmin } = require('../../core/http/middleware/authJwt');

/**
 * @route   GET /api/core/exports/overview
 * @desc    Get overview statistics
 * @access  Private (Admin)
 */
router.get('/overview', auth, requireAdmin, async (req, res) => {
  try {
    const { semester, hoc_ky, nam_hoc } = req.query || {};
    const data = await ExportsService.getOverview({ semester, hoc_ky, nam_hoc });
    return sendResponse(res, 200, ApiResponse.success(data));
  } catch (error) {
    if (error.message === 'INVALID_SEMESTER') {
      return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy báo cáo'));
  }
});

/**
 * @route   GET /api/core/exports/activities
 * @desc    Export activities to CSV
 * @access  Private (Admin)
 */
router.get('/activities', auth, requireAdmin, async (req, res) => {
  try {
    const { semester, hoc_ky, nam_hoc } = req.query || {};
    const csv = await ExportsService.exportActivities({ semester, hoc_ky, nam_hoc });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    if (error.message === 'INVALID_SEMESTER') {
      return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
    }
    return sendResponse(res, 500, ApiResponse.error(`Lỗi xuất hoạt động: ${error?.message || 'UNKNOWN'}`));
  }
});

/**
 * @route   GET /api/core/exports/registrations
 * @desc    Export registrations to CSV
 * @access  Private (Admin)
 */
router.get('/registrations', auth, requireAdmin, async (req, res) => {
  try {
    const { semester, hoc_ky, nam_hoc } = req.query || {};
    const csv = await ExportsService.exportRegistrations({ semester, hoc_ky, nam_hoc });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    if (error.message === 'INVALID_SEMESTER') {
      return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
    }
    return sendResponse(res, 500, ApiResponse.error(`Lỗi xuất đăng ký: ${error?.message || 'UNKNOWN'}`));
  }
});

module.exports = router;





