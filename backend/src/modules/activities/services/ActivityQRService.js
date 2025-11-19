/**
 * Activity QR Service
 * Handles QR token generation for activities
 * Follows Single Responsibility Principle (SRP)
 */

const crypto = require('crypto');
const activitiesRepo = require('../activities.repo');
const { NotFoundError } = require('../../../core/errors/AppError');

class ActivityQRService {
  /**
   * Generate unique QR token
   */
  generateQRToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate QR token for activity if it doesn't have one
   */
  async generateQRForActivity(id) {
    const activity = await activitiesRepo.findById(id);

    if (!activity) {
      throw new NotFoundError('Hoạt động', id);
    }

    // If already has QR, return as is
    if (activity.qr) {
      return activity;
    }

    // Generate and update
    const qrToken = this.generateQRToken();
    return activitiesRepo.update(id, { qr: qrToken });
  }
}

module.exports = ActivityQRService;

