/**
 * Application Routes
 * Mounts all module routes
 * @module app/routes
 */

import { Router, IRouter } from 'express';

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
router.get('/setup-admin', (req, res) => setupController.setupAdmin(req, res));

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
router.use('/core/activities', activitiesV2.routes);

// Registrations V2 - Registration management
import * as registrationsV2 from '../modules/registrations';
router.use('/core/registrations', registrationsV2.routes);

// Users V2 - User management
import * as usersV2 from '../modules/users';
router.use('/core/users', usersV2.routes);

// Classes V2 - Class management
import * as classesV2 from '../modules/classes';
router.use('/core/classes', classesV2.routes);

// Teachers V2 - Teacher-specific operations
import * as teachersV2 from '../modules/teachers';
router.use('/core/teachers', teachersV2.routes);

// Notifications V2 - Notification management
import * as notificationsV2 from '../modules/notifications';
router.use('/core/notifications', notificationsV2.routes);

// Points V2 - Student points and attendance
import * as pointsV2 from '../modules/points';
router.use('/core/points', pointsV2.routes);

// Dashboard V2 - Dashboard with statistics
import * as dashboardV2 from '../modules/dashboard';
router.use('/core/dashboard', dashboardV2.routes);

// Activity Types V2 - Activity type management
import * as activityTypesV2 from '../modules/activity-types';
router.use('/core/activity-types', activityTypesV2.routes);

// Broadcast V2 - Broadcast notifications (Admin only)
import broadcastV2 from '../presentation/routes/broadcast.route';
router.use('/core/broadcast', broadcastV2);

// Admin Users V2 - Admin user management (Admin only)
import * as adminUsersV2 from '../modules/admin-users';
router.use('/core/admin/users', adminUsersV2.routes);

// Admin Reports V2 - Admin reporting and analytics
import * as adminReportsV2 from '../modules/admin-reports';
router.use('/core/admin/reports', adminReportsV2.routes);

// Admin Registrations V2 - Registration management with counts/export
import adminRegistrationsV2 from '../presentation/routes/admin-registrations.route';
router.use('/core/admin/registrations', adminRegistrationsV2);

// Profile V2 - User profile management
import * as profileV2 from '../modules/profile';
router.use('/core/profile', profileV2.routes);

// Notification Types V2 - Notification type management
import * as notificationTypesV2 from '../modules/notification-types';
router.use('/core/notification-types', notificationTypesV2.routes);

// Roles V2 - Role and permission management
import * as rolesV2 from '../modules/roles';
router.use('/core/roles', rolesV2.routes);

// Search V2 - Global search functionality
import * as searchV2 from '../modules/search';
router.use('/core/search', searchV2.routes);

// Monitor V2 - Class monitor specific operations
import * as monitorV2 from '../modules/monitor';
router.use('/core/monitor', monitorV2.routes);

// Exports V2 - Data export functionality
import * as exportsV2 from '../modules/exports';
router.use('/core/exports', exportsV2.routes);

// Sessions V2 - Session tracking and activity monitoring
// Mounted under both /core/sessions and /sessions for backward compatibility
import sessionsV2 from '../presentation/routes/sessions.route';
router.use('/core/sessions', sessionsV2);
router.use('/sessions', sessionsV2); // legacy/non-core prefix fallback

// Departments V2 - Get unique department list from classes
import departmentsRoute from '../presentation/routes/departments.route';
router.use('/core/departments', departmentsRoute);

// Face Recognition V2 - Face detection and attendance
import { faceRoutes } from '../modules/face-recognition/presentation/routes';
router.use('/face', faceRoutes);

// ==================== ADDITIONAL ROUTES ====================
// Legacy routes removed - all routes now use modules

export default router;
