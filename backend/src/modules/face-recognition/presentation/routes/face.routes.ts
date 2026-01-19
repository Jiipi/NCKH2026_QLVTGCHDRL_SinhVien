/**
 * Face Recognition Routes
 * ========================
 * API routes cho nhận diện khuôn mặt
 * 
 * Endpoints:
 * - GET  /api/face/health              - Kiểm tra service status
 * - GET  /api/face/status              - Lấy trạng thái đăng ký khuôn mặt
 * - POST /api/face/register            - Đăng ký khuôn mặt
 * - POST /api/face/attendance/:activityId - Điểm danh bằng khuôn mặt
 * - DELETE /api/face/register          - Xóa dữ liệu khuôn mặt
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { faceRecognitionController } from '../controllers';

// Import auth middleware
const { auth } = require('../../../../core/http/middleware');
const { asyncHandler } = require('../../../../core/http/middleware/asyncHandler');

const router = Router();

// Multer config cho upload ảnh (lưu trong memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    }
  }
});

/**
 * GET /api/face/health
 * Public endpoint - kiểm tra Face Recognition Service
 */
router.get('/health', (req: Request, res: Response) => 
  faceRecognitionController.healthCheck(req, res)
);

/**
 * GET /api/face/status
 * Requires: authenticated user (sinh viên)
 * Lấy trạng thái đăng ký khuôn mặt
 */
router.get('/status', auth, asyncHandler((req: Request, res: Response) => 
  faceRecognitionController.getFaceStatus(req, res)
));

/**
 * POST /api/face/register
 * Requires: authenticated user (sinh viên)
 * Body: multipart/form-data
 *   - file: Ảnh khuôn mặt (required)
 *   - updateIfExists: boolean (optional, default false)
 */
router.post('/register', auth, upload.single('file'), asyncHandler((req: Request, res: Response) => 
  faceRecognitionController.registerFace(req, res)
));

/**
 * POST /api/face/attendance/:activityId
 * Requires: authenticated user (sinh viên)
 * Body: multipart/form-data
 *   - file: Ảnh khuôn mặt (required)
 *   - threshold: number (optional, default 0.68)
 */
router.post('/attendance/:activityId', auth, upload.single('file'), asyncHandler((req: Request, res: Response) => 
  faceRecognitionController.faceAttendance(req, res)
));

/**
 * DELETE /api/face/register
 * Requires: authenticated user (sinh viên)
 * Xóa dữ liệu khuôn mặt đã đăng ký
 */
router.delete('/register', auth, asyncHandler((req: Request, res: Response) => 
  faceRecognitionController.deleteFaceData(req, res)
));

export default router;
