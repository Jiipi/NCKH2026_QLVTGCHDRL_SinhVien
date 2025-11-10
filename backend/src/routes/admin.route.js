const { Router } = require('express');
// ❌ REMOVED: AdminController - Migrated to V2 services (admin-users, admin-reports, broadcast)
// ❌ REMOVED: AdminActivityTypesController - Migrated to V2 modules/activity-types
const AdminRolesController = require('../controllers/admin.roles.controller');
const AdminRegistrationsController = require('../controllers/admin.registrations.controller');
const AdminReportsController = require('../controllers/admin.reports.controller');
const AdminNotificationsController = require('../controllers/admin.notifications.controller');
const { auth, requireAdmin } = require('../middlewares/auth');
const { enforceAdminWritable } = require('../middlewares/semesterLock.middleware');
const { requirePermission } = require('../middlewares/rbac');

const router = Router();

// Tất cả routes admin đều yêu cầu auth và role admin
router.use(auth);
router.use(requireAdmin);

// ==================== V1 ROUTES (LEGACY - DEPRECATED) ====================
// ⚠️ WARNING: These routes are deprecated. Use V2 routes instead:
//    - /api/v2/dashboard/admin (replaces /admin/dashboard)
//    - /api/v2/admin/users/* (replaces /admin/users/*)
//    - /api/v2/admin/reports/classes (replaces /admin/classes)
//    - /api/v2/broadcast/* (replaces /admin/notifications/broadcast/*)
//    - /api/v2/activities/* (replaces /admin/activities/*)
//    - /api/v2/activity-types/* (replaces /admin/activity-types/*)
//    - /api/v2/admin/reports/attendance (replaces /admin/attendance)
//    - /api/v2/admin/reports/users/:id/points (replaces /admin/users/:id/points)

// Dashboard routes - ⚠️ DEPRECATED: Use /api/v2/dashboard/admin
// router.get('/dashboard', AdminController.getDashboard);

// User management routes - ⚠️ DEPRECATED: Use /api/v2/admin/users/*
// router.get('/users', AdminController.getUsers);
// router.get('/users/:id', AdminController.getUserById);
// router.get('/users/:id/points', AdminController.getUserPoints);
// router.post('/users', AdminController.createUser);
// router.put('/users/:id', AdminController.updateUser);
// router.delete('/users/:id', AdminController.deleteUser);
// router.get('/users/export', AdminController.exportUsers);

// Classes routes - ⚠️ DEPRECATED: Use /api/v2/admin/reports/classes
// router.get('/classes', AdminController.getClasses);

// Broadcast statistics - ⚠️ DEPRECATED: Use /api/v2/broadcast/*
// router.get('/notifications/broadcast/stats', AdminController.getBroadcastStats);
// router.get('/notifications/broadcast/history', AdminController.getBroadcastHistory);

// Activities management routes - ⚠️ DEPRECATED: Use /api/v2/activities/*
// router.get('/activities', AdminController.getActivities);
// router.get('/activities/:id', AdminController.getActivityById);
// router.post('/activities', enforceAdminWritable, AdminController.createActivity);
// router.put('/activities/:id', enforceAdminWritable, AdminController.updateActivity);
// router.delete('/activities/:id', AdminController.deleteActivity);
// router.post('/activities/:id/approve', AdminController.approveActivity);
// router.post('/activities/:id/reject', AdminController.rejectActivity);

// Roles management (⚠️ TODO: Migrate to V2)
router.get('/roles', AdminRolesController.list);
router.get('/roles/:id', AdminRolesController.getById);
router.post('/roles', AdminRolesController.create);
router.put('/roles/:id', AdminRolesController.update);
router.delete('/roles/:id', AdminRolesController.remove);
router.post('/roles/:id/assign', AdminRolesController.assignToUsers);
router.delete('/roles/:roleId/users/:userId', AdminRolesController.removeFromUser);

// Activity Types management - ⚠️ DEPRECATED: Use /api/v2/activity-types/*
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

// Attendance management - ⚠️ DEPRECATED: Use /api/v2/admin/reports/attendance
// router.get('/attendance', AdminController.getAttendance);

// Reports & exports (⚠️ TODO: Migrate to services/admin-reports.service.js)
router.get('/reports/overview', AdminReportsController.getOverview);
router.get('/reports/export/activities', AdminReportsController.exportActivities);
router.get('/reports/export/registrations', AdminReportsController.exportRegistrations);

// Notifications management (⚠️ TODO: Check if modules/notifications covers this)
router.get('/notifications', AdminNotificationsController.list);
router.get('/notifications/:id', AdminNotificationsController.getById);
router.post('/notifications', AdminNotificationsController.create);
// router.post('/notifications/broadcast', AdminController.broadcastNotification); // ⚠️ DEPRECATED: Use /api/v2/broadcast
router.put('/notifications/:id/read', AdminNotificationsController.markAsRead);
router.delete('/notifications/:id', AdminNotificationsController.remove);

// Notification types management
router.get('/notification-types', AdminNotificationsController.listTypes);
router.get('/notification-types/:id', AdminNotificationsController.getTypeById);
router.post('/notification-types', AdminNotificationsController.createType);
router.put('/notification-types/:id', AdminNotificationsController.updateType);
router.delete('/notification-types/:id', AdminNotificationsController.removeType);

module.exports = router;