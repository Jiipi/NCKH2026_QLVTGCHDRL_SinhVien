/**
 * Application Routes
 * Mounts all module routes
 * @module app/routes
 */

import { Router, IRouter } from 'express';
import { auth as authenticate } from '../core/http/middleware/authJwt';
import { requireDynamicPermission } from '../core/http/middleware';
import { validateAndInjectSemester } from './middleware/semesterMiddleware';
import { applyScope } from './scopes/scopeMiddleware';
import { qrAttendanceTokenService } from '../business/services/qr-attendance-token.service';
import { createActivitiesController } from '../modules/activities/presentation/activities.factory';
import { ApiResponse, sendResponse } from '../core/utils/response';

const router: IRouter = Router();

// ==================== LEGACY ROUTES (V1) ====================
// These routes are kept for backward compatibility
// Will be deprecated in future versions

// Health check
import healthRoute from '../presentation/routes/health.route';
router.use('/health', healthRoute);

// TEMPORARY: Setup Admin Route (remove after use)
import { SetupController } from '../presentation/controllers/setup.controller';
const setupController = new SetupController();
router.get('/setup-admin', (req, res) => {
	const setupEnabled = process.env.ENABLE_SETUP_ADMIN === 'true';
	const setupSecret = process.env.SETUP_ADMIN_SECRET;
	const providedSecret = req.header('x-setup-secret');

	if (!setupEnabled) {
		return res.status(404).json({
			success: false,
			message: 'Not found',
		});
	}

	if (!setupSecret || providedSecret !== setupSecret) {
		return res.status(403).json({
			success: false,
			message: 'Forbidden',
		});
	}

	return setupController.setupAdmin(req, res);
});

// Authentication (V2 - New Module Architecture - Refactored to 3 tiers)
import * as authModule from '../modules/auth';
router.use('/auth', authModule.routes);

// Users
import usersRoute from '../presentation/routes/users.route';
router.use('/users', usersRoute);

// Admin
import adminRoute from '../presentation/routes/admin.route';
router.use('/admin', adminRoute);

// Upload
import uploadRoute from '../presentation/routes/upload.route';
router.use('/upload', uploadRoute);

// Semesters (V2 - New Module Architecture)
import * as semestersModule from '../modules/semesters';
router.use('/semesters', semestersModule.routes);

// ==================== V2 ROUTES (NEW ARCHITECTURE) ====================
// These routes use the new module-based architecture with Repository pattern

// Activities V2 - Using repository pattern
import * as activitiesV2 from '../modules/activities';
const activitiesFallbackController = createActivitiesController();

router.get('/activities/:id/attendance/session/current', authenticate, validateAndInjectSemester(), applyScope('activities'), requireDynamicPermission('activities.read'), async (req, res) => {
	try {
		const session = await qrAttendanceTokenService.getCurrentSession(req.params.id);
		return sendResponse(res, 200, ApiResponse.success(session, 'Phiên QR hiện tại'));
	} catch (error: any) {
		return sendResponse(res, error?.statusCode || 500, ApiResponse.error(error?.message || 'Không lấy được phiên QR'));
	}
});

router.post('/activities/:id/attendance/session', authenticate, validateAndInjectSemester(), applyScope('activities'), requireDynamicPermission('attendance.write'), async (req, res) => {
	try {
		const userId = (req as any).user?.sub || (req as any).user?.id;
		if (!userId) return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
		const session = await qrAttendanceTokenService.createSession(req.params.id, userId, req.body?.ttlMinutes, {
			actorId: userId,
			ip: req.headers['x-forwarded-for']?.toString() || req.ip,
			userAgent: req.get('user-agent') || null
		});
		return sendResponse(res, 201, ApiResponse.success(session, 'Tạo phiên QR thành công'));
	} catch (error: any) {
		return sendResponse(res, error?.statusCode || 500, ApiResponse.error(error?.message || 'Không tạo được phiên QR'));
	}
});

router.post('/activities/:id/attendance/session/:sessionId/token', authenticate, validateAndInjectSemester(), applyScope('activities'), requireDynamicPermission('attendance.write'), async (req, res) => {
	try {
		const userId = (req as any).user?.sub || (req as any).user?.id;
		const token = await qrAttendanceTokenService.generateToken(req.params.id, req.params.sessionId, req.body?.ttlSeconds, {
			actorId: userId || null,
			ip: req.headers['x-forwarded-for']?.toString() || req.ip,
			userAgent: req.get('user-agent') || null
		});
		return sendResponse(res, 201, ApiResponse.success(token, 'Tạo mã QR động thành công'));
	} catch (error: any) {
		return sendResponse(res, error?.statusCode || 500, ApiResponse.error(error?.message || 'Không tạo được mã QR động'));
	}
});

router.post('/activities/:id/attendance/session/:sessionId/close', authenticate, validateAndInjectSemester(), applyScope('activities'), requireDynamicPermission('attendance.write'), async (req, res) => {
	try {
		const userId = (req as any).user?.sub || (req as any).user?.id;
		if (!userId) return sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập', 401));
		const session = await qrAttendanceTokenService.closeSession(req.params.id, req.params.sessionId, userId);
		return sendResponse(res, 200, ApiResponse.success(session, 'Đóng phiên QR thành công'));
	} catch (error: any) {
		return sendResponse(res, error?.statusCode || 500, ApiResponse.error(error?.message || 'Không đóng được phiên QR'));
	}
});

router.post('/activities/:id/attendance/scan', authenticate, validateAndInjectSemester(), applyScope('activities'), requireDynamicPermission('attendance.write'), (req, res) => {
	return activitiesFallbackController.scanAttendance(req as any, res);
});

router.use('/core/activities', authenticate, validateAndInjectSemester(), applyScope('activities'), activitiesV2.routes);

// Legacy activities routes (backward compatibility) - maps /activities to /core/activities
router.use('/activities', authenticate, validateAndInjectSemester(), applyScope('activities'), activitiesV2.routes);

// Registrations V2 - Registration management
import * as registrationsV2 from '../modules/registrations';
router.use('/core/registrations', authenticate, validateAndInjectSemester(), applyScope('registrations'), registrationsV2.routes);

// Users V2 - User management
import * as usersV2 from '../modules/users';
router.use('/core/users', authenticate, validateAndInjectSemester(), usersV2.routes);

// Classes V2 - Class management
import * as classesV2 from '../modules/classes';
router.use('/core/classes', authenticate, validateAndInjectSemester(), classesV2.routes);

// Teachers V2 - Teacher-specific operations
import * as teachersV2 from '../modules/teachers';
router.use('/core/teachers', authenticate, validateAndInjectSemester(), teachersV2.routes);

// Legacy teacher routes (backward compatibility) - maps /teacher/* to /core/teachers/*
router.use('/teacher', authenticate, validateAndInjectSemester(), teachersV2.routes);

// Notifications V2 - Notification management
import * as notificationsV2 from '../modules/notifications';
router.use('/core/notifications', authenticate, validateAndInjectSemester(), notificationsV2.routes);

// Points V2 - Student points and attendance
import * as pointsV2 from '../modules/points';
router.use('/core/points', authenticate, validateAndInjectSemester(), applyScope('points'), pointsV2.routes);

// Dashboard V2 - Dashboard with statistics
import * as dashboardV2 from '../modules/dashboard';
router.use('/core/dashboard', authenticate, validateAndInjectSemester(), applyScope('dashboard'), dashboardV2.routes);

// Activity Types V2 - Activity type management
import * as activityTypesV2 from '../modules/activity-types';
router.use('/core/activity-types', authenticate, validateAndInjectSemester(), activityTypesV2.routes);

// Broadcast V2 - Broadcast notifications (Admin only)
import broadcastV2 from '../presentation/routes/broadcast.route';
router.use('/core/broadcast', authenticate, validateAndInjectSemester(), broadcastV2);

// Admin Users V2 - Admin user management (Admin only)
import * as adminUsersV2 from '../modules/admin-users';
router.use('/core/admin/users', authenticate, validateAndInjectSemester(), adminUsersV2.routes);

// Admin Reports V2 - Admin reporting and analytics
import * as adminReportsV2 from '../modules/admin-reports';
router.use('/core/admin/reports', authenticate, validateAndInjectSemester(), adminReportsV2.routes);

// Admin Registrations V2 - Registration management with counts/export
import adminRegistrationsV2 from '../presentation/routes/admin-registrations.route';
router.use('/core/admin/registrations', authenticate, validateAndInjectSemester(), adminRegistrationsV2);

// Profile V2 - User profile management
import * as profileV2 from '../modules/profile';
router.use('/core/profile', authenticate, validateAndInjectSemester(), profileV2.routes);

// Notification Types V2 - Notification type management
import * as notificationTypesV2 from '../modules/notification-types';
router.use('/core/notification-types', authenticate, validateAndInjectSemester(), notificationTypesV2.routes);

// Roles V2 - Role and permission management
import * as rolesV2 from '../modules/roles';
router.use('/core/roles', authenticate, validateAndInjectSemester(), rolesV2.routes);

// Audit Integrity V2 - Admin-only tamper verification
import * as auditIntegrityV2 from '../modules/audit-integrity';
router.use('/core/admin/audit-integrity', authenticate, validateAndInjectSemester(), auditIntegrityV2.routes);

// Search V2 - Global search functionality
import * as searchV2 from '../modules/search';
router.use('/core/search', authenticate, validateAndInjectSemester(), searchV2.routes);

// Monitor V2 - Class monitor specific operations
import * as monitorV2 from '../modules/monitor';
router.use('/core/monitor', authenticate, validateAndInjectSemester(), monitorV2.routes);

// Exports V2 - Data export functionality
import * as exportsV2 from '../modules/exports';
router.use('/core/exports', authenticate, validateAndInjectSemester(), exportsV2.routes);

// Sessions V2 - Session tracking and activity monitoring
// Mounted under both /core/sessions and /sessions for backward compatibility
import sessionsV2 from '../presentation/routes/sessions.route';
router.use('/core/sessions', authenticate, validateAndInjectSemester(), sessionsV2);
router.use('/sessions', sessionsV2); // legacy/non-core prefix fallback

// Departments V2 - Get unique department list from classes
import departmentsRoute from '../presentation/routes/departments.route';
router.use('/core/departments', authenticate, validateAndInjectSemester(), departmentsRoute);

// Face Recognition V2 - Face detection and attendance
import { faceRoutes } from '../modules/face-recognition/presentation/routes';
router.use('/face', faceRoutes);

// ==================== ADDITIONAL ROUTES ====================
// Legacy routes removed - all routes now use modules

export default router;
