const { Router } = require('express');
const { auth: authenticateJWT, requireAdmin } = require('../core/http/middleware/authJwt');
const registrationsService = require('../modules/registrations/registrations.service');
const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
const { logError, logInfo } = require('../core/logger');
const { buildRobustActivitySemesterWhere, parseSemesterString } = require('../core/utils/semester');
const { prisma } = require('../infrastructure/prisma/client');

const router = Router();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * GET /api/core/admin/registrations
 * List registrations with filters and counts
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'cho_duyet', search, hoc_ky, nam_hoc, semester, activityId, classId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build semester filter
    let semesterWhere = {};
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (!parsed) {
        return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
      }
      semesterWhere = { hoat_dong: buildRobustActivitySemesterWhere(semester) };
    } else if (hoc_ky || nam_hoc) {
      semesterWhere = {
        hoat_dong: {
          ...(hoc_ky ? { hoc_ky } : {}),
          ...(nam_hoc ? { nam_hoc } : {})
        }
      };
    }

    const where = {
      ...(status ? { trang_thai_dk: status } : {}),
      ...(activityId ? { hd_id: activityId } : {}),
      ...semesterWhere,
      ...(classId ? { sinh_vien: { lop_id: classId } } : {}),
      ...(search
        ? {
            OR: [
              { sinh_vien: { nguoi_dung: { ho_ten: { contains: search, mode: 'insensitive' } } } },
              { hoat_dong: { ten_hd: { contains: search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.dangKyHoatDong.findMany({
        where,
        include: {
          sinh_vien: { include: { nguoi_dung: true, lop: true } },
          hoat_dong: true
        },
        orderBy: { ngay_dang_ky: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.dangKyHoatDong.count({ where })
    ]);

    // Counts per status
    const statuses = ['cho_duyet', 'da_duyet', 'tu_choi', 'da_tham_gia'];
    const counts = {};
    for (const st of statuses) {
      counts[st] = await prisma.dangKyHoatDong.count({
        where: { ...where, trang_thai_dk: st }
      });
    }

    return sendResponse(
      res,
      200,
      ApiResponse.success({ items, total, page: parseInt(page), limit: parseInt(limit), counts }, 'Lấy danh sách đăng ký thành công')
    );
  } catch (error) {
    logError('Admin registrations list error', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách đăng ký'));
  }
});

/**
 * GET /api/core/admin/registrations/export
 * Export registrations to Excel
 */
router.get('/export', async (req, res) => {
  try {
    const workbook = await registrationsService.exportRegistrations(req.query);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=dangky_hoatdong_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logError('Admin registrations export error', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi xuất Excel'));
  }
});

/**
 * POST /api/core/admin/registrations/:id/approve
 * Approve a registration
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.dangKyHoatDong.update({
      where: { id },
      data: { trang_thai_dk: 'da_duyet', ly_do_tu_choi: null, ngay_duyet: new Date() }
    });
    logInfo('Admin approved registration', { id, by: req.user?.sub });
    return sendResponse(res, 200, ApiResponse.success(updated, 'Phê duyệt đăng ký thành công'));
  } catch (error) {
    logError('Admin approve registration error', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi phê duyệt đăng ký'));
  }
});

/**
 * POST /api/core/admin/registrations/:id/reject
 * Reject a registration
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const updated = await prisma.dangKyHoatDong.update({
      where: { id },
      data: { trang_thai_dk: 'tu_choi', ly_do_tu_choi: reason || null, ngay_duyet: new Date() }
    });
    logInfo('Admin rejected registration', { id, by: req.user?.sub });
    return sendResponse(res, 200, ApiResponse.success(updated, 'Từ chối đăng ký thành công'));
  } catch (error) {
    logError('Admin reject registration error', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi từ chối đăng ký'));
  }
});

/**
 * POST /api/core/admin/registrations/bulk
 * Bulk approve/reject registrations
 */
router.post('/bulk', async (req, res) => {
  try {
    const { ids = [], action, reason } = req.body || {};
    const result = await registrationsService.bulkUpdate(ids, action, reason, req.user);
    return sendResponse(res, 200, ApiResponse.success(result, result.message));
  } catch (error) {
    logError('Admin bulk update registrations error', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi cập nhật hàng loạt'));
  }
});

module.exports = router;




