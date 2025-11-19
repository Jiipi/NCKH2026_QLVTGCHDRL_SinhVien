const express = require('express');
const router = express.Router();
const { createExportsController } = require('./presentation/exports.factory');
const { auth, requireAdmin } = require('../../core/http/middleware/authJwt');

const exportsController = createExportsController();

/**
 * @route   GET /api/core/exports/overview
 * @desc    Get overview statistics
 * @access  Private (Admin)
 */
router.get('/overview', auth, requireAdmin, (req, res) => exportsController.getOverview(req, res));

/**
 * @route   GET /api/core/exports/activities
 * @desc    Export activities to CSV
 * @access  Private (Admin)
 */
router.get('/activities', auth, requireAdmin, (req, res) => exportsController.exportActivities(req, res));

/**
 * @route   GET /api/core/exports/registrations
 * @desc    Export registrations to CSV
 * @access  Private (Admin)
 */
router.get('/registrations', auth, requireAdmin, (req, res) => exportsController.exportRegistrations(req, res));

module.exports = router;