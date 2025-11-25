const { ConflictError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');

/**
 * RegisterUseCase
 * Use case for user registration
 * Follows Single Responsibility Principle (SRP)
 */
class RegisterUseCase {
  constructor(authRepository, hashService, tokenService) {
    this.authRepository = authRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async execute(dto) {
    console.log('[RegisterUseCase] Starting registration:', { 
      maso: dto.maso, 
      email: dto.email, 
      ho_ten: dto.ho_ten,
      hasLopId: !!dto.lop_id,
      khoa: dto.khoa
    });

    // Check if maso exists in nguoiDung table
    const existingUser = await this.authRepository.findUserByMaso(dto.maso);
    console.log('[RegisterUseCase] Check maso in nguoiDung:', { maso: dto.maso, exists: !!existingUser });
    if (existingUser) {
      console.log('[RegisterUseCase] Maso already exists in nguoiDung:', { maso: dto.maso, userId: existingUser.id });
      throw new ConflictError('Mã số đã được sử dụng', [
        { field: 'maso', message: 'Mã số đã được sử dụng' }
      ]);
    }

    // Check if mssv exists in sinhVien table (mssv is unique)
    const existingStudent = await this.authRepository.findStudentByMssv(dto.maso);
    console.log('[RegisterUseCase] Check mssv in sinhVien:', { mssv: dto.maso, exists: !!existingStudent });
    if (existingStudent) {
      console.log('[RegisterUseCase] Mssv already exists in sinhVien:', { mssv: dto.maso, studentId: existingStudent.id, userId: existingStudent.nguoi_dung_id });
      throw new ConflictError('Mã số đã được sử dụng', [
        { field: 'maso', message: 'Mã số đã được sử dụng' }
      ]);
    }

    // Check if email exists in nguoiDung table
    const existingEmail = await this.authRepository.findUserByEmail(dto.email);
    console.log('[RegisterUseCase] Check email in nguoiDung:', { email: dto.email, exists: !!existingEmail });
    if (existingEmail) {
      console.log('[RegisterUseCase] Email already exists in nguoiDung:', { email: dto.email, userId: existingEmail.id });
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
    const config = require('../../../../core/config');
    const hashedPassword = await this.hashService.hash(dto.password);

    // Create user
    console.log('[RegisterUseCase] Creating user...');
    const newUser = await this.authRepository.createUser({
      ten_dn: dto.maso,
      email: dto.email,
      ho_ten: dto.ho_ten,
      mat_khau: hashedPassword,
      vai_tro_id: studentRole.id,
      trang_thai: 'hoat_dong'
    });
    console.log('[RegisterUseCase] User created:', { userId: newUser.id, maso: newUser.ten_dn, email: newUser.email });

    // Create student record - REQUIRED for student role
    // Schema requires lop_id and ngay_sinh
    if (!dto.lop_id) {
      console.warn('[RegisterUseCase] WARNING: lop_id not provided, student record will not be created');
      console.warn('[RegisterUseCase] This may cause issues when logging in as student record is required');
      logInfo('User registered without student record (missing lop_id)', {
        userId: newUser.id,
        maso: newUser.ten_dn
      });
    } else {
      try {
        // Parse ngay_sinh from string to Date, or use default
        let ngaySinhDate;
        if (dto.ngay_sinh) {
          ngaySinhDate = new Date(dto.ngay_sinh);
          if (isNaN(ngaySinhDate.getTime())) {
            console.warn('[RegisterUseCase] Invalid ngay_sinh, using default');
            ngaySinhDate = new Date('2000-01-01');
          }
        } else {
          console.warn('[RegisterUseCase] ngay_sinh not provided, using default date');
          ngaySinhDate = new Date('2000-01-01');
        }

        console.log('[RegisterUseCase] Creating student record...', { 
          nguoi_dung_id: newUser.id, 
          lop_id: dto.lop_id, 
          mssv: dto.maso,
          ngay_sinh: ngaySinhDate,
          gioi_tinh: dto.gioi_tinh,
          sdt: dto.sdt,
          dia_chi: dto.dia_chi
        });
        
        const student = await this.authRepository.createStudent({
          nguoi_dung_id: newUser.id,
          lop_id: dto.lop_id,
          mssv: dto.maso,
          ngay_sinh: ngaySinhDate,
          email: dto.email,
          gt: dto.gioi_tinh || null, // Map to schema field name 'gt'
          sdt: dto.sdt || null,
          dia_chi: dto.dia_chi || null
        });
        console.log('[RegisterUseCase] Student record created successfully:', { 
          studentId: student.id, 
          mssv: student.mssv,
          lop_id: student.lop_id
        });
      } catch (studentErr) {
        console.error('[RegisterUseCase] Failed to create student record:', studentErr.message);
        console.error('[RegisterUseCase] Error code:', studentErr.code);
        console.error('[RegisterUseCase] Error details:', studentErr);
        logInfo('User created but student record creation failed', {
          userId: newUser.id,
          error: studentErr.message,
          errorCode: studentErr.code
        });
        // Don't throw error - user is created, but student record failed
        // This allows user to login but may cause issues with student features
      }
    }

    // Generate token
    const token = this.tokenService.generateToken(newUser);

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
}

module.exports = RegisterUseCase;

