const path = require('path');
const fs = require('fs').promises;
const { ApiResponse } = require('../../core/http/response/apiResponse');
const { logInfo, logError } = require('../../core/logger');

class UploadController {
  /**
   * Upload single image
   */
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(ApiResponse.error('No image file provided'));
      }

      const fileUrl = `/uploads/images/${req.file.filename}`;
      logInfo('Image uploaded', { filename: req.file.filename, userId: req.user?.sub });

      return res.json(ApiResponse.success({
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }, 'Image uploaded successfully'));
    } catch (error) {
      logError('Upload image error', error);
      return res.status(500).json(ApiResponse.error('Failed to upload image'));
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(ApiResponse.error('No image files provided'));
      }

      const files = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/images/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      logInfo('Images uploaded', { count: files.length, userId: req.user?.sub });

      return res.json(ApiResponse.success({ files }, 'Images uploaded successfully'));
    } catch (error) {
      logError('Upload images error', error);
      return res.status(500).json(ApiResponse.error('Failed to upload images'));
    }
  }

  /**
   * Upload single attachment
   */
  static async uploadAttachment(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(ApiResponse.error('No attachment file provided'));
      }

      const fileUrl = `/uploads/attachments/${req.file.filename}`;
      logInfo('Attachment uploaded', { filename: req.file.filename, userId: req.user?.sub });

      return res.json(ApiResponse.success({
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalName: req.file.originalname
      }, 'Attachment uploaded successfully'));
    } catch (error) {
      logError('Upload attachment error', error);
      return res.status(500).json(ApiResponse.error('Failed to upload attachment'));
    }
  }

  /**
   * Upload multiple attachments
   */
  static async uploadAttachments(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(ApiResponse.error('No attachment files provided'));
      }

      const files = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/attachments/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname
      }));

      logInfo('Attachments uploaded', { count: files.length, userId: req.user?.sub });

      return res.json(ApiResponse.success({ files }, 'Attachments uploaded successfully'));
    } catch (error) {
      logError('Upload attachments error', error);
      return res.status(500).json(ApiResponse.error('Failed to upload attachments'));
    }
  }

  /**
   * Upload avatar
   */
  static async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(ApiResponse.error('No avatar file provided'));
      }

      const fileUrl = `/uploads/avatars/${req.file.filename}`;
      logInfo('Avatar uploaded', { filename: req.file.filename, userId: req.user?.sub });

      return res.json(ApiResponse.success({
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }, 'Avatar uploaded successfully'));
    } catch (error) {
      logError('Upload avatar error', error);
      return res.status(500).json(ApiResponse.error('Failed to upload avatar'));
    }
  }

  /**
   * Delete avatar
   */
  static async deleteAvatar(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.resolve(__dirname, '../../../uploads/avatars', filename);

      await fs.unlink(filePath);
      logInfo('Avatar deleted', { filename, userId: req.user?.sub });

      return res.json(ApiResponse.success(null, 'Avatar deleted successfully'));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json(ApiResponse.error('Avatar not found'));
      }
      logError('Delete avatar error', error);
      return res.status(500).json(ApiResponse.error('Failed to delete avatar'));
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(req, res) {
    try {
      const { type, filename } = req.params;
      const allowedTypes = ['images', 'attachments', 'avatars'];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json(ApiResponse.error('Invalid file type'));
      }

      // Path to uploads folder at project root: backend/uploads
      const filePath = path.resolve(__dirname, '../../../uploads', type, filename);
      await fs.unlink(filePath);
      logInfo('File deleted', { type, filename, userId: req.user?.sub });

      return res.json(ApiResponse.success(null, 'File deleted successfully'));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json(ApiResponse.error('File not found'));
      }
      logError('Delete file error', error);
      return res.status(500).json(ApiResponse.error('Failed to delete file'));
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(req, res) {
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
      if (error.code === 'ENOENT') {
        return res.status(404).json(ApiResponse.error('File not found'));
      }
      logError('Get file info error', error);
      return res.status(500).json(ApiResponse.error('Failed to get file info'));
    }
  }
}

module.exports = UploadController;





