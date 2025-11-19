const { NotFoundError } = require('../../../../core/errors/AppError');
const crypto = require('crypto');

/**
 * GetActivityQRDataUseCase
 * Use case for getting QR data for activity
 * Follows Single Responsibility Principle (SRP)
 */
class GetActivityQRDataUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  /**
   * Generate QR token using crypto
   */
  generateQRToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async execute(id, scope, user) {
    const where = {};
    
    // Apply scope filter from middleware
    if (scope && scope.activityFilter) {
      Object.assign(where, scope.activityFilter);
    }

    let activity = await this.activityRepository.findById(id, where);
    
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    let qrToken = activity.qr || activity.qr_token;

    // If no QR token exists, generate one and update activity
    if (!qrToken) {
      qrToken = this.generateQRToken();
      // Update activity with new QR token
      activity = await this.activityRepository.update(id, { qr: qrToken });
      qrToken = activity.qr || qrToken;

      if (!qrToken) {
        throw new Error('Không thể tạo mã QR cho hoạt động');
      }
    }

    // Generate QR JSON data
    const qrData = {
      activity_id: activity.id,
      activity_name: activity.ten_hd,
      qr_token: qrToken,
      qr_json: JSON.stringify({
        activityId: activity.id,
        token: qrToken,
        timestamp: new Date().toISOString()
      })
    };

    return qrData;
  }
}

module.exports = GetActivityQRDataUseCase;

