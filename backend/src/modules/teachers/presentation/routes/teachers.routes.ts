/**
 * Teachers Routes - V2 API
 * Clean Architecture with use cases
 */

import express, { type Router, type Request, type Response } from 'express';
import XLSX from 'xlsx';
import { createTeachersController } from '../teachers.factory';
import { auth, requireTeacher } from '../../../../core/http/middleware/authJwt';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import { uploadExcel } from '../../../../core/http/middleware/uploadExcel';
import { parseExcelFile, validateStudents, cleanupFile, createImportJob, completeImportJob, getRecentImportJobs, getImportJob, confirmStudentImportJob } from '../../../../core/utils/excelParser';
import type { AuthenticatedRequest } from '../controllers/TeachersController';

const router: Router = express.Router();
const teachersController = createTeachersController();

// All routes require GIANG_VIEN role — enforced at middleware level (defense-in-depth)
router.use(requireTeacher);

/**
 * GET /teachers/dashboard
 * Get teacher dashboard with stats and classes
 */
router.get('/dashboard', auth, asyncHandler((req: Request, res: Response) => teachersController.getDashboard(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/classes
 * Get classes assigned to teacher
 */
router.get('/classes', auth, asyncHandler((req: Request, res: Response) => teachersController.getClasses(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/students
 * Get students in teacher's classes
 */
router.get('/students', auth, asyncHandler((req: Request, res: Response) => teachersController.getStudents(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/activities/pending
 * Get pending activities from teacher's classes
 */
router.get('/activities/pending', auth, asyncHandler((req: Request, res: Response) => teachersController.getPendingActivities(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/activities/history
 * Get approved/rejected activities history
 */
router.get('/activities/history', auth, asyncHandler((req: Request, res: Response) => teachersController.getActivityHistory(req as AuthenticatedRequest, res)));

/**
 * POST /teachers/activities/:id/approve
 * Approve activity
 */
router.post('/activities/:id/approve', auth, asyncHandler((req: Request, res: Response) => teachersController.approveActivity(req as AuthenticatedRequest, res)));

/**
 * POST /teachers/activities/:id/reject
 * Reject activity
 */
router.post('/activities/:id/reject', auth, asyncHandler((req: Request, res: Response) => teachersController.rejectActivity(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/registrations
 * Get all registrations for teacher's classes with filters
 */
router.get('/registrations', auth, asyncHandler((req: Request, res: Response) => teachersController.getAllRegistrations(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/registrations/pending
 * Get pending registrations
 */
router.get('/registrations/pending', auth, asyncHandler((req: Request, res: Response) => teachersController.getPendingRegistrations(req as AuthenticatedRequest, res)));

/**
 * POST /teachers/registrations/:id/approve
 * Approve registration
 */
router.post('/registrations/:id/approve', auth, asyncHandler((req: Request, res: Response) => teachersController.approveRegistration(req as AuthenticatedRequest, res)));

/**
 * POST /teachers/registrations/:id/reject
 * Reject registration
 */
router.post('/registrations/:id/reject', auth, asyncHandler((req: Request, res: Response) => teachersController.rejectRegistration(req as AuthenticatedRequest, res)));

/**
 * POST /teachers/registrations/bulk-approve
 * Bulk approve registrations
 */
router.post('/registrations/bulk-approve', auth, asyncHandler((req: Request, res: Response) => teachersController.bulkApproveRegistrations(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/classes/:className/stats
 * Get class statistics
 */
router.get('/classes/:className/stats', auth, asyncHandler((req: Request, res: Response) => teachersController.getClassStatistics(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/classes/:id/statistics
 * Alias by class ID for convenience from frontend
 */
router.get('/classes/:id/statistics', auth, asyncHandler((req: Request, res: Response) => teachersController.getClassStatisticsById(req as AuthenticatedRequest, res)));

/**
 * PATCH /teachers/classes/:id/monitor
 * Assign class monitor for a class the teacher owns
 * Body: { sinh_vien_id: string }
 */
router.patch('/classes/:id/monitor', auth, asyncHandler((req: Request, res: Response) => teachersController.assignClassMonitor(req as AuthenticatedRequest, res)));

/**
 * POST /teachers/students
 * Create a single student (teacher's class only)
 */
router.post('/students', auth, asyncHandler((req: Request, res: Response) => teachersController.createStudent(req as AuthenticatedRequest, res)));

interface AuthenticatedUploadRequest {
  user?: {
    id: string;
    role?: string;
    vai_tro?: { ten_vt: string };
  };
  file?: {
    path: string;
    filename?: string;
    originalname?: string;
  };
}

/**
 * GET /teachers/students/import/jobs
 * Get recent import jobs
 */
router.get('/students/import/jobs', auth, asyncHandler(async (_req: Request, res: Response) => {
  const jobs = await getRecentImportJobs(20);
  return res.json({ success: true, data: jobs });
}));

/**
 * GET /teachers/students/import/template
 * Download Excel template for student import
 */
router.get('/students/import/template', auth, asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user?.role !== 'GIANG_VIEN' && authReq.user?.role !== 'GIANG_VIÊN' && authReq.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Không có quyền tải file mẫu' });
  }

  const { prisma } = await import('../../../../data/infrastructure/prisma/client');
  const teacherClasses = await prisma.lop.findMany({
    where: { chu_nhiem: authReq.user!.sub },
    select: { ten_lop: true },
    orderBy: { ten_lop: 'asc' }
  });
  const className = teacherClasses[0]?.ten_lop || 'CTK46A';

  const base = Date.now() % 10000000;
  const mssv1 = String(base).padStart(7, '0');
  const mssv2 = String((base + 1) % 10000000).padStart(7, '0');

  const headers = [
    'MSSV',
    'Họ và tên',
    'Email',
    'Ngày sinh (YYYY-MM-DD)',
    'Giới tính (nam/nu/khac)',
    'Lớp',
    'Số điện thoại',
    'Địa chỉ'
  ];
  const rows = [
    [mssv1, 'Sinh Viên Mẫu A', `sv${mssv1}@dlu.edu.vn`, '2003-01-15', 'nam', className, '0900000001', 'Địa chỉ 1'],
    [mssv2, 'Sinh Viên Mẫu B', `sv${mssv2}@dlu.edu.vn`, '2003-05-20', 'nu',  className, '0900000002', 'Địa chỉ 2']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 24 }, { wch: 28 }, { wch: 22 }, { wch: 22 },
    { wch: 12 }, { wch: 14 }, { wch: 32 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SinhVien');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="mau_import_sinh_vien.xlsx"');
  return res.send(buffer);
}));


/**
 * GET /teachers/students/import/jobs/:jobId
 * Get import job detail
 */
router.get('/students/import/jobs/:jobId', auth, asyncHandler(async (req: Request, res: Response) => {
  const job = await getImportJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy import job' });
  }
  return res.json({ success: true, data: job });
}));

/**
 * POST /teachers/students/preview
 * Upload Excel/CSV and return validation results (no DB writes)
 */
router.post('/students/preview', auth, uploadExcel.single('file'), asyncHandler(async (req: Request, res: Response) => {
  const uploadReq = req as AuthenticatedUploadRequest;
  if (uploadReq.user?.role !== 'GIANG_VIEN' && uploadReq.user?.role !== 'GIANG_VIÊN') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên mới được import sinh viên' });
  }

  if (!uploadReq.file || !uploadReq.file.path) {
    return res.status(400).json({ success: false, message: 'Thiếu file upload. Vui lòng chọn file Excel/CSV' });
  }

  const filePath = uploadReq.file.path;
  const originalName = uploadReq.file.originalname || 'unknown';

  try {
    const rows = parseExcelFile(filePath);
    const result = await validateStudents(rows);

    const job = await createImportJob({
      actorId: uploadReq.user!.sub,
      filename: originalName,
      totalRows: rows.length,
      previewPayload: result
    });

    await completeImportJob(job.id, {
      validRows: result.valid.length,
      invalidRows: result.invalid.length,
      status: 'pending',
      errors: result.invalid.map(inv => ({
        rowNumber: inv.rowNumber || 0,
        message: inv.errors.join(', '),
        rawValue: JSON.stringify(inv)
      }))
    });

    return res.json({ success: true, data: { ...result, jobId: job.id } });
  } finally {
    cleanupFile(filePath);
  }
}));

/**
 * POST /teachers/students/import
 * Confirm previewed import job and write valid rows into DB
 */
router.post('/students/import', auth, asyncHandler(async (req: Request, res: Response) => {
  const uploadReq = req as AuthenticatedUploadRequest;
  if (uploadReq.user?.role !== 'GIANG_VIEN' && uploadReq.user?.role !== 'GIANG_VIÊN') {
    return res.status(403).json({ success: false, message: 'Chỉ giảng viên mới được import sinh viên' });
  }

  const jobId = String(req.body?.jobId || '');
  if (!jobId) {
    return res.status(400).json({ success: false, message: 'Thiếu jobId để xác nhận import' });
  }

  const result = await confirmStudentImportJob(jobId, {
    userId: uploadReq.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || null,
    requestId: null,
  });

  return res.json({ success: true, message: 'Import hoàn tất', data: { ...result, jobId } });
}));

/**
 * GET /teachers/students/export
 * Export students list
 */
router.get('/students/export', auth, asyncHandler((req: Request, res: Response) => teachersController.exportStudents(req as AuthenticatedRequest, res)));

/**
 * PUT /teachers/students/:id
 * Update a student in the teacher's class
 */
router.put('/students/:id', auth, asyncHandler((req: Request, res: Response) => teachersController.updateStudent(req as AuthenticatedRequest, res)));

/**
 * DELETE /teachers/students/:id
 * Delete a student in the teacher's class
 */
router.delete('/students/:id', auth, asyncHandler((req: Request, res: Response) => teachersController.deleteStudent(req as AuthenticatedRequest, res)));

/**
 * GET /teachers/reports/statistics
 * Get statistics for reports
 */
router.get('/reports/statistics', auth, asyncHandler((req: Request, res: Response) => teachersController.getReportStatistics(req as AuthenticatedRequest, res)));

export default router;
module.exports = router;
