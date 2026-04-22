/**
 * RegisterUseCase
 * Use case for user registration
 * Follows Single Responsibility Principle (SRP)
 */

import { ConflictError } from '../../../../core/errors/AppError';
import { logInfo, logWarn, logError } from '../../../../core/logger';
import { IAuthRepository, UserWithRole } from '../interfaces/IAuthRepository';
import { ITokenService } from '../interfaces/ITokenService';
import { RegisterDto } from '../dto/RegisterDto';
import { IHashService, UserDTO } from './LoginUseCase';

type ErrorWithCode = Error & { code?: string };

// Extended interface for repository with student lookup
interface IAuthRepositoryWithStudent extends IAuthRepository {
  findStudentByMssv(mssv: string): Promise<{ id: string; nguoi_dung_id: string } | null>;
}

interface RegisterResult {
  token: string;
  user: UserDTO;
}

class RegisterUseCase {
  private authRepository: IAuthRepositoryWithStudent;
  private hashService: IHashService;
  private tokenService: ITokenService;

  constructor(
    authRepository: IAuthRepositoryWithStudent,
    hashService: IHashService,
    tokenService: ITokenService
  ) {
    this.authRepository = authRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async execute(dto: RegisterDto): Promise<RegisterResult> {
    logInfo('Register flow started', {
      maso: dto.maso,
      ho_ten: dto.ho_ten,
      hasLopId: !!dto.lop_id,
      khoa: dto.khoa
    });

    // Check if maso exists in nguoiDung table
    const existingUser = await this.authRepository.findUserByMaso(dto.maso);
    if (existingUser) {
      throw new ConflictError('Mã số đã được sử dụng', [
        { field: 'maso', message: 'Mã số đã được sử dụng' }
      ]);
    }

    // Check if mssv exists in sinhVien table (mssv is unique)
    const existingStudent = await this.authRepository.findStudentByMssv(dto.maso);
    if (existingStudent) {
      throw new ConflictError('Mã số đã được sử dụng', [
        { field: 'maso', message: 'Mã số đã được sử dụng' }
      ]);
    }

    // Check if email exists in nguoiDung table
    const existingEmail = await this.authRepository.findUserByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError('Email đã được sử dụng', [
        { field: 'email', message: 'Email đã được sử dụng' }
      ]);
    }

    // Get or create student role
    let studentRole = await this.authRepository.findRoleByName('SINH_VIEN');
    if (!studentRole) {
      studentRole = await this.authRepository.createRole({
        ten_vt: 'SINH_VIEN',
        mo_ta: 'Sinh viên'
      });
    }

    // Hash password
    const hashedPassword = await this.hashService.hash(dto.password);

    // Create user
    const newUser = await this.authRepository.createUser({
      ten_dn: dto.maso,
      email: dto.email,
      ho_ten: dto.ho_ten,
      mat_khau: hashedPassword,
      vai_tro_id: studentRole.id!,
      trang_thai: 'hoat_dong'
    });

    // Create student record - REQUIRED for student role
    if (!dto.lop_id) {
      logWarn('Register completed without student record (missing lop_id)', {
        userId: newUser.id,
        maso: newUser.ten_dn
      });
      logInfo('User registered without student record (missing lop_id)', {
        userId: newUser.id,
        maso: newUser.ten_dn
      });
    } else {
      try {
        // Parse ngay_sinh from string to Date, or use default
        let ngaySinhDate: Date;
        if (dto.ngay_sinh) {
          ngaySinhDate = new Date(dto.ngay_sinh);
          if (isNaN(ngaySinhDate.getTime())) {
            logWarn('Invalid ngay_sinh in register payload, using default date');
            ngaySinhDate = new Date('2000-01-01');
          }
        } else {
          logWarn('ngay_sinh not provided in register payload, using default date');
          ngaySinhDate = new Date('2000-01-01');
        }

        logInfo('Creating student record during register', {
          nguoi_dung_id: newUser.id,
          lop_id: dto.lop_id,
          mssv: dto.maso,
          ngay_sinh: ngaySinhDate,
          hasGioiTinh: !!dto.gioi_tinh,
          hasSdt: !!dto.sdt,
          hasDiaChi: !!dto.dia_chi
        });

        const student = await this.authRepository.createStudent({
          nguoi_dung_id: newUser.id,
          lop_id: dto.lop_id,
          mssv: dto.maso,
          ngay_sinh: ngaySinhDate,
          gioi_tinh: dto.gioi_tinh || undefined,
          sdt: dto.sdt || undefined,
          dia_chi: dto.dia_chi || undefined
        });
        logInfo('Student record created successfully during register', {
          studentId: student.id,
          mssv: student.mssv,
          lop_id: student.lop_id
        });
      } catch (studentErr: unknown) {
        const error: ErrorWithCode = studentErr instanceof Error
          ? (studentErr as ErrorWithCode)
          : new Error(String(studentErr));
        logError('Failed to create student record during register', error);
        logInfo('User created but student record creation failed', {
          userId: newUser.id,
          error: error.message,
          errorCode: error.code
        });
      }
    }

    // Generate token
    const token = await this.tokenService.generateToken(newUser);

    logInfo('User registered successfully', {
      userId: newUser.id,
      maso: newUser.ten_dn,
      email: newUser.email,
      hasStudentRecord: !!dto.lop_id
    });

    return {
      token,
      user: this.toUserDTO(newUser)
    };
  }

  private toUserDTO(user: UserWithRole): UserDTO {
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
}

export default RegisterUseCase;
