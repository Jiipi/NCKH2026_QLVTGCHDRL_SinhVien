import type { Router, Request, Response } from 'express';
import type { DangKyHoatDong, SinhVien, HoatDong, Lop, TrangThaiDangKy } from '@prisma/client';

const express = require('express');
const router: Router = express.Router();
const { createMonitorController } = require('../monitor.factory');
const { auth, isClassMonitor, getMonitorClass } = require('../../../../core/http/middleware');

const monitorController = createMonitorController();

/**
 * @route   GET /api/core/monitor/students
 * @desc    Get all students in monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/students', auth, isClassMonitor, getMonitorClass, (req: Request, res: Response) => monitorController.getClassStudents(req, res));

/**
 * @route   GET /api/core/monitor/registrations
 * @desc    Get registrations for monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/registrations', auth, isClassMonitor, getMonitorClass, (req: Request, res: Response) => monitorController.getPendingRegistrations(req, res));

/**
 * @route   GET /api/core/monitor/registrations/pending-count
 * @desc    Get count of pending registrations
 * @access  Private (Class Monitor)
 */
router.get('/registrations/pending-count', auth, isClassMonitor, getMonitorClass, (req: Request, res: Response) => monitorController.getPendingRegistrationsCount(req, res));

/**
 * @route   PUT /api/core/monitor/registrations/:registrationId/approve
 * @desc    Approve a registration
 * @access  Private (Class Monitor)
 */
router.put('/registrations/:registrationId/approve', auth, isClassMonitor, getMonitorClass, (req: Request, res: Response) => monitorController.approveRegistration(req, res));

/**
 * @route   PUT /api/core/monitor/registrations/:registrationId/reject
 * @desc    Reject a registration
 * @access  Private (Class Monitor)
 */
router.put('/registrations/:registrationId/reject', auth, isClassMonitor, getMonitorClass, (req: Request, res: Response) => monitorController.rejectRegistration(req, res));

/**
 * @route   GET /api/core/monitor/dashboard
 * @desc    Get monitor dashboard summary
 * @access  Private (Class Monitor)
 */
router.get('/dashboard', auth, isClassMonitor, getMonitorClass, (req: Request, res: Response) => monitorController.getMonitorDashboard(req, res));

/**
 * @route   GET /api/core/monitor/reports
 * @desc    Get class reports/statistics for monitor's class
 * @access  Private (Class Monitor)
 */
router.get('/reports', auth, isClassMonitor, getMonitorClass, (req: Request, res: Response) => monitorController.getClassReports(req, res));

export default router;
