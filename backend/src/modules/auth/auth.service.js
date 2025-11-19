/**
 * Auth Service
 * Business logic for authentication and user management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../../infrastructure/prisma/client');
const config = require('../../core/config');
const { logInfo, logError } = require('../../core/logger');
const { AppError } = require('../../core/errors/AppError');

/**
 * In-memory OTP storage (replace with Redis in production)
 */
const otpMemory = new Map();

class AuthService {
  /**
   * Find user by email or maso
   */
  static async findByEmailOrMaso(emailOrMaso) {
    return await prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { email: emailOrMaso },
          { ten_dn: emailOrMaso }
        ]
      },
      include: {
        vai_tro: true,
      }
    });
  }

  /**
   * Find user by maso only
   */
  static async findUserByMaso(maso) {
    return await prisma.nguoiDung.findUnique({
      where: { ten_dn: maso }
    });
  }

  /**
   * Find user by email only
   */
  static async findUserByEmail(email) {
    return await prisma.nguoiDung.findUnique({
      where: { email }
    });
  }

  /**
   * Verify password and upgrade hash if needed
   */
  static async verifyPasswordAndUpgrade(user, password) {
    const isValid = await bcrypt.compare(password, user.mat_khau);
    
    // Upgrade old hash if needed
    if (isValid && !user.mat_khau.startsWith('$2b$')) {
      const newHash = await bcrypt.hash(password, config.security.bcryptRounds);
      await prisma.nguoiDung.update({
        where: { id: user.id },
        data: { mat_khau: newHash }
      });
    }
    
    return isValid;
  }

  /**
   * Update login information
   */
  static async updateLoginInfo(userId, ip) {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        lan_cuoi_dn: new Date(),
        // Note: dia_chi_ip_cuoi field may not exist in schema
        // Remove if causing issues
      }
    });
  }

  /**
   * Convert user entity to DTO
   */
  static toUserDTO(user) {
    const role = user.vai_tro;
    return {
      id: user.id,
      maso: user.ten_dn,
      email: user.email,
      ho_ten: user.ho_ten,
      roleCode: role?.ten_vt || 'STUDENT',
      roleName: role?.mo_ta || 'Sinh viên',
      avatar: user.anh_dai_dien,
      status: user.trang_thai
    };
  }

  /**
   * Generate JWT token
   */
  static generateToken(user, remember = false) {
    const payload = {
      sub: user.id,
      maso: user.ten_dn,
      role: (user.vai_tro?.ten_vt || 'STUDENT').toUpperCase()
    };

    const expiresIn = remember 
      ? (process.env.JWT_EXPIRES_IN_REMEMBER || '30d') 
      : config.jwt.expiresIn;

    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  }

  /**
   * Login user
   */
  static async login(maso, password, remember = false, ip = null, tabId = null) {
    logInfo('LOGIN_ATTEMPT', { maso });

    // Find user
    let user = await this.findByEmailOrMaso(maso);
    if (!user) {
      // Auto-create demo users in development if DB is empty
      await this.ensureDemoUsersIfNeeded();
      user = await this.findByEmailOrMaso(maso);
    }

    if (!user) {
      logInfo('LOGIN_USER_NOT_FOUND', { maso });
      throw new AppError('Mã số hoặc mật khẩu không đúng', 401);
    }

    // Verify password
    const isPasswordValid = await this.verifyPasswordAndUpgrade(user, password);
    logInfo('LOGIN_PASSWORD_CHECK', { maso, ok: !!isPasswordValid });

    if (!isPasswordValid) {
      throw new AppError('Mã số hoặc mật khẩu không đúng', 401);
    }

    // Check account status
    if (user.trang_thai !== 'hoat_dong') {
      throw new AppError('Tài khoản đã bị khóa', 401);
    }

    // Update login info
    await this.updateLoginInfo(user.id, ip);

    // Track session if tabId provided
    if (tabId) {
      try {
        const SessionTrackingService = require('../../services/session-tracking.service');
        await SessionTrackingService.trackSession(
          user.id, 
          tabId, 
          user.vai_tro?.ten_vt
        );
      } catch (error) {
        logError('Failed to track session on login', error);
        // Don't fail login if session tracking fails
      }
    }

    // Generate token
    const token = this.generateToken(user, remember);

    logInfo('LOGIN_SUCCESS', { 
      userId: user.id, 
      maso: user.ten_dn, 
      role: user.vai_tro?.ten_vt,
      ip,
      tabId 
    });

    return {
      token,
      user: this.toUserDTO(user)
    };
  }

  /**
   * Register new user
   */
  static async register(userData) {
    const { maso, email, ho_ten, password, khoa, lop_id } = userData;

    // Check if maso exists
    const existingUser = await this.findUserByMaso(maso);
    if (existingUser) {
      throw new AppError('Mã số đã được sử dụng', 400, [
        { field: 'maso', message: 'Mã số đã được sử dụng' }
      ]);
    }

    // Check if email exists
    const existingEmail = await this.findUserByEmail(email);
    if (existingEmail) {
      throw new AppError('Email đã được sử dụng', 400, [
        { field: 'email', message: 'Email đã được sử dụng' }
      ]);
    }

    // Get or create student role
    let studentRole = await prisma.vaiTro.findFirst({ 
      where: { ten_vt: 'SINH_VIEN' } 
    });
    
    if (!studentRole) {
      studentRole = await prisma.vaiTro.create({
        data: { ten_vt: 'SINH_VIEN', mo_ta: 'Sinh viên' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create user
    const newUser = await prisma.nguoiDung.create({
      data: {
        ten_dn: maso,
        email,
        ho_ten,
        mat_khau: hashedPassword,
        vai_tro_id: studentRole.id,
        trang_thai: 'hoat_dong'
      },
      include: {
        vai_tro: true
      }
    });

    // Create student record if lop_id provided
    if (lop_id) {
      await prisma.sinhVien.create({
        data: {
          nguoi_dung_id: newUser.id,
          lop_id,
          khoa: khoa || 'Chưa xác định',
          mssv: maso
        }
      });
    }

    // Generate token
    const token = this.generateToken(newUser);

    logInfo('User registered successfully', { 
      userId: newUser.id, 
      maso: newUser.ten_dn,
      email: newUser.email 
    });

    return {
      token,
      user: this.toUserDTO(newUser)
    };
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('Người dùng không tồn tại', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.mat_khau);
    if (!isValid) {
      throw new AppError('Mật khẩu hiện tại không đúng', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Update password
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: { mat_khau: hashedPassword }
    });

    logInfo('Password changed', { userId });
  }

  /**
   * Generate and store OTP
   */
  static generateOtp(email) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    
    otpMemory.set(email, {
      hash,
      created_at: new Date(),
      attempts: 0,
      used_at: null
    });

    return otp;
  }

  /**
   * Verify OTP
   */
  static verifyOtp(email, otp) {
    const record = otpMemory.get(email);
    if (!record) return false;

    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const age = (now - record.created_at) / 1000 / 60;
    if (age > 10) {
      otpMemory.delete(email);
      return false;
    }

    // Check if already used
    if (record.used_at) return false;

    // Check attempts
    if (record.attempts >= 3) {
      otpMemory.delete(email);
      return false;
    }

    // Verify OTP
    const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
    const isValid = hash === record.hash;

    if (isValid) {
      record.used_at = now;
    } else {
      record.attempts++;
    }

    return isValid;
  }

  /**
   * Ensure demo users exist in development
   */
  static async ensureDemoUsersIfNeeded() {
    if (config.server.nodeEnv !== 'development') return;

    const count = await prisma.nguoiDung.count().catch(() => 0);
    if (count > 0) return;

    try {
      // Ensure roles exist
      const ensureRole = async (name, mo_ta) => {
        let role = await prisma.vaiTro.findFirst({ where: { ten_vt: name } });
        if (!role) {
          role = await prisma.vaiTro.create({ data: { ten_vt: name, mo_ta } });
        }
        return role.id;
      };

      const adminRoleId = await ensureRole('ADMIN', 'Quản trị viên hệ thống');

      // Create admin user
      const hashedPassword = await bcrypt.hash('123456', 10);
      await prisma.nguoiDung.create({
        data: {
          ten_dn: 'admin',
          email: 'admin@dlu.edu.vn',
          ho_ten: 'Quản Trị Viên',
          mat_khau: hashedPassword,
          vai_tro_id: adminRoleId,
          trang_thai: 'hoat_dong'
        }
      });

      logInfo('Demo users created');
    } catch (error) {
      logError('Failed to create demo users', error);
    }
  }
}

module.exports = AuthService;
