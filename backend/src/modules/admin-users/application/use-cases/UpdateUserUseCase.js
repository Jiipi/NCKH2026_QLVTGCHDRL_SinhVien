const UpdateUserDto = require('../dto/UpdateUserDto');
const { NotFoundError } = require('../../../../core/errors/AppError');
const { logInfo } = require('../../../../core/logger');
const { ROLE_ALIASES } = require('../../admin-users.constants');

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
    const existingUser = await this.adminUserRepository.findUserById(userId);

    if (!existingUser) {
      throw new NotFoundError(`Không tìm thấy người dùng với id ${userId}`);
    }

    const updateData = await this.buildUserUpdateData(existingUser, dto);
    const updatedUser = Object.keys(updateData).length
      ? await this.adminUserRepository.updateUser(userId, updateData)
      : existingUser;

    if (dto.student) {
      if (!existingUser.sinh_vien) {
        throw new Error('Người dùng này không có hồ sơ sinh viên để cập nhật');
      }
      await this.updateStudentProfile(existingUser.sinh_vien.id, dto.student);
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

