/**
 * Admin Registrations Route
 * Admin routes for managing activity registrations
 * @module presentation/routes/admin-registrations
 */

import { Router, Request, Response } from 'express';
import { auth as authenticateJWT, requireAdmin } from '../../core/http/middleware/authJwt';
import RegistrationExportService from '../../modules/registrations/business/services/RegistrationExportService';
import RegistrationApprovalService from '../../modules/registrations/business/services/RegistrationApprovalService';
import registrationsRepository from '../../modules/registrations/data/repositories/registrations.repository';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';
import { logError, logInfo } from '../../core/logger';
import { parseSemesterString } from '../../core/utils/semester';
import { prisma } from '../../data/infrastructure/prisma/client';
import type { Prisma, HocKy, TrangThaiDangKy } from '@prisma/client';

// Initialize services
const exportService = new RegistrationExportService(registrationsRepository);
const approvalService = new RegistrationApprovalService(registrationsRepository);

const router = Router();

// Extend Request type for auth
interface AuthRequest extends Request {
  user?: {
    sub: string;
    id?: string;
    role: string;
  };
}

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * GET /api/core/admin/registrations
 * List registrations with filters and counts
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      status = 'cho_duyet', 
      search, 
      hoc_ky, 
      nam_hoc, 
      semester, 
      activityId, 
      classId 
    } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    logInfo('Admin registrations request', { semester, status, page, limit, classId });

    // Build semester filter
    let semesterWhere: Prisma.DangKyHoatDongWhereInput = {};
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (!parsed) {
        return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
      }
      logInfo('Parsed semester filter', { parsed });
      semesterWhere = {
        hoat_dong: {
          is: {
            hoc_ky: parsed.semester as HocKy,
            ...(parsed.year ? { nam_hoc: { startsWith: parsed.year } } : {})
          }
        }
      };
    } else if (hoc_ky || nam_hoc) {
      semesterWhere = {
        hoat_dong: {
          is: {
            ...(hoc_ky ? { hoc_ky: hoc_ky as HocKy } : {}),
            ...(nam_hoc ? { nam_hoc: { startsWith: nam_hoc } } : {})
          }
        }
      };
    }

    const where: Prisma.DangKyHoatDongWhereInput = {
      ...(status ? { trang_thai_dk: status as TrangThaiDangKy } : {}),
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
          hoat_dong: true,
          nguoi_duyet: { include: { vai_tro: true } }
        },
        orderBy: { ngay_dang_ky: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.dangKyHoatDong.count({ where })
    ]);

    // Counts per status
    const statuses = ['cho_duyet', 'da_duyet', 'tu_choi', 'da_tham_gia'] as const;
    const counts: Record<string, number> = {};
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
    logError('Admin registrations list error', error as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách đăng ký'));
  }
});

/**
 * GET /api/core/admin/registrations/export
 * Export registrations to Excel
 */
router.get('/export', async (req: AuthRequest, res: Response) => {
  try {
    const workbook = await exportService.exportRegistrations(req.query);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=dangky_hoatdong_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logError('Admin registrations export error', error as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi xuất Excel'));
  }
});

/**
 * POST /api/core/admin/registrations/:id/approve
 * Approve a registration
 */
router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const nguoiDuyetId = req.user?.sub;
    const updated = await prisma.dangKyHoatDong.update({
      where: { id },
      data: { 
        trang_thai_dk: 'da_duyet', 
        ly_do_tu_choi: null, 
        ngay_duyet: new Date(),
        nguoi_duyet_id: nguoiDuyetId 
      },
      include: {
        nguoi_duyet: { include: { vai_tro: true } }
      }
    });
    logInfo('Admin approved registration', { id, by: nguoiDuyetId });
    return sendResponse(res, 200, ApiResponse.success(updated, 'Phê duyệt đăng ký thành công'));
  } catch (error) {
    logError('Admin approve registration error', error as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi phê duyệt đăng ký'));
  }
});

/**
 * POST /api/core/admin/registrations/:id/reject
 * Reject a registration
 */
router.post('/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const nguoiDuyetId = req.user?.sub;
    const updated = await prisma.dangKyHoatDong.update({
      where: { id },
      data: { 
        trang_thai_dk: 'tu_choi', 
        ly_do_tu_choi: reason || null, 
        ngay_duyet: new Date(),
        nguoi_duyet_id: nguoiDuyetId 
      },
      include: {
        nguoi_duyet: { include: { vai_tro: true } }
      }
    });
    logInfo('Admin rejected registration', { id, by: nguoiDuyetId });
    return sendResponse(res, 200, ApiResponse.success(updated, 'Từ chối đăng ký thành công'));
  } catch (error) {
    logError('Admin reject registration error', error as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi từ chối đăng ký'));
  }
});

/**
 * POST /api/core/admin/registrations/bulk
 * Bulk approve/reject registrations
 */
router.post('/bulk', async (req: AuthRequest, res: Response) => {
  try {
    const { ids = [], action, reason } = req.body || {};
    const result = await approvalService.bulkUpdate(ids, action, reason, req.user);
    return sendResponse(res, 200, ApiResponse.success(result, result.message));
  } catch (error) {
    const err = error as Error & { name?: string };
    logError('Admin bulk update registrations error', err);
    const statusCode = err.name === 'ValidationError' ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi cập nhật hàng loạt'));
  }
});

export default router;
