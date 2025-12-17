/**
 * Upload Route
 * API endpoints for file uploads (images, attachments, avatars)
 * @module presentation/routes/upload
 */

import { Router } from 'express';
import * as UploadController from '../controllers/upload.controller';
import { uploadImage, uploadAttachment, handleUploadError } from '../../core/http/middleware/upload';
import uploadAvatar from '../../core/http/middleware/uploadAvatar';
import { auth } from '../../core/http/middleware/authJwt';

const router = Router();

// All upload routes require authentication
router.use(auth);

// Image upload routes
router.post('/image', 
  uploadImage.single('image'), 
  handleUploadError, 
  UploadController.uploadImage
);

router.post('/images', 
  uploadImage.array('images', 10), // Max 10 images
  handleUploadError, 
  UploadController.uploadImages
);

// Attachment upload routes
router.post('/attachment', 
  uploadAttachment.single('attachment'), 
  handleUploadError, 
  UploadController.uploadAttachment
);

router.post('/attachments', 
  uploadAttachment.array('attachments', 5), // Max 5 attachments
  handleUploadError, 
  UploadController.uploadAttachments
);

// Avatar upload routes
router.post('/avatar', 
  uploadAvatar.single('avatar'), 
  UploadController.uploadAvatar
);

router.delete('/avatar/:filename', UploadController.deleteAvatar);

// File management routes
router.delete('/:type/:filename', UploadController.deleteFile);
router.get('/:type/:filename/info', UploadController.getFileInfo);

export default router;
