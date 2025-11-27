const UpdateUserDto = require('../dto/UpdateUserDto');
const { NotFoundError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');
const { ROLE_ALIASES } = require('../utils/admin-users.constants');

/**
 * UpdateUserUseCase
 * Use case for updating a user
 * Orchestrates business logic following Single Responsibility Principle
 */
class UpdateUserUseCase {
  constructor(adminUserRepository, hashService) {
    this.adminUserRepository = adminUserRepository;
    this.hashService = hashService;
  }

  async execute(userId, dto, adminId) {
    // Include sinh_vien to check if student profile already exists
    const existingUser = await this.adminUserRepository.findUserById(userId, {
      sinh_vien: true,
      vai_tro: true
    });

    if (!existingUser) {
      throw new NotFoundError(`Không tìm thấy người dùng với id ${userId}`);
    }

    const updateData = await this.buildUserUpdateData(existingUser, dto);
    const updatedUser = Object.keys(updateData).length
      ? await this.adminUserRepository.updateUser(userId, updateData)
      : existingUser;

    // Xử lý thông tin sinh viên: tạo mới nếu chưa có, cập nhật nếu đã có
    if (dto.student) {
      const hasStudentData = dto.student.mssv || dto.student.ngay_sinh || dto.student.gt || 
                             dto.student.dia_chi || dto.student.sdt || dto.student.lop_id;
      
      if (hasStudentData) {
        if (existingUser.sinh_vien) {
          // Cập nhật thông tin sinh viên đã có
          await this.updateStudentProfile(existingUser.sinh_vien.id, dto.student);
        } else {
          // Tạo mới thông tin sinh viên nếu user chưa có
          await this.createStudentProfile(userId, dto.student);
        }
      }
    }
    
    // Xử lý đặt làm lớp trưởng nếu có
    if (dto.set_lop_truong && dto.student?.lop_id) {
      const refreshedUser = await this.adminUserRepository.findUserById(userId, {
        sinh_vien: true
      });
      if (refreshedUser.sinh_vien) {
        await this.adminUserRepository.updateClassMonitor(
          dto.student.lop_id, 
          refreshedUser.sinh_vien.id, 
          null
        );
      }
    }

    const refreshedUser = await this.adminUserRepository.findUserById(userId);

    logInfo('User updated successfully', {
      adminId,
      updatedUserId: userId,
      changes: Object.keys(updateData)
    });

    return {
      id: refreshedUser.id,
      maso: refreshedUser.ten_dn,
      hoten: refreshedUser.ho_ten,
      email: refreshedUser.email,
      role: refreshedUser.vai_tro?.ten_vt,
      trang_thai: refreshedUser.trang_thai,
      sinh_vien: refreshedUser.sinh_vien
        ? {
            mssv: refreshedUser.sinh_vien.mssv,
            ngay_sinh: refreshedUser.sinh_vien.ngay_sinh,
            gt: refreshedUser.sinh_vien.gt,
            dia_chi: refreshedUser.sinh_vien.dia_chi,
            sdt: refreshedUser.sinh_vien.sdt,
            lop_id: refreshedUser.sinh_vien.lop_id,
            lop: refreshedUser.sinh_vien.lop
              ? {
                  id: refreshedUser.sinh_vien.lop.id,
                  ten_lop: refreshedUser.sinh_vien.lop.ten_lop,
                  khoa: refreshedUser.sinh_vien.lop.khoa
                }
              : null
          }
        : null
    };
  }

  async buildUserUpdateData(existingUser, dto) {
    const updateData = {};

    if (dto.maso && dto.maso !== existingUser.ten_dn) {
      const masoExists = await this.adminUserRepository.findUserByTenDn(dto.maso);
      if (masoExists) {
        throw new Error('Mã số đã tồn tại');
      }
      updateData.ten_dn = dto.maso;
    }

    if (dto.hoten) updateData.ho_ten = dto.hoten;
    if (dto.email) updateData.email = dto.email;

    if (dto.password) {
      updateData.mat_khau = await this.hashService.hash(dto.password);
    }

    if (dto.trang_thai) {
      updateData.trang_thai = dto.trang_thai;
    }

    if (dto.role && dto.role !== existingUser.vai_tro?.ten_vt) {
      const normalizedRole = this.normalizeRole(dto.role);
      const vaiTro = await this.adminUserRepository.upsertRole(normalizedRole);
      updateData.vai_tro_id = vaiTro.id;
    }

    return updateData;
  }

  normalizeRole(role) {
    if (!role) return role;
    return ROLE_ALIASES[role] || role;
  }

  async createStudentProfile(userId, studentData) {
    // Validation: cần có mssv và lop_id để tạo mới
    if (!studentData.mssv || !studentData.lop_id) {
      throw new Error('Cần có MSSV và Lớp để tạo thông tin sinh viên');
    }

    // Kiểm tra MSSV đã tồn tại chưa
    const existingStudent = await this.adminUserRepository.findStudentByMssv(studentData.mssv);
    if (existingStudent) {
      throw new Error(`Mã số sinh viên "${studentData.mssv}" đã tồn tại trong hệ thống`);
    }

    const ngaySinh = studentData.ngay_sinh ? new Date(studentData.ngay_sinh) : new Date();
    
    const newStudent = await this.adminUserRepository.createStudent(
      {
        nguoi_dung_id: userId,
        mssv: String(studentData.mssv),
        ngay_sinh: ngaySinh,
        gt: studentData.gt || 'nam',
        lop_id: String(studentData.lop_id),
        dia_chi: studentData.dia_chi || null,
        sdt: studentData.sdt || null,
        email: null // Email sẽ lấy từ nguoi_dung
      },
      null // Không cần transaction vì đã update user rồi
    );

    return newStudent;
  }

  async updateStudentProfile(studentId, studentData) {
    const updatePayload = {};
    if (studentData.mssv) updatePayload.mssv = studentData.mssv;
    if (studentData.ngay_sinh) updatePayload.ngay_sinh = new Date(studentData.ngay_sinh);
    if (studentData.gt) updatePayload.gt = studentData.gt;
    if (studentData.dia_chi !== undefined) updatePayload.dia_chi = studentData.dia_chi;
    if (studentData.sdt) updatePayload.sdt = studentData.sdt;
    if (studentData.lop_id) updatePayload.lop_id = studentData.lop_id;

    if (Object.keys(updatePayload).length > 0) {
      await this.adminUserRepository.updateStudent(studentId, updatePayload);
    }
  }
}

module.exports = UpdateUserUseCase;

