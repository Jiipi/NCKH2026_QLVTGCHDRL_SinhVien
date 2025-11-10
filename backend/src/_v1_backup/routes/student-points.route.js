// ⚠️ DEPRECATED V1 STUDENT POINTS ROUTE
// This file is deprecated. Use V2 routes instead:
//   - /api/v2/points/* (all student points operations)

const { Router } = require('express');
// ❌ REMOVED: const studentPointsController = require('../controllers/student-points.controller');
// Controller deleted - migrated to modules/points/
const { auth: authMiddleware } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// ⚠️ ALL ROUTES DEPRECATED - Use /api/v2/points/* instead
// U6: Xem điểm rèn luyện cá nhân (Sinh viên)
// router.get('/summary', requirePermission('points.view_own'), studentPointsController.getPointsSummary.bind(studentPointsController));
// router.get('/detail', requirePermission('points.view_own'), studentPointsController.getPointsDetail.bind(studentPointsController));
// router.get('/attendance-history', requirePermission('points.view_own'), studentPointsController.getAttendanceHistory.bind(studentPointsController));
// router.get('/report', requirePermission('points.view_own'), studentPointsController.getPointsReport.bind(studentPointsController));
// router.get('/filter-options', requirePermission('points.view_own'), studentPointsController.getFilterOptions.bind(studentPointsController));

module.exports = router;