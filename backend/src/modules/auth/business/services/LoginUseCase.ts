/**
 * LoginUseCase
 * Use case for user authentication
 * Follows Single Responsibility Principle (SRP)
 */

import { UnauthorizedError } from '../../../../core/errors/AppError';
import { logInfo, logError } from '../../../../core/logger';
import { IAuthRepository, UserWithRole } from '../interfaces/IAuthRepository';
import { ITokenService } from '../interfaces/ITokenService';
import { IOtpService } from '../interfaces/IOtpService';
import { LoginDto } from '../dto/LoginDto';
import { prisma } from '../../../../data/infrastructure/prisma/client';

export interface IHashService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface UserDTO {
  id: string;
  maso: string;
  email: string | null;
  ho_ten: string;
  roleCode: string;
  roleName: string;
  avatar: string | null;
  status: string;
}

export interface LoginResult {
  token: string;
  user: UserDTO;
}

class LoginUseCase {
  private authRepository: IAuthRepository;
  private hashService: IHashService;
  private tokenService: ITokenService;
  private otpService: IOtpService;

  constructor(
    authRepository: IAuthRepository,
    hashService: IHashService,
    tokenService: ITokenService,
    otpService: IOtpService
  ) {
    this.authRepository = authRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
    this.otpService = otpService;
  }

  async execute(dto: LoginDto, ip: string | null = null, tabId: string | null = null): Promise<LoginResult> {
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
    if (user.trang_thai === 'khoa') {
      throw new UnauthorizedError('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }
    if (user.trang_thai !== 'hoat_dong') {
      throw new UnauthorizedError('Tài khoản không hoạt động');
    }

    // Update login info
    await this.authRepository.updateUser(user.id, {
      lan_cuoi_dn: new Date()
    });

    // Track session if tabId provided
    if (tabId) {
      try {
        const SessionTrackingService = (await import('../../../../business/services/session-tracking.service')).default;
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

    // Generate token (now async to support isMonitor check)
    const token = await this.tokenService.generateToken(user, dto.remember);

    logInfo('LOGIN_SUCCESS', {
      userId: user.id,
      maso: user.ten_dn,
      role: user.vai_tro?.ten_vt,
      ip,
      tabId
    });

    return {
      token,
      user: await this.toUserDTO(user)
    };
  }

  private async verifyPasswordAndUpgrade(user: UserWithRole, password: string): Promise<boolean> {
    // Security: Only accept bcrypt hashed passwords
    if (!user.mat_khau || !user.mat_khau.startsWith('$2')) {
      logError('Non-bcrypt password detected for user', undefined, { maso: user.ten_dn });
      logError('Password hashing migration is required', undefined, { script: 'node backend/scripts/force_hash_passwords.js' });
      return false;
    }
    
    return await this.hashService.compare(password, user.mat_khau);
  }

  private async toUserDTO(user: UserWithRole): Promise<UserDTO> {
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

  private async ensureDemoUsersIfNeeded(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') return;

    const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD;
    if (!demoAdminPassword || demoAdminPassword.length < 8) {
      logInfo('Skipping demo user bootstrap because DEMO_ADMIN_PASSWORD is missing or too short');
      return;
    }

    const count = await this.authRepository.countUsers();
    if (count > 0) return;

    try {
      const config = (await import('../../../../core/config')).default;

      // Ensure admin role exists
      let adminRole = await this.authRepository.findRoleByName('ADMIN');
      if (!adminRole) {
        adminRole = await this.authRepository.createRole({
          ten_vt: 'ADMIN',
          mo_ta: 'Quản trị viên hệ thống'
        });
      }

      // Create admin user
      const hashedPassword = await this.hashService.hash(demoAdminPassword);
      await this.authRepository.createUser({
        ten_dn: 'admin',
        email: 'admin@dlu.edu.vn',
        ho_ten: 'Quản Trị Viên',
        mat_khau: hashedPassword,
        vai_tro_id: adminRole.id!,
        trang_thai: 'hoat_dong'
      });

      logInfo('Demo users created');
    } catch (error) {
      logError('Failed to create demo users', error);
    }
  }
}

export default LoginUseCase;
