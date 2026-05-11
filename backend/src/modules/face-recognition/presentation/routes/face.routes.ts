/**
 * Face Recognition Routes
 * ========================
 * Định nghĩa các endpoint API cho nhận diện khuôn mặt
 */

import { Router } from 'express';
import multer from 'multer';
import { faceRecognitionController } from '../controllers/FaceRecognitionController';
import { isTeacherOrAbove } from '../../../../core/utils/roleHelper';

const router = Router();

// Multer config: lưu trong memory (in-memory buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5                     // tối đa 5 ảnh
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    } else {
      cb(null, true);
    }
  }
});

// ========================
// PUBLIC (nhưng cần auth)
// ========================

router.get('/health',
  (req, res) => faceRecognitionController.healthCheck(req, res)
);

router.get('/status',
  (req, res) => faceRecognitionController.getFaceStatus(req, res)
);

// ========================
// CONSENT
// ========================

router.get('/consent',
  (req, res) => faceRecognitionController.checkConsent(req, res)
);

router.post('/consent',
  (req, res) => faceRecognitionController.acceptConsent(req, res)
);

// ========================
// REGISTRATION
// ========================

router.post('/register',
  upload.array('files', 5),
  (req, res) => faceRecognitionController.registerFace(req, res)
);

router.delete('/register',
  (req, res) => faceRecognitionController.deleteFaceData(req, res)
);

// ========================
// ATTENDANCE
// ========================

router.post('/attendance/:activityId',
  upload.single('file'),
  (req, res) => faceRecognitionController.faceAttendance(req, res)
);

router.post('/monitor-attendance/:activityId',
  upload.array('files', 30),
  (req, res) => faceRecognitionController.monitorBulkFaceAttendance(req, res)
);

// ========================
// FALLBACK
// ========================

router.post('/fallback/:activityId',
  (req, res) => faceRecognitionController.createFallbackRequest(req, res)
);

// ========================
// ADMIN / TEACHER
// ========================

const requireTeacherOrAbove = (req: any, res: any, next: any) => {
  const role = req.user?.role;
  if (!isTeacherOrAbove(role)) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập' });
  }
  next();
};

router.get('/admin/registrations',
  requireTeacherOrAbove,
  (req, res) => faceRecognitionController.adminListRegistrations(req, res)
);

router.patch('/admin/registrations/:faceDataId/verify',
  requireTeacherOrAbove,
  (req, res) => faceRecognitionController.adminVerifyFace(req, res)
);

router.patch('/admin/registrations/:faceDataId/reject',
  requireTeacherOrAbove,
  (req, res) => faceRecognitionController.adminRejectFace(req, res)
);

export default router;
