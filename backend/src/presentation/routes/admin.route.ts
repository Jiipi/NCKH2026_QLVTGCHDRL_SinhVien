/**
 * Admin Route
 * Admin-only routes for system management
 * @module presentation/routes/admin
 */

import { Router, Request, Response } from 'express';
import notificationTypesRepository from '../../modules/notification-types/data/repositories/notification-types.repository';
import ListNotificationTypesUseCase from '../../modules/notification-types/business/services/ListNotificationTypesUseCase';
import GetNotificationTypeByIdUseCase from '../../modules/notification-types/business/services/GetNotificationTypeByIdUseCase';
import CreateNotificationTypeUseCase from '../../modules/notification-types/business/services/CreateNotificationTypeUseCase';
import UpdateNotificationTypeUseCase from '../../modules/notification-types/business/services/UpdateNotificationTypeUseCase';
import DeleteNotificationTypeUseCase from '../../modules/notification-types/business/services/DeleteNotificationTypeUseCase';
import { auth, requireAdmin } from '../../core/http/middleware/authJwt';
import { prisma } from '../../data/infrastructure/prisma/client';
import { logError, logInfo } from '../../core/logger';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';

// Import V2 modules
import * as rolesV2 from '../../modules/roles';

// Initialize use cases
const listNotificationTypesUseCase = new ListNotificationTypesUseCase(notificationTypesRepository);
const getNotificationTypeByIdUseCase = new GetNotificationTypeByIdUseCase(notificationTypesRepository);
const createNotificationTypeUseCase = new CreateNotificationTypeUseCase(notificationTypesRepository);
const updateNotificationTypeUseCase = new UpdateNotificationTypeUseCase(notificationTypesRepository);
const deleteNotificationTypeUseCase = new DeleteNotificationTypeUseCase(notificationTypesRepository);

const router = Router();

// Extend Request type for auth
interface AuthRequest extends Request {
  user?: {
    id?: string;
    sub?: string;
  };
}

// Safe require for legacy controllers
const safeRequire = (p: string): any => {
  try {
    return require(p);
  } catch (e) {
    return null;
  }
};

const AdminRegistrationsController = safeRequire('../controllers/admin.registrations.controller') || {
  list: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy registrations endpoint not implemented' }),
  export: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy registrations export not implemented' }),
  approve: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy registrations approve not implemented' }),
  reject: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy registrations reject not implemented' }),
  bulkUpdate: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy registrations bulk update not implemented' })
};

const AdminReportsController = safeRequire('../controllers/admin.reports.controller') || {
  getOverview: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy reports overview not implemented' }),
  exportActivities: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy reports export activities not implemented' }),
  exportRegistrations: (req: Request, res: Response) => res.status(501).json({ success: false, message: 'Legacy reports export registrations not implemented' })
};

// Tất cả routes admin đều yêu cầu auth và role admin
router.use(auth);
router.use(requireAdmin);

// ==================== V2 ROUTES ====================

// ✅ Roles management - Using V2 module (Repository Pattern)
router.use('/roles', rolesV2.routes);

// Force reload permissions cache (useful after updating roles)
router.post('/roles/reload-cache', (req: AuthRequest, res: Response) => {
  try {
    // Note: invalidateAllRoleCache function should be implemented in policies module
    // For now, just log and return success
    logInfo('Permissions cache reload requested', { adminId: req.user?.sub });
    return res.json({ success: true, message: 'Cache reload requested (not implemented)' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi reload cache' });
  }
});

// ==================== LEGACY ROUTES (Registrations) ====================

router.get('/registrations', AdminRegistrationsController.list);
router.get('/registrations/export', AdminRegistrationsController.export);
router.post('/registrations/:id/approve', AdminRegistrationsController.approve);
router.post('/registrations/:id/reject', AdminRegistrationsController.reject);
router.post('/registrations/bulk', AdminRegistrationsController.bulkUpdate);

// Reports & exports
router.get('/reports/overview', AdminReportsController.getOverview);
router.get('/reports/export/activities', AdminReportsController.exportActivities);
router.get('/reports/export/registrations', AdminReportsController.exportRegistrations);

// ==================== NOTIFICATIONS MANAGEMENT ====================

router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, loai_tb_id, muc_do_uu_tien, da_doc } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const where: any = {
      ...(loai_tb_id ? { loai_tb_id } : {}),
      ...(muc_do_uu_tien ? { muc_do_uu_tien } : {}),
      ...(da_doc !== undefined ? { da_doc: da_doc === 'true' } : {}),
      ...(search ? { 
        OR: [
          { tieu_de: { contains: search, mode: 'insensitive' } },
          { noi_dung: { contains: search, mode: 'insensitive' } }
        ] 
      } : {})
    };
    
    const [items, total] = await Promise.all([
      prisma.thongBao.findMany({ 
        where, 
        skip, 
        take,
        orderBy: { ngay_gui: 'desc' },
        include: {
          loai_tb: true,
          nguoi_gui: { select: { id: true, ho_ten: true, email: true } },
          nguoi_nhan: { select: { id: true, ho_ten: true, email: true } }
        }
      }),
      prisma.thongBao.count({ where })
    ]);
    
    return sendResponse(res, 200, ApiResponse.success({ 
      items, 
      total, 
      page: parseInt(page), 
      limit: take,
      totalPages: Math.ceil(total / take)
    }));
  } catch (e) {
    logError('Admin notifications list error', e as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách thông báo'));
  }
});

router.get('/notifications/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await prisma.thongBao.findUnique({
      where: { id },
      include: {
        loai_tb: true,
        nguoi_gui: { select: { id: true, ho_ten: true, email: true, anh_dai_dien: true } },
        nguoi_nhan: { select: { id: true, ho_ten: true, email: true, anh_dai_dien: true } }
      }
    });

    if (!notification) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
    }

    return sendResponse(res, 200, ApiResponse.success(notification));
  } catch (e) {
    logError('Admin notification getById error', e as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết thông báo'));
  }
});

router.post('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const { tieu_de, noi_dung, loai_tb_id, nguoi_nhan_id, muc_do_uu_tien = 'trung_binh', phuong_thuc_gui = 'trong_he_thong' } = req.body || {};
    if (!tieu_de || !noi_dung || !nguoi_nhan_id) {
      return sendResponse(res, 400, ApiResponse.error('Thiếu thông tin bắt buộc'));
    }
    const nguoi_gui_id = req.user?.sub || req.user?.id;
    const item = await prisma.thongBao.create({
      data: {
        tieu_de,
        noi_dung,
        loai_tb_id,
        nguoi_gui_id,
        nguoi_nhan_id,
        muc_do_uu_tien,
        phuong_thuc_gui,
        ngay_gui: new Date(),
        trang_thai_gui: 'da_gui'
      }
    });
    return sendResponse(res, 201, ApiResponse.success(item, 'Tạo thông báo thành công'));
  } catch (e) {
    logError('Admin notification create error', e as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi tạo thông báo'));
  }
});

router.put('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await prisma.thongBao.update({
      where: { id },
      data: { da_doc: true, ngay_doc: new Date() }
    });

    return sendResponse(res, 200, ApiResponse.success(notification, 'Đã đánh dấu thông báo là đã đọc'));
  } catch (e) {
    logError('Admin notification markAsRead error', e as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi đánh dấu thông báo'));
  }
});

router.delete('/notifications/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.thongBao.delete({ where: { id: req.params.id } });
    return sendResponse(res, 200, ApiResponse.success(null, 'Xóa thông báo thành công'));
  } catch (e) {
    logError('Admin notification delete error', e as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi xóa thông báo'));
  }
});

// ==================== NOTIFICATION TYPES MANAGEMENT ====================

router.get('/notification-types', async (req: AuthRequest, res: Response) => {
  try {
    const items = await listNotificationTypesUseCase.execute();
    return sendResponse(res, 200, ApiResponse.success(items));
  } catch (e) {
    logError('Admin notification types list error', e as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy loại thông báo'));
  }
});

router.get('/notification-types/:id', async (req: AuthRequest, res: Response) => {
  try {
    const type = await getNotificationTypeByIdUseCase.execute(req.params.id);
    if (!type) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy loại thông báo'));
    }
    return sendResponse(res, 200, ApiResponse.success(type));
  } catch (e) {
    logError('Admin notification type getById error', e as Error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết loại thông báo'));
  }
});

router.post('/notification-types', async (req: AuthRequest, res: Response) => {
  try {
    const item = await createNotificationTypeUseCase.execute(req.body);
    return sendResponse(res, 201, ApiResponse.success(item, 'Tạo loại thông báo thành công'));
  } catch (e) {
    const err = e as Error;
    logError('Admin notification type create error', err);
    const statusCode = err.message.includes('bắt buộc') || err.message.includes('tồn tại') ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi tạo loại thông báo'));
  }
});

router.put('/notification-types/:id', async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateNotificationTypeUseCase.execute(req.params.id, req.body);
    return sendResponse(res, 200, ApiResponse.success(updated, 'Cập nhật loại thông báo thành công'));
  } catch (e) {
    const err = e as Error;
    logError('Admin notification type update error', err);
    const statusCode = err.message.includes('Không tìm thấy') ? 404 : (err.message.includes('bắt buộc') || err.message.includes('tồn tại') ? 400 : 500);
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi cập nhật loại thông báo'));
  }
});

router.delete('/notification-types/:id', async (req: AuthRequest, res: Response) => {
  try {
    await deleteNotificationTypeUseCase.execute(req.params.id);
    return sendResponse(res, 200, ApiResponse.success(null, 'Xóa loại thông báo thành công'));
  } catch (e) {
    const err = e as Error;
    logError('Admin notification type delete error', err);
    const statusCode = err.message.includes('đang được sử dụng') ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi xóa loại thông báo'));
  }
});

export default router;
