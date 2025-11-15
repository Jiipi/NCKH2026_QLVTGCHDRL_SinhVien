const { Router } = require('express');
// ❌ REMOVED: AdminController - Migrated to V2 services (admin-users, admin-reports, broadcast)
// ❌ REMOVED: AdminActivityTypesController - Migrated to V2 modules/activity-types
// ❌ REMOVED: All admin controllers - Migrated to V2 modules
const notificationsService = require('../modules/notifications/notifications.service');
const notificationTypesService = require('../modules/notification-types/notification-types.service');
const { auth, requireAdmin } = require('../core/http/middleware/authJwt');
const { enforceAdminWritable } = require('../core/http/middleware/semesterLock.middleware');
const { requirePermission } = require('../core/policies');

// Import V2 modules
const rolesV2 = require('../modules/roles');

const router = Router();

// Optional legacy controllers (may be removed in refactor). Provide safe stubs
// so the legacy routes don't crash the app if controllers are absent.
const safeRequire = (p) => {
  try {
    return require(p);
  } catch (e) {
    return null;
  }
};

const AdminRegistrationsController = safeRequire('../controllers/admin.registrations.controller') || {
  list: (req, res) => res.status(501).json({ success: false, message: 'Legacy registrations endpoint not implemented' }),
  export: (req, res) => res.status(501).json({ success: false, message: 'Legacy registrations export not implemented' }),
  approve: (req, res) => res.status(501).json({ success: false, message: 'Legacy registrations approve not implemented' }),
  reject: (req, res) => res.status(501).json({ success: false, message: 'Legacy registrations reject not implemented' }),
  bulkUpdate: (req, res) => res.status(501).json({ success: false, message: 'Legacy registrations bulk update not implemented' })
};

const AdminReportsController = safeRequire('../controllers/admin.reports.controller') || {
  getOverview: (req, res) => res.status(501).json({ success: false, message: 'Legacy reports overview not implemented' }),
  exportActivities: (req, res) => res.status(501).json({ success: false, message: 'Legacy reports export activities not implemented' }),
  exportRegistrations: (req, res) => res.status(501).json({ success: false, message: 'Legacy reports export registrations not implemented' })
};

// Tất cả routes admin đều yêu cầu auth và role admin
router.use(auth);
router.use(requireAdmin);

// ==================== V1 ROUTES (LEGACY - DEPRECATED) ====================
// ⚠️ WARNING: These routes are deprecated. Use V2 routes instead:
//    - /api/core/dashboard/admin (replaces /admin/dashboard)
//    - /api/core/admin/users/* (replaces /admin/users/*)
//    - /api/core/admin/reports/classes (replaces /admin/classes)
//    - /api/core/broadcast/* (replaces /admin/notifications/broadcast/*)
//    - /api/core/activities/* (replaces /admin/activities/*)
//    - /api/core/activity-types/* (replaces /admin/activity-types/*)
//    - /api/core/admin/reports/attendance (replaces /admin/attendance)
//    - /api/core/admin/reports/users/:id/points (replaces /admin/users/:id/points)

// Dashboard routes - ⚠️ DEPRECATED: Use /api/core/dashboard/admin
// router.get('/dashboard', AdminController.getDashboard);

// User management routes - ⚠️ DEPRECATED: Use /api/core/admin/users/*
// router.get('/users', AdminController.getUsers);
// router.get('/users/:id', AdminController.getUserById);
// router.get('/users/:id/points', AdminController.getUserPoints);
// router.post('/users', AdminController.createUser);
// router.put('/users/:id', AdminController.updateUser);
// router.delete('/users/:id', AdminController.deleteUser);
// router.get('/users/export', AdminController.exportUsers);

// Classes routes - ⚠️ DEPRECATED: Use /api/core/admin/reports/classes
// router.get('/classes', AdminController.getClasses);

// Broadcast statistics - ⚠️ DEPRECATED: Use /api/core/broadcast/*
// router.get('/notifications/broadcast/stats', AdminController.getBroadcastStats);
// router.get('/notifications/broadcast/history', AdminController.getBroadcastHistory);

// Activities management routes - ⚠️ DEPRECATED: Use /api/core/activities/*
// router.get('/activities', AdminController.getActivities);
// router.get('/activities/:id', AdminController.getActivityById);
// router.post('/activities', enforceAdminWritable, AdminController.createActivity);
// router.put('/activities/:id', enforceAdminWritable, AdminController.updateActivity);
// router.delete('/activities/:id', AdminController.deleteActivity);
// router.post('/activities/:id/approve', AdminController.approveActivity);
// router.post('/activities/:id/reject', AdminController.rejectActivity);

// ✅ Roles management - Using V2 module (Repository Pattern)
// Proxy V1 routes to V2 for backward compatibility
router.use('/roles', rolesV2.routes);

// Force reload permissions cache (useful after updating roles)
router.post('/roles/reload-cache', (req, res) => {
  try {
    const { invalidateAllRoleCache } = require('../core/policies');
    invalidateAllRoleCache();
    const { logInfo } = require('../core/logger');
    logInfo('Permissions cache manually reloaded', { adminId: req.user?.sub });
    return res.json({ success: true, message: 'Đã reload toàn bộ cache phân quyền' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi reload cache' });
  }
});

// Activity Types management - ⚠️ DEPRECATED: Use /api/core/activity-types/*
// router.get('/activity-types', requirePermission('activityTypes.read'), AdminActivityTypesController.list);
// router.get('/activity-types/:id', requirePermission('activityTypes.read'), AdminActivityTypesController.getById);
// router.post('/activity-types', requirePermission('activityTypes.write'), AdminActivityTypesController.create);
// router.put('/activity-types/:id', requirePermission('activityTypes.write'), AdminActivityTypesController.update);
// router.delete('/activity-types/:id', requirePermission('activityTypes.delete'), AdminActivityTypesController.remove);

// Registrations management (⚠️ TODO: Check if modules/registrations covers this)
router.get('/registrations', AdminRegistrationsController.list);
router.get('/registrations/export', AdminRegistrationsController.export);
router.post('/registrations/:id/approve', AdminRegistrationsController.approve);
router.post('/registrations/:id/reject', AdminRegistrationsController.reject);
router.post('/registrations/bulk', AdminRegistrationsController.bulkUpdate);

// Attendance management - ⚠️ DEPRECATED: Use /api/core/admin/reports/attendance
// router.get('/attendance', AdminController.getAttendance);

// Reports & exports (⚠️ TODO: Migrate to services/admin-reports.service.js)
router.get('/reports/overview', AdminReportsController.getOverview);
router.get('/reports/export/activities', AdminReportsController.exportActivities);
router.get('/reports/export/registrations', AdminReportsController.exportRegistrations);

// Notifications management - Use V2 modules
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, loai_tb_id, muc_do_uu_tien, da_doc } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const where = {
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
    
    const { prisma } = require('../infrastructure/prisma/client');
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
    
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    return sendResponse(res, 200, ApiResponse.success({ 
      items, 
      total, 
      page: parseInt(page), 
      limit: take,
      totalPages: Math.ceil(total / take)
    }));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notifications list error', e);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách thông báo'));
  }
});

router.get('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { prisma } = require('../infrastructure/prisma/client');
    const notification = await prisma.thongBao.findUnique({
      where: { id },
      include: {
        loai_tb: true,
        nguoi_gui: { select: { id: true, ho_ten: true, email: true, anh_dai_dien: true } },
        nguoi_nhan: { select: { id: true, ho_ten: true, email: true, anh_dai_dien: true } }
      }
    });

    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    if (!notification) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông báo'));
    }

    return sendResponse(res, 200, ApiResponse.success(notification));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification getById error', e);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết thông báo'));
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { tieu_de, noi_dung, loai_tb_id, nguoi_nhan_id, muc_do_uu_tien = 'trung_binh', phuong_thuc_gui = 'trong_he_thong' } = req.body || {};
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    if (!tieu_de || !noi_dung || !nguoi_nhan_id) {
      return sendResponse(res, 400, ApiResponse.error('Thiếu thông tin bắt buộc'));
    }
    const nguoi_gui_id = req.user?.sub || req.user?.id;
    const { prisma } = require('../infrastructure/prisma/client');
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
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification create error', e);
    return sendResponse(res, 500, ApiResponse.error('Lỗi tạo thông báo'));
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { prisma } = require('../infrastructure/prisma/client');
    const notification = await prisma.thongBao.update({
      where: { id },
      data: { da_doc: true, ngay_doc: new Date() }
    });

    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    return sendResponse(res, 200, ApiResponse.success(notification, 'Đã đánh dấu thông báo là đã đọc'));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification markAsRead error', e);
    return sendResponse(res, 500, ApiResponse.error('Lỗi đánh dấu thông báo'));
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    const { prisma } = require('../infrastructure/prisma/client');
    await prisma.thongBao.delete({ where: { id: req.params.id } });
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    return sendResponse(res, 200, ApiResponse.success(null, 'Xóa thông báo thành công'));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification delete error', e);
    return sendResponse(res, 500, ApiResponse.error('Lỗi xóa thông báo'));
  }
});

// Notification types management - Use V2 modules
router.get('/notification-types', async (req, res) => {
  try {
    const items = await notificationTypesService.list();
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    return sendResponse(res, 200, ApiResponse.success(items));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification types list error', e);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy loại thông báo'));
  }
});

router.get('/notification-types/:id', async (req, res) => {
  try {
    const type = await notificationTypesService.getById(req.params.id);
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    if (!type) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy loại thông báo'));
    }
    return sendResponse(res, 200, ApiResponse.success(type));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification type getById error', e);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết loại thông báo'));
  }
});

router.post('/notification-types', async (req, res) => {
  try {
    const item = await notificationTypesService.create(req.body);
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    return sendResponse(res, 201, ApiResponse.success(item, 'Tạo loại thông báo thành công'));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification type create error', e);
    const statusCode = e.message.includes('bắt buộc') || e.message.includes('tồn tại') ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(e.message || 'Lỗi tạo loại thông báo'));
  }
});

router.put('/notification-types/:id', async (req, res) => {
  try {
    const updated = await notificationTypesService.update(req.params.id, req.body);
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    return sendResponse(res, 200, ApiResponse.success(updated, 'Cập nhật loại thông báo thành công'));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification type update error', e);
    const statusCode = e.message.includes('Không tìm thấy') ? 404 : (e.message.includes('bắt buộc') || e.message.includes('tồn tại') ? 400 : 500);
    return sendResponse(res, statusCode, ApiResponse.error(e.message || 'Lỗi cập nhật loại thông báo'));
  }
});

router.delete('/notification-types/:id', async (req, res) => {
  try {
    await notificationTypesService.delete(req.params.id);
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    return sendResponse(res, 200, ApiResponse.success(null, 'Xóa loại thông báo thành công'));
  } catch (e) {
    const { logError } = require('../core/logger');
    const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
    logError('Admin notification type delete error', e);
    const statusCode = e.message.includes('đang được sử dụng') ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(e.message || 'Lỗi xóa loại thông báo'));
  }
});

module.exports = router;



