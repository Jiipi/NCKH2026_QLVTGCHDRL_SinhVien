/**
 * Semesters Routes
 * Route definitions for semester management endpoints
 */

import { Router, Request, Response } from 'express';
import { createSemestersController } from '../semesters.factory';
import {
  validateProposeClosure,
  validateSoftLock,
  validateHardLock,
  validateRollback,
  validateGetSemesterStatus,
  validateGetActivitiesBySemester,
} from '../../business/validators/semesters.validators';
import { auth } from '../../../../core/http/middleware/authJwt';
import { requirePermission } from '../../../../core/policies';
import { asyncHandler } from '../../../../core/http/middleware/asyncHandler';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logInfo, logError } from '../../../../core/logger';

/**
 * Authenticated request interface
 */
interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
    id?: string;
    vai_tro?: string;
    role?: string;
  };
}

/**
 * Notification type interface
 */
interface LoaiThongBao {
  id: string;
}

const router: Router = Router();
const semestersController = createSemestersController();

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/semesters/options
 * @desc    Get semester options for UI dropdowns
 * @access  Private
 */
router.get('/options', asyncHandler((req: Request, res: Response) => semestersController.getSemesterOptions(req, res)));

/**
 * @route   GET /api/semesters/list
 * @desc    Get all semesters list (same as options for compatibility)
 * @access  Private
 */
router.get('/list', asyncHandler((req: Request, res: Response) => semestersController.getSemesterOptions(req, res)));

/**
 * @route   GET /api/semesters/current
 * @desc    Get current semester info
 * @access  Private
 */
router.get('/current', asyncHandler((req: Request, res: Response) => semestersController.getCurrentSemester(req, res)));

/**
 * @route   GET /api/semesters/classes
 * @desc    Get all classes for semester management
 * @access  Private
 */
router.get('/classes', asyncHandler((req: Request, res: Response) => semestersController.getAllClasses(req, res)));
router.get('/classes/:classId', asyncHandler((req: Request, res: Response) => semestersController.getClassDetail(req, res)));
router.get('/classes/:classId/students', asyncHandler((req: Request, res: Response) => semestersController.getClassStudents(req, res)));

/**
 * @route   GET /api/semesters/status/:classId/:semester
 * @desc    Get semester closure status
 * @access  Private
 */
router.get(
  '/status/:classId/:semester', 
  validateGetSemesterStatus,
  asyncHandler((req: Request, res: Response) => semestersController.getSemesterStatus(req, res))
);

/**
 * @route   GET /api/semesters/status
 * @desc    Get current semester status (without params)
 * @access  Private
 */
router.get('/status', asyncHandler((req: Request, res: Response) => semestersController.getCurrentSemesterStatus(req, res)));

/**
 * @route   GET /api/semesters/activities/:classId/:semester
 * @desc    Get activities summary for a semester
 * @access  Private
 */
router.get(
  '/activities/:classId/:semester',
  validateGetActivitiesBySemester,
  asyncHandler((req: Request, res: Response) => semestersController.getActivitiesBySemester(req, res))
);

/**
 * @route   GET /api/semesters/registrations/:classId/:semester
 * @desc    Get registrations summary for a semester
 * @access  Private
 */
router.get(
  '/registrations/:classId/:semester',
  validateGetActivitiesBySemester, // Same validation
  asyncHandler((req: Request, res: Response) => semestersController.getRegistrationsBySemester(req, res))
);

/**
 * @route   POST /api/semesters/propose-close
 * @desc    Propose semester closure
 * @access  Private (Admin/Teacher)
 */
router.post(
  '/propose-close',
  requirePermission('create', 'semester'),
  validateProposeClosure,
  asyncHandler((req: Request, res: Response) => semestersController.proposeClosure(req, res))
);

/**
 * @route   POST /api/semesters/soft-lock
 * @desc    Soft lock semester with grace period
 * @access  Private (Admin/Teacher)
 */
router.post(
  '/soft-lock',
  requirePermission('update', 'semester'),
  validateSoftLock,
  asyncHandler((req: Request, res: Response) => semestersController.softLock(req, res))
);

/**
 * @route   POST /api/semesters/hard-lock
 * @desc    Hard lock semester (no modifications allowed)
 * @access  Private (Admin)
 */
router.post(
  '/hard-lock',
  requirePermission('manage', 'semester'),
  validateHardLock,
  asyncHandler((req: Request, res: Response) => semestersController.hardLock(req, res))
);

/**
 * @route   POST /api/semesters/rollback
 * @desc    Rollback semester closure
 * @access  Private (Admin)
 */
router.post(
  '/rollback',
  requirePermission('manage', 'semester'),
  validateRollback,
  asyncHandler((req: Request, res: Response) => semestersController.rollback(req, res))
);

/**
 * @route   POST /api/semesters/create-next
 * @desc    Create next semester automatically
 * @access  Private (Admin) - Role check in controller
 */
router.post('/create-next', asyncHandler((req: Request, res: Response) => semestersController.createNextSemester(req, res)));

/**
 * @route   POST /api/semesters/activate
 * @desc    Activate a semester (locks old, unlocks new)
 * @access  Private (Admin) - Role check in controller
 */
router.post('/activate', asyncHandler((req: Request, res: Response) => semestersController.activateSemester(req, res)));

/**
 * @route   POST /api/semesters/request-closure
 * @desc    GV/LT request admin to close semester (sends notification to all admins)
 * @access  Private (any authenticated user - Teacher/Monitor)
 */
router.post('/request-closure', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.vai_tro || req.user?.role;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    const { semester, reason } = req.body;
    
    if (!semester) {
      return sendResponse(res, 400, ApiResponse.error('Thiếu thông tin học kỳ'));
    }

    // Get sender info
    const sender = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: { vai_tro: true }
    });

    // Get all admin users (role name is ADMIN in uppercase)
    const adminRole = await prisma.vaiTro.findFirst({
      where: { ten_vt: 'ADMIN' }
    });

    if (!adminRole) {
      return sendResponse(res, 500, ApiResponse.error('Không tìm thấy vai trò admin'));
    }

    const admins = await prisma.nguoiDung.findMany({
      where: { 
        vai_tro_id: adminRole.id,
        trang_thai: 'hoat_dong'
      },
      select: { id: true }
    });

    if (admins.length === 0) {
      return sendResponse(res, 500, ApiResponse.error('Không tìm thấy admin nào'));
    }

    // Get or create notification type
    let loaiThongBao: LoaiThongBao | null = await prisma.loaiThongBao.findFirst({
      where: { ten_loai_tb: 'Thông báo hệ thống' }
    });
    if (!loaiThongBao) {
      loaiThongBao = await prisma.loaiThongBao.create({
        data: {
          ten_loai_tb: 'Thông báo hệ thống',
          mo_ta: 'Thông báo chung từ quản trị viên'
        }
      });
    }

    const roleName = sender?.vai_tro?.ten_vt || userRole || 'Không xác định';
    const senderName = sender?.ho_ten || 'Không xác định';

    const title = `Đề xuất đóng học kỳ ${semester}`;
    const content = `${senderName} (${roleName}) đã đề xuất đóng học kỳ ${semester}.\n\nLý do: ${reason || 'Không có lý do cụ thể'}\n\n[Phạm vi: semester_closure_request]`;

    // Create notification for each admin
    const dataRows = admins.map((admin: { id: string }) => ({
      tieu_de: title,
      noi_dung: content,
      loai_tb_id: loaiThongBao!.id,
      nguoi_gui_id: userId,
      nguoi_nhan_id: admin.id,
      muc_do_uu_tien: 'cao',
      phuong_thuc_gui: 'trong_he_thong'
    }));

    const result = await prisma.thongBao.createMany({ data: dataRows });

    logInfo('Semester closure request sent', {
      userId,
      semester,
      adminCount: result.count,
      senderName,
      roleName
    });

    return sendResponse(res, 201, ApiResponse.success({
      count: result.count,
      semester
    }, `Đã gửi đề xuất đóng học kỳ tới ${result.count} admin`));

  } catch (error) {
    logError('Error sending semester closure request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi gửi đề xuất';
    return sendResponse(res, 500, ApiResponse.error(errorMessage));
  }
}));

/**
 * @route   GET /api/semesters/closure-requests
 * @desc    Get all semester closure requests (for Admin)
 * @access  Private (Admin)
 */
router.get('/closure-requests', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng'));
    }

    // Get notifications with semester closure request scope
    const requests = await prisma.thongBao.findMany({
      where: {
        nguoi_nhan_id: userId,
        noi_dung: {
          contains: '[Phạm vi: semester_closure_request]'
        }
      },
      include: {
        nguoi_gui: {
          select: {
            id: true,
            ho_ten: true,
            email: true,
            vai_tro: {
              select: { ten_vt: true }
            }
          }
        }
      },
      orderBy: {
        ngay_gui: 'desc'
      }
    });

    interface NotificationRecord {
      id: string;
      tieu_de: string;
      noi_dung: string;
      ngay_gui: Date;
      da_doc: boolean;
      nguoi_gui?: {
        id: string;
        ho_ten: string;
        email: string;
        vai_tro?: {
          ten_vt: string;
        };
      };
    }

    const formatted = requests.map((record: NotificationRecord) => ({
      id: record.id,
      title: record.tieu_de,
      content: record.noi_dung.split('[Phạm vi:')[0].trim(),
      date: record.ngay_gui,
      isRead: record.da_doc,
      sender: {
        id: record.nguoi_gui?.id,
        name: record.nguoi_gui?.ho_ten,
        email: record.nguoi_gui?.email,
        role: record.nguoi_gui?.vai_tro?.ten_vt
      }
    }));

    return sendResponse(res, 200, ApiResponse.success(formatted, 'Lấy danh sách đề xuất thành công'));

  } catch (error) {
    logError('Error fetching closure requests:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi lấy danh sách đề xuất';
    return sendResponse(res, 500, ApiResponse.error(errorMessage));
  }
}));

/**
 * TODO: Add remaining routes from routes/semesters.route.js:
 * - Batch closure operations
 * - Statistics endpoints
 * - Export functionality
 * - Advanced search and filtering
 * 
 * The legacy file has 853 lines with many specialized endpoints.
 * These can be migrated gradually as needed.
 */

export default router;
module.exports = router;
