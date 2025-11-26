const AdminUser = require('../entities/AdminUser.entity');
const CreateUserDto = require('../dto/CreateUserDto');
const { mapUserToDetail } = require('../utils/admin-users.mappers');
const { ROLE_ALIASES } = require('../utils/admin-users.constants');
const { logInfo } = require('../../../../core/logger');
const { ConflictError } = require('../../../../core/errors/AppError');

/**
 * CreateUserUseCase
 * Use case for creating a new user
 * Orchestrates business logic following Single Responsibility Principle
 */
class CreateUserUseCase {
  constructor(adminUserRepository, hashService) {
    this.adminUserRepository = adminUserRepository;
    this.hashService = hashService;
  }

  async execute(dto, adminId) {
    const normalizedRole = this.normalizeRole(dto.role);

    // Check if user already exists (ten_dn hoặc email)
    const existingUser = await this.adminUserRepository.findExistingUserByCredentials(
      dto.maso,
      dto.email
    );

    // Kiểm tra tên đăng nhập hoặc email đã tồn tại
    if (existingUser) {
      const conflictField = existingUser.ten_dn === dto.maso ? 'Tên đăng nhập' : 'Email';
      throw new ConflictError(`${conflictField} "${dto.maso === existingUser.ten_dn ? dto.maso : dto.email}" đã được sử dụng. Vui lòng chọn tên đăng nhập hoặc email khác.`);
    }

    // Kiểm tra mssv trùng nếu là sinh viên hoặc lớp trưởng
    const isStudentRole = normalizedRole === 'SINH_VIÊN' || normalizedRole === 'LỚP_TRƯỞNG';
    if (isStudentRole && dto.mssv) {
      const existingStudent = await this.adminUserRepository.findStudentByMssv(dto.mssv);
      if (existingStudent) {
        throw new ConflictError(`Mã số sinh viên "${dto.mssv}" đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.`);
      }
    }

    // Hash password
    const hashedPassword = await this.hashService.hash(dto.password);

    // Get or create role
    const vaiTro = await this.adminUserRepository.upsertRole(normalizedRole);

    // Create user in transaction
    const result = await this.adminUserRepository.runInTransaction(async (tx) => {
      const newUser = await this.adminUserRepository.createUser(
        {
          ten_dn: dto.maso,
          mat_khau: hashedPassword,
          email: dto.email,
          ho_ten: dto.hoten,
          vai_tro_id: vaiTro.id,
          trang_thai: 'hoat_dong'
        },
        tx
      );

      const newStudent = await this.handleStudentCreation(
        tx,
        normalizedRole,
        dto,
        newUser.id
      );

      return { newUser, newStudent };
    });

    logInfo('User created successfully', {
      adminId,
      newUserId: result.newUser.id,
      userMaso: dto.maso,
      role: normalizedRole,
      studentId: result.newStudent?.id || null
    });

    const userWithRole = await this.adminUserRepository.findUserById(result.newUser.id);
    return mapUserToDetail(userWithRole);
  }

  normalizeRole(role) {
    if (!role) return role;
    return ROLE_ALIASES[role] || role;
  }

  async handleStudentCreation(tx, role, data, userId) {
    const isStudentRole = role === 'SINH_VIÊN' || role === 'LỚP_TRƯỞNG';

    if (!isStudentRole && !data.set_lop_truong) {
      return null;
    }

    if (!data.mssv) {
      throw new Error('Vui lòng nhập mã số sinh viên (MSSV)');
    }
    if (!data.lop_id) {
      throw new Error('Vui lòng chọn lớp cho sinh viên');
    }

    const ngaySinh = data.ngay_sinh ? new Date(data.ngay_sinh) : new Date();
    const newStudent = await this.adminUserRepository.createStudent(
      {
        nguoi_dung_id: userId,
        mssv: String(data.mssv),
        ngay_sinh: ngaySinh,
        gt: data.gt || 'nam',
        lop_id: String(data.lop_id),
        dia_chi: data.dia_chi || null,
        sdt: data.sdt || null,
        email: data.email
      },
      tx
    );

    if (role === 'LỚP_TRƯỞNG' || data.set_lop_truong) {
      await this.adminUserRepository.updateClassMonitor(data.lop_id, newStudent.id, tx);
    }

    return newStudent;
  }
}

module.exports = CreateUserUseCase;

