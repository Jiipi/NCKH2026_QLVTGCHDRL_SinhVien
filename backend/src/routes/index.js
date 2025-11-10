// src/routes/index.js
const { Router } = require('express');
const health = require('./health.route');
const users = require('./users.route');
const auth = require('./auth.route');
const admin = require('./admin.route');
const { auth: authMiddleware, requireAdmin, requireTeacher } = require('../middlewares/auth');

const upload = require('./upload.route');
const semesters = require('./semesters.route');

const router = Router();

// Health check route
router.use('/health', health);

// Authentication routes
router.use('/auth', auth);

// Users routes (public và protected)
router.use('/users', users);

// Admin routes - comprehensive management
router.use('/admin', admin);


// ==================== V2 ROUTES (NEW ARCHITECTURE) ====================
// Activities V2 - Using CRUD Factory pattern
const activitiesV2 = require('../modules/activities');
router.use('/v2/activities', activitiesV2.routes);

// Registrations V2 - Using CRUD Factory pattern
const registrationsV2 = require('../modules/registrations');
router.use('/v2/registrations', registrationsV2.routes);

// Users V2 - Using CRUD Factory pattern
const usersV2 = require('../modules/users');
router.use('/v2/users', usersV2.routes);

// Classes V2 - Using CRUD Factory pattern
const classesV2 = require('../modules/classes');
router.use('/v2/classes', classesV2.routes);

// Teachers V2 - Teacher-specific operations
const teachersV2 = require('../modules/teachers');
router.use('/v2/teachers', teachersV2.routes);

// Notifications V2 - Notification management
const notificationsV2 = require('../modules/notifications');
router.use('/v2/notifications', notificationsV2.routes);

// Points V2 - Student points and attendance
const pointsV2 = require('../modules/points');
router.use('/v2/points', pointsV2.routes);

// Dashboard V2 - Student and admin dashboard with statistics
const dashboardV2 = require('../modules/dashboard');
router.use('/v2/dashboard', dashboardV2.routes);

// Activity Types V2 - Activity type management (Admin only)
const activityTypesV2 = require('../modules/activity-types');
router.use('/v2/activity-types', activityTypesV2.activityTypesRoutes);

// Broadcast V2 - Broadcast notifications (Admin only)
const broadcastV2 = require('./broadcast.route');
router.use('/v2/broadcast', broadcastV2);

// Admin Users V2 - Admin user management (Admin only)
const adminUsersV2 = require('./admin-users.route');
router.use('/v2/admin/users', adminUsersV2);

// Admin Reports V2 - Admin reporting and analytics (Admin only)
const adminReportsV2 = require('./admin-reports.route');
router.use('/v2/admin/reports', adminReportsV2);

// Admin Registrations V2 - Alias of legacy registrations with counts/export
const adminRegistrationsV2 = require('./admin-registrations.route');
router.use('/v2/admin/registrations', adminRegistrationsV2);

// Profile V2 - User profile management
const profileV2 = require('../modules/profile');
router.use('/v2/profile', profileV2.routes);

// Monitor V2 - Class monitor operations
const monitorV2 = require('../modules/monitor');
router.use('/v2/monitor', monitorV2.routes);

// Notification Types V2 - Notification type management (Admin only)
const notificationTypesV2 = require('../modules/notification-types');
router.use('/v2/notification-types', notificationTypesV2.routes);

// Exports V2 - Data export functionality (Admin only)
const exportsV2 = require('../modules/exports');
router.use('/v2/exports', exportsV2.routes);

// Roles V2 - Role management (Admin only)
const rolesV2 = require('../modules/roles');
router.use('/v2/roles', rolesV2.routes);


// Upload routes (authenticated users only)
router.use('/upload', upload);

// Semesters routes (closure management)
router.use('/semesters', semesters);


// ==================== V1 COMPATIBILITY WRAPPER ROUTES ====================
// These routes provide backward compatibility for frontend still calling V1 endpoints
// All routes are proxied to V2 modules with appropriate data transformation
const { classRouter, teacherRouter, activitiesRouter, monitorRouter, notificationsRouter } = require('./v1-compat.route');

router.use('/class', classRouter);        // /api/class/* → Monitor V2
router.use('/teacher', teacherRouter);      // /api/teacher/* → Teacher V2  
router.use('/activities', activitiesRouter);   // /api/activities → Activities V2
router.use('/monitor', monitorRouter);      // /api/monitor/* → Monitor V2
router.use('/notifications', notificationsRouter); // /api/notifications → V1 Controller


// Demo-only routes removed to avoid referencing removed roles

module.exports = router;