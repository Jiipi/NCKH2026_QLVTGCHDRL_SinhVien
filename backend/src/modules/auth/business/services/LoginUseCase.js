const { UnauthorizedError } = require('../../../../core/errors/AppError');
const { logInfo, logError } = require('../../../../core/logger');

/**
 * LoginUseCase
 * Use case for user authentication
 * Follows Single Responsibility Principle (SRP)
 */
class LoginUseCase {
  constructor(authRepository, hashService, tokenService, otpService) {
    this.authRepository = authRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
    this.otpService = otpService;
  }

  async execute(dto, ip = null, tabId = null) {
    logInfo('LOGIN_ATTEMPT', { maso: dto.maso });

    // Find user
    let user = await this.authRepository.findByEmailOrMaso(dto.maso);
    
    // Auto-create demo users in development if DB is empty
    if (!user && process.env.NODE_ENV === 'development') {
      await this.ensureDemoUsersIfNeeded();
      user = await this.authRepository.findByEmailOrMaso(dto.maso);
    }

    if (!user) {
      logInfo('LOGIN_USER_NOT_FOUND', { maso: dto.maso });
      throw new UnauthorizedError('Mã số hoặc mật khẩu không đúng');
    }

    // Verify password
    const isPasswordValid = await this.verifyPasswordAndUpgrade(user, dto.password);
    logInfo('LOGIN_PASSWORD_CHECK', { maso: dto.maso, ok: !!isPasswordValid });

    if (!isPasswordValid) {
      throw new UnauthorizedError('Mã số hoặc mật khẩu không đúng');
    }

    // Check account status
    if (user.trang_thai !== 'hoat_dong') {
      throw new UnauthorizedError('Tài khoản đã bị khóa');
    }

    // Update login info
    await this.authRepository.updateUser(user.id, {
      lan_cuoi_dn: new Date()
    });

    // Track session if tabId provided
    if (tabId) {
      try {
        const SessionTrackingService = require('../../../../business/services/session-tracking.service');
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
    const token = this.tokenService.generateToken(user, dto.remember);

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

  async verifyPasswordAndUpgrade(user, password) {
    const isValid = await this.hashService.compare(password, user.mat_khau);

    // Upgrade old hash if needed
    if (isValid && !user.mat_khau.startsWith('$2b$')) {
      const config = require('../../../../core/config');
      const newHash = await this.hashService.hash(password);
      await this.authRepository.updateUser(user.id, {
        mat_khau: newHash
      });
    }

    return isValid;
  }

  toUserDTO(user) {
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

  async ensureDemoUsersIfNeeded() {
    if (process.env.NODE_ENV !== 'development') return;

    const count = await this.authRepository.countUsers();
    if (count > 0) return;

    try {
      const config = require('../../../../core/config');
      const { logInfo } = require('../../../../core/logger');

      // Ensure admin role exists
      let adminRole = await this.authRepository.findRoleByName('ADMIN');
      if (!adminRole) {
        adminRole = await this.authRepository.createRole({
          ten_vt: 'ADMIN',
          mo_ta: 'Quản trị viên hệ thống'
        });
      }

      // Create admin user
      const hashedPassword = await this.hashService.hash('123456');
      await this.authRepository.createUser({
        ten_dn: 'admin',
        email: 'admin@dlu.edu.vn',
        ho_ten: 'Quản Trị Viên',
        mat_khau: hashedPassword,
        vai_tro_id: adminRole.id,
        trang_thai: 'hoat_dong'
      });

      logInfo('Demo users created');
    } catch (error) {
      logError('Failed to create demo users', error);
    }
  }
}

module.exports = LoginUseCase;

