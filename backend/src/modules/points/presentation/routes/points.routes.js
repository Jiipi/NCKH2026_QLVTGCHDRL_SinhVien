/**
 * Points Routes (V2)
 * RESTful endpoints for student points and attendance operations
 */

const express = require('express');
const router = express.Router();
const { createPointsController } = require('../points.factory');
const { auth: authenticateJWT, requireDynamicPermission } = require('../../../../core/http/middleware');

const pointsController = createPointsController();

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * GET /api/core/points/summary
 * Get points summary for current student
 * Requires: scores.read permission
 */
router.get('/summary', requireDynamicPermission('scores.read'), (req, res) => pointsController.getPointsSummary(req, res));

/**
 * GET /api/core/points/detail
 * Get detailed points with pagination
 * Requires: scores.read permission
 */
router.get('/detail', requireDynamicPermission('scores.read'), (req, res) => pointsController.getPointsDetail(req, res));

/**
 * GET /api/core/points/attendance-history
 * Get attendance history
 * Requires: attendance.read permission
 */
router.get('/attendance-history', requireDynamicPermission('attendance.read'), (req, res) => pointsController.getAttendanceHistory(req, res));

/**
 * GET /api/core/points/filter-options
 * Get available semesters and academic years
 */
router.get('/filter-options', (req, res) => pointsController.getFilterOptions(req, res));

/**
 * GET /api/core/points/report
 * Get points report by academic year
 */
router.get('/report', (req, res) => pointsController.getPointsReport(req, res));

module.exports = router;
