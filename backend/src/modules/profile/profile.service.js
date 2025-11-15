const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { logInfo, logError } = require('../../core/logger');
const profileRepo = require('./profile.repo');

// Validation schemas
const updateProfileSchema = z.object({
  ho_ten: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  anh_dai_dien: z.string().refine((val) => {
    if (!val) return true;
    const isValidFormat = val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:');
    const isValidLength = val.length <= 255;
    return isValidFormat && isValidLength;
  }, 'URL ảnh đại diện không hợp lệ hoặc quá dài (tối đa 255 ký tự)').optional(),
  ngay_sinh: z.string().optional(),
  gt: z.enum(['nam', 'nu', 'khac']).optional(),
  dia_chi: z.string().optional(),
  sdt: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự').max(11).optional()
});

const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
  new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"],
});

class ProfileService {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  static async getProfile(userId) {
    try {
      logInfo('Getting user profile', { userId });

      const user = await profileRepo.findUserById(userId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Remove sensitive data
      const { mat_khau, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      logError('Error getting user profile', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} data - Profile data
   * @returns {Promise<Object>} Updated profile
   */
  static async updateProfile(userId, data) {
    try {
      // Validate input
      const validatedData = updateProfileSchema.parse(data);

      logInfo('Updating user profile', { userId, fields: Object.keys(validatedData) });

      // Check if user exists
      const existingUser = await profileRepo.findUserById(userId);

      if (!existingUser) {
        throw new Error('USER_NOT_FOUND');
      }

      // If email is being updated, check if it's already taken
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const emailExists = await profileRepo.findByEmail(validatedData.email, userId);

        if (emailExists) {
          throw new Error('EMAIL_ALREADY_EXISTS');
        }
      }

      // Update user
      const updatedUser = await profileRepo.updateUser(userId, validatedData);

      // Remove sensitive data
      const { mat_khau, ...userWithoutPassword } = updatedUser;

      return userWithoutPassword;
    } catch (error) {
      logError('Error updating user profile', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} data - Password change data
   * @returns {Promise<boolean>} Success status
   */
  static async changePassword(userId, data) {
    try {
      // Validate input
      const validatedData = changePasswordSchema.parse(data);

      logInfo('Changing user password', { userId });

      // Get user
      const user = await profileRepo.findUserById(userId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Verify old password
      const isValidPassword = await bcrypt.compare(validatedData.old_password, user.mat_khau);
      if (!isValidPassword) {
        throw new Error('INVALID_OLD_PASSWORD');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.new_password, 10);

      // Update password
      await profileRepo.updatePassword(userId, hashedPassword);

      return true;
    } catch (error) {
      logError('Error changing password', error);
      throw error;
    }
  }

  /**
   * Check if user is class monitor
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Monitor status and class info
   */
  static async checkClassMonitor(userId) {
    try {
      logInfo('Checking class monitor status', { userId });

      const student = await profileRepo.findStudentWithMonitorInfo(userId);

      if (!student) {
        return {
          isMonitor: false,
          classInfo: null
        };
      }

      const isMonitor = student.lop_lop_truongTosinhVien !== null;

      return {
        isMonitor,
        classInfo: isMonitor ? student.lop_lop_truongTosinhVien : null
      };
    } catch (error) {
      logError('Error checking class monitor status', error);
      throw error;
    }
  }

  /**
   * Check if a class has a monitor
   * @param {string} lopId - Class ID
   * @returns {Promise<Object>} Has monitor status
   */
  static async checkClassHasMonitor(lopId) {
    try {
      logInfo('Checking if class has monitor', { lopId });

      const classWithMonitor = await profileRepo.findClassWithMonitor(lopId);

      if (!classWithMonitor) {
        return {
          hasMonitor: false,
          monitor: null
        };
      }

      const hasMonitor = classWithMonitor.lop_truong !== null;

      return {
        hasMonitor,
        monitor: hasMonitor ? {
          id: classWithMonitor.lop_truong,
          mssv: classWithMonitor.sinh_viens?.[0]?.mssv,
          ho_ten: classWithMonitor.sinh_viens?.[0]?.nguoi_dung?.ho_ten
        } : null
      };
    } catch (error) {
      logError('Error checking if class has monitor', error);
      throw error;
    }
  }
}

module.exports = ProfileService;





