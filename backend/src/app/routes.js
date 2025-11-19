/**
 * Application Routes
 * Mounts all module routes
 */

const { Router } = require('express');

const router = Router();

// ==================== LEGACY ROUTES (V1) ====================
// These routes are kept for backward compatibility
// Will be deprecated in future versions

// Health check
const healthRoute = require('../routes/health.route');
router.use('/health', healthRoute);

// Authentication (V2 - New Module Architecture)
const authModule = require('../modules/auth');
router.use('/auth', authModule.routes);

// Users
const usersRoute = require('../routes/users.route');
router.use('/users', usersRoute);

// Admin
const adminRoute = require('../routes/admin.route');
router.use('/admin', adminRoute);

// Upload
const uploadRoute = require('../routes/upload.route');
router.use('/upload', uploadRoute);

// Semesters (V2 - New Module Architecture)
const semestersModule = require('../modules/semesters');
router.use('/semesters', semestersModule.routes);

// ==================== V2 ROUTES (NEW ARCHITECTURE) ====================
// These routes use the new module-based architecture with Repository pattern

// Activities V2 - Using repository pattern
const activitiesV2 = require('../modules/activities');
router.use('/core/activities', activitiesV2.routes);

// Registrations V2 - Registration management
const registrationsV2 = require('../modules/registrations');
router.use('/core/registrations', registrationsV2.routes);

// Users V2 - User management
const usersV2 = require('../modules/users');
router.use('/core/users', usersV2.routes);

// Classes V2 - Class management
const classesV2 = require('../modules/classes');
router.use('/core/classes', classesV2.routes);

// Teachers V2 - Teacher-specific operations
const teachersV2 = require('../modules/teachers');
router.use('/core/teachers', teachersV2.routes);

// Notifications V2 - Notification management
const notificationsV2 = require('../modules/notifications');
router.use('/core/notifications', notificationsV2.routes);

// Points V2 - Student points and attendance
const pointsV2 = require('../modules/points');
router.use('/core/points', pointsV2.routes);

// Dashboard V2 - Dashboard with statistics
const dashboardV2 = require('../modules/dashboard');
router.use('/core/dashboard', dashboardV2.routes);

// Activity Types V2 - Activity type management
const activityTypesV2 = require('../modules/activity-types');
router.use('/core/activity-types', activityTypesV2.activityTypesRoutes);

// Broadcast V2 - Broadcast notifications (Admin only)
const broadcastV2 = require('../routes/broadcast.route');
router.use('/core/broadcast', broadcastV2);

// Admin Users V2 - Admin user management (Admin only)
const adminUsersV2 = require('../modules/admin-users');
router.use('/core/admin/users', adminUsersV2.routes);

// Admin Reports V2 - Admin reporting and analytics
const adminReportsV2 = require('../modules/admin-reports');
router.use('/core/admin/reports', adminReportsV2.routes);

// Admin Registrations V2 - Registration management with counts/export
const adminRegistrationsV2 = require('../routes/admin-registrations.route');
router.use('/core/admin/registrations', adminRegistrationsV2);

// Profile V2 - User profile management
const profileV2 = require('../modules/profile');
router.use('/core/profile', profileV2.routes);

// Notification Types V2 - Notification type management
const notificationTypesV2 = require('../modules/notification-types');
router.use('/core/notification-types', notificationTypesV2.routes);

// Roles V2 - Role and permission management
const rolesV2 = require('../modules/roles');
router.use('/core/roles', rolesV2.routes);

// Search V2 - Global search functionality
const searchV2 = require('../modules/search');
router.use('/core/search', searchV2.routes);

// Monitor V2 - Class monitor specific operations
const monitorV2 = require('../modules/monitor');
router.use('/core/monitor', monitorV2.routes);

// Exports V2 - Data export functionality
const exportsV2 = require('../modules/exports');
router.use('/core/exports', exportsV2.routes);

// Sessions V2 - Session tracking and activity monitoring
// Mounted under both /core/sessions and /sessions for backward compatibility
const sessionsV2 = require('../routes/sessions.route');
router.use('/core/sessions', sessionsV2);
router.use('/sessions', sessionsV2); // legacy/non-core prefix fallback

// ==================== ADDITIONAL ROUTES ====================

// Activities route (legacy, kept for compatibility)
try {
  const activitiesLegacy = require('../routes/activities.route');
  router.use('/activities', activitiesLegacy);
} catch (e) {
  // Ignore if route doesn't exist
}


module.exports = router;




