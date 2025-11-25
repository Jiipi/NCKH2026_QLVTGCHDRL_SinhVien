const express = require('express');
const router = express.Router();
const { createMonitorController } = require('../monitor.factory');
const { auth, isClassMonitor } = require('../../../../core/http/middleware');

const monitorController = createMonitorController();

/**
 * @route   GET /api/core/monitor/students
 * @desc    Get all students in monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/students', auth, isClassMonitor, (req, res) => monitorController.getClassStudents(req, res));

/**
 * @route   GET /api/core/monitor/registrations
 * @desc    Get registrations for monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/registrations', auth, isClassMonitor, (req, res) => monitorController.getPendingRegistrations(req, res));

/**
 * @route   GET /api/core/monitor/registrations/pending-count
 * @desc    Get count of pending registrations
 * @access  Private (Class Monitor)
 */
router.get('/registrations/pending-count', auth, isClassMonitor, (req, res) => monitorController.getPendingRegistrationsCount(req, res));

/**
 * @route   PUT /api/core/monitor/registrations/:registrationId/approve
 * @desc    Approve a registration
 * @access  Private (Class Monitor)
 */
router.put('/registrations/:registrationId/approve', auth, isClassMonitor, (req, res) => monitorController.approveRegistration(req, res));

/**
 * @route   PUT /api/core/monitor/registrations/:registrationId/reject
 * @desc    Reject a registration
 * @access  Private (Class Monitor)
 */
router.put('/registrations/:registrationId/reject', auth, isClassMonitor, (req, res) => monitorController.rejectRegistration(req, res));

/**
 * @route   GET /api/core/monitor/dashboard
 * @desc    Get monitor dashboard summary
 * @access  Private (Class Monitor)
 */
router.get('/dashboard', auth, isClassMonitor, (req, res) => monitorController.getMonitorDashboard(req, res));

/**
 * @route   GET /api/core/monitor/reports
 * @desc    Get class reports/statistics for monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/reports', auth, isClassMonitor, (req, res) => monitorController.getClassReports(req, res));

module.exports = router;





