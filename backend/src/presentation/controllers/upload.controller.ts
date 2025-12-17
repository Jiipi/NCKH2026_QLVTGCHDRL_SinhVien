/**
 * Upload Controller
 * Handles file upload operations
 * @module presentation/controllers/upload
 */

import path from 'path';
import fs from 'fs/promises';
import { Request, Response } from 'express';
import { ApiResponse } from '../../core/http/response/apiResponse';
import { logInfo, logError } from '../../core/logger';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    id?: string;
  };
}

interface FileError extends Error {
  code?: string;
}

/**
 * Upload single image
 */
export async function uploadImage(req: Request, res: Response): Promise<any> {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.file) {
      return res.status(400).json(ApiResponse.error('No image file provided'));
    }

    const fileUrl = `/uploads/images/${authReq.file.filename}`;
    logInfo('Image uploaded', { filename: authReq.file.filename, userId: authReq.user?.sub });

    return res.json(ApiResponse.success({
      filename: authReq.file.filename,
      url: fileUrl,
      size: authReq.file.size,
      mimetype: authReq.file.mimetype
    }, 'Image uploaded successfully'));
  } catch (error) {
    logError('Upload image error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to upload image'));
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(req: Request, res: Response): Promise<any> {
  try {
    const authReq = req as AuthRequest;
    const files = authReq.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json(ApiResponse.error('No image files provided'));
    }

    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      url: `/uploads/images/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    logInfo('Images uploaded', { count: uploadedFiles.length, userId: authReq.user?.sub });

    return res.json(ApiResponse.success({ files: uploadedFiles }, 'Images uploaded successfully'));
  } catch (error) {
    logError('Upload images error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to upload images'));
  }
}

/**
 * Upload single attachment
 */
export async function uploadAttachment(req: Request, res: Response): Promise<any> {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.file) {
      return res.status(400).json(ApiResponse.error('No attachment file provided'));
    }

    const fileUrl = `/uploads/attachments/${authReq.file.filename}`;
    logInfo('Attachment uploaded', { filename: authReq.file.filename, userId: authReq.user?.sub });

    return res.json(ApiResponse.success({
      filename: authReq.file.filename,
      url: fileUrl,
      size: authReq.file.size,
      mimetype: authReq.file.mimetype,
      originalName: authReq.file.originalname
    }, 'Attachment uploaded successfully'));
  } catch (error) {
    logError('Upload attachment error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to upload attachment'));
  }
}

/**
 * Upload multiple attachments
 */
export async function uploadAttachments(req: Request, res: Response): Promise<any> {
  try {
    const authReq = req as AuthRequest;
    const files = authReq.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json(ApiResponse.error('No attachment files provided'));
    }

    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      url: `/uploads/attachments/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname
    }));

    logInfo('Attachments uploaded', { count: uploadedFiles.length, userId: authReq.user?.sub });

    return res.json(ApiResponse.success({ files: uploadedFiles }, 'Attachments uploaded successfully'));
  } catch (error) {
    logError('Upload attachments error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to upload attachments'));
  }
}

/**
 * Upload avatar
 */
export async function uploadAvatar(req: Request, res: Response): Promise<any> {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.file) {
      return res.status(400).json(ApiResponse.error('No avatar file provided'));
    }

    const fileUrl = `/uploads/avatars/${authReq.file.filename}`;
    logInfo('Avatar uploaded', { filename: authReq.file.filename, userId: authReq.user?.sub });

    return res.json(ApiResponse.success({
      filename: authReq.file.filename,
      url: fileUrl,
      size: authReq.file.size,
      mimetype: authReq.file.mimetype
    }, 'Avatar uploaded successfully'));
  } catch (error) {
    logError('Upload avatar error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to upload avatar'));
  }
}

/**
 * Delete avatar
 */
export async function deleteAvatar(req: Request, res: Response): Promise<any> {
  try {
    const authReq = req as AuthRequest;
    const { filename } = req.params;
    const filePath = path.resolve(__dirname, '../../../uploads/avatars', filename);

    await fs.unlink(filePath);
    logInfo('Avatar deleted', { filename, userId: authReq.user?.sub });

    return res.json(ApiResponse.success(null, 'Avatar deleted successfully'));
  } catch (error) {
    const err = error as FileError;
    if (err.code === 'ENOENT') {
      return res.status(404).json(ApiResponse.error('Avatar not found'));
    }
    logError('Delete avatar error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to delete avatar'));
  }
}

/**
 * Delete file
 */
export async function deleteFile(req: Request, res: Response): Promise<any> {
  try {
    const authReq = req as AuthRequest;
    const { type, filename } = req.params;
    const allowedTypes = ['images', 'attachments', 'avatars'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json(ApiResponse.error('Invalid file type'));
    }

    // Path to uploads folder at project root: backend/uploads
    const filePath = path.resolve(__dirname, '../../../uploads', type, filename);
    await fs.unlink(filePath);
    logInfo('File deleted', { type, filename, userId: authReq.user?.sub });

    return res.json(ApiResponse.success(null, 'File deleted successfully'));
  } catch (error) {
    const err = error as FileError;
    if (err.code === 'ENOENT') {
      return res.status(404).json(ApiResponse.error('File not found'));
    }
    logError('Delete file error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to delete file'));
  }
}

/**
 * Get file info
 */
export async function getFileInfo(req: Request, res: Response): Promise<any> {
  try {
    const { type, filename } = req.params;
    const allowedTypes = ['images', 'attachments', 'avatars'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json(ApiResponse.error('Invalid file type'));
    }

    const filePath = path.resolve(__dirname, '../../../uploads', type, filename);
    const stats = await fs.stat(filePath);

    return res.json(ApiResponse.success({
      filename,
      type,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      url: `/uploads/${type}/${filename}`
    }, 'File info retrieved successfully'));
  } catch (error) {
    const err = error as FileError;
    if (err.code === 'ENOENT') {
      return res.status(404).json(ApiResponse.error('File not found'));
    }
    logError('Get file info error', error as Error);
    return res.status(500).json(ApiResponse.error('Failed to get file info'));
  }
}
