/**
 * Path Utilities
 * Helper functions for working with file and directory paths
 * @module core/utils/paths
 */

import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * Get the semester data directory path
 * Uses SEMESTER_DATA_DIR or DATA_DIR env variables, or falls back to temp directory
 */
export function getSemesterDataDir(): string {
  const base = process.env.SEMESTER_DATA_DIR || process.env.DATA_DIR;
  const dir = base && base.trim().length > 0
    ? base
    : path.join(os.tmpdir(), 'semesters-data');

  // Ensure base exists lazily; callers may also ensure nested dirs
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // ignore; callers may attempt again for nested paths
    }
  }
  return dir;
}

/**
 * Get the metadata file path
 */
export function getMetadataPath(): string {
  return path.join(getSemesterDataDir(), 'metadata.json');
}

/**
 * Get the uploads directory path
 */
export function getUploadsDir(): string {
  const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return uploadsDir;
}

/**
 * Get the avatars directory path
 */
export function getAvatarsDir(): string {
  return path.join(getUploadsDir(), 'avatars');
}

/**
 * Get the attachments directory path
 */
export function getAttachmentsDir(): string {
  return path.join(getUploadsDir(), 'attachments');
}

/**
 * Get the images directory path
 */
export function getImagesDir(): string {
  return path.join(getUploadsDir(), 'images');
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// CommonJS compatibility
module.exports = {
  getSemesterDataDir,
  getMetadataPath,
  getUploadsDir,
  getAttachmentsDir,
  getImagesDir,
  ensureDir
};
