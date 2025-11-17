// src/routes/index.js
const { Router } = require('express');
const health = require('./health.route');
const users = require('./users.route');
const auth = require('./auth.route');
const admin = require('./admin.route');
const { auth: authMiddleware, requireAdmin, requireTeacher } = require('../core/http/middleware/authJwt');

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


// ==================== CORE ROUTES (NEW ARCHITECTURE) ====================
// Activities V2 - Using CRUD Factory pattern
const activitiesV2 = require('../modules/activities');
router.use('/core/activities', activitiesV2.routes);

// Registrations V2 - Using CRUD Factory pattern
const registrationsV2 = require('../modules/registrations');
router.use('/core/registrations', registrationsV2.routes);

// Users V2 - Using CRUD Factory pattern
const usersV2 = require('../modules/users');
router.use('/core/users', usersV2.routes);

// Classes V2 - Using CRUD Factory pattern
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

// Dashboard V2 - Student and admin dashboard with statistics
const dashboardV2 = require('../modules/dashboard');
router.use('/core/dashboard', dashboardV2.routes);

// Activity Types V2 - Activity type management (Admin only)
const activityTypesV2 = require('../modules/activity-types');
router.use('/core/activity-types', activityTypesV2.activityTypesRoutes);

// Broadcast V2 - Broadcast notifications (Admin only)
const broadcastV2 = require('./broadcast.route');
router.use('/core/broadcast', broadcastV2);

// Admin Users V2 - Admin user management (Admin only)
const adminUsersV2 = require('./admin-users.route');
router.use('/core/admin/users', adminUsersV2);

// Admin Reports V2 - Admin reporting and analytics (Admin only)
const adminReportsV2 = require('./admin-reports.route');
router.use('/core/admin/reports', adminReportsV2);

// Admin Registrations V2 - Alias of legacy registrations with counts/export
const adminRegistrationsV2 = require('./admin-registrations.route');
router.use('/core/admin/registrations', adminRegistrationsV2);

// Profile V2 - User profile management
const profileV2 = require('../modules/profile');
router.use('/core/profile', profileV2.routes);

// Monitor V2 - Class monitor operations
const monitorV2 = require('../modules/monitor');
router.use('/core/monitor', monitorV2.routes);

// Notification Types V2 - Notification type management (Admin only)
const notificationTypesV2 = require('../modules/notification-types');
router.use('/core/notification-types', notificationTypesV2.routes);

// Exports V2 - Data export functionality (Admin only)
const exportsV2 = require('../modules/exports');
router.use('/core/exports', exportsV2.routes);

// Roles V2 - Role management (Admin only)
const rolesV2 = require('../modules/roles');
router.use('/core/roles', rolesV2.routes);

// Search V2 - Global search functionality
const searchV2 = require('../modules/search');
router.use('/search', searchV2.routes);


// Upload routes (authenticated users only)
router.use('/upload', upload);

// Semesters routes (closure management)
router.use('/semesters', semesters);


// ==================== V1 COMPATIBILITY WRAPPER ROUTES ====================
// These routes provide backward compatibility for frontend still calling V1 endpoints
// All routes are proxied to V2 modules with appropriate data transformation
// Refactored into separate files for better maintainability
// const v1Routes = require('./v1');
//
// router.use('/class', v1Routes);           // /api/class/* → V1 Class Routes
// router.use('/teacher', v1Routes);         // /api/teacher/* → V1 Teacher Routes
// router.use('/activities', v1Routes);      // /api/activities/* → V1 Activities Routes
// router.use('/monitor', v1Routes);         // /api/monitor/* → V1 Class Routes (alias)
// router.use('/notifications', v1Routes);   // /api/notifications/* → V1 Notifications Routes


// Demo-only routes removed to avoid referencing removed roles

module.exports = router;



