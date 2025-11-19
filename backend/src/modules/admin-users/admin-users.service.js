const bcrypt = require('bcryptjs');

const { validatePaginationParams, createQueryOptions, createPaginationResponse } = require('../../core/utils/pagination');
const { logInfo } = require('../../core/logger');
const adminUsersRepository = require('./admin-users.repo');
const { ROLE_ALIASES } = require('./admin-users.constants');
const { createAdminUserSchema, updateAdminUserSchema } = require('./admin-users.validators');
const { mapUserToListItem, mapUserToDetail, mapUsersToCsv } = require('./admin-users.mappers');

const ADMIN_USERS_MAX_LIMIT = 1000;

class AdminUsersService {
  async getUsersAdmin(params) {
    const paginationParams = validatePaginationParams(params, {
      defaultPage: 1,
      defaultLimit: 20,
      maxLimit: ADMIN_USERS_MAX_LIMIT
    });

    const whereCondition = await this.buildFilterConditions(params);
    const queryOptions = createQueryOptions(paginationParams, { ngay_tao: 'desc' });

    const [users, total] = await Promise.all([
      adminUsersRepository.findUsers(whereCondition, queryOptions),
      adminUsersRepository.countUsers(whereCondition)
    ]);

    const transformedUsers = users.map(mapUserToListItem);

    return {
      users: transformedUsers,
      pagination: createPaginationResponse({
        page: paginationParams.page,
        limit: paginationParams.limit,
        total,
        maxLimit: ADMIN_USERS_MAX_LIMIT
      })
    };
  }

  async createUserAdmin(data, adminId) {
    const validatedData = createAdminUserSchema.parse(data);
    const normalizedRole = this.normalizeRole(validatedData.role);

    const existingUser = await adminUsersRepository.findExistingUserByCredentials(
      validatedData.maso,
      validatedData.email
    );

    if (existingUser) {
      throw new Error('Mã số hoặc email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const vaiTro = await adminUsersRepository.upsertRole(normalizedRole);

    const result = await adminUsersRepository.runInTransaction(async (tx) => {
      const newUser = await adminUsersRepository.createUser(
        {
          ten_dn: validatedData.maso,
          mat_khau: hashedPassword,
          email: validatedData.email,
          ho_ten: validatedData.hoten,
          vai_tro_id: vaiTro.id,
          trang_thai: 'hoat_dong'
        },
        tx
      );

      const studentResult = await this.handleStudentCreation(
        tx,
        normalizedRole,
        validatedData,
        newUser.id
      );

      return { newUser, newStudent: studentResult };
    });

    logInfo('User created successfully', {
      adminId,
      newUserId: result.newUser.id,
      userMaso: validatedData.maso,
      role: normalizedRole,
      studentId: result.newStudent?.id || null
    });

    const userWithRole = await adminUsersRepository.findUserById(result.newUser.id);
    return mapUserToDetail(userWithRole);
  }

  async updateUserAdmin(id, data, adminId) {
    const validatedData = updateAdminUserSchema.parse(data);

    const existingUser = await adminUsersRepository.findUserById(id);

    if (!existingUser) {
      throw new Error('Không tìm thấy người dùng');
    }

    const updateData = await this.buildUserUpdateData(existingUser, validatedData);
    const updatedUser = Object.keys(updateData).length
      ? await adminUsersRepository.updateUser(id, updateData)
      : existingUser;

    if (validatedData.student) {
      if (!existingUser.sinh_vien) {
        throw new Error('Người dùng này không có hồ sơ sinh viên để cập nhật');
      }
      await this.updateStudentProfile(existingUser.sinh_vien.id, validatedData.student);
    }

    const refreshedUser = await adminUsersRepository.findUserById(id);

    logInfo('User updated successfully', {
      adminId,
      updatedUserId: id,
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

  async deleteUserAdmin(id, adminId) {
    const existingUser = await adminUsersRepository.findUserById(id, {
      vai_tro: true,
      sinh_vien: true
    });

    if (!existingUser) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (existingUser.id === String(adminId)) {
      throw new Error('Không thể xóa tài khoản của chính mình');
    }

    await adminUsersRepository.runInTransaction(async (tx) => {
      const sinhVienId = existingUser.sinh_vien?.id;

      if (sinhVienId) {
        await adminUsersRepository.deleteStudentRegistrations(tx, sinhVienId);
        await adminUsersRepository.deleteStudentAttendance(tx, sinhVienId);
      }

      await adminUsersRepository.deleteNotificationsByUser(tx, id);

      if (sinhVienId) {
        await adminUsersRepository.clearClassMonitorByStudent(tx, sinhVienId);
      }

      await this.handleHeadTeacherTransfer(tx, id);
      await this.handleActivityTransfer(tx, id);
      await this.handleAttendanceTransfer(tx, id);

      if (sinhVienId) {
        await adminUsersRepository.deleteStudent(tx, sinhVienId);
      }

      await adminUsersRepository.deleteUser(tx, id);
    });

    logInfo('User deleted completely from system', {
      adminId,
      deletedUserId: id,
      deletedUserMaso: existingUser.ten_dn,
      deletedUserRole: existingUser.vai_tro?.ten_vt,
      hadSinhVien: !!existingUser.sinh_vien
    });
  }

  async getUserByIdAdmin(id) {
    const user = await adminUsersRepository.findUserById(id);

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return mapUserToDetail(user);
  }

  async exportUsersCSV(filters) {
    const whereCondition = await this.buildFilterConditions(filters);
    const users = await adminUsersRepository.findUsers(whereCondition, {
      orderBy: { ngay_tao: 'desc' }
    });

    return mapUsersToCsv(users);
  }

  async buildFilterConditions(params = {}) {
    const { search, role, status } = params;
    const whereCondition = {};

    if (search) {
      whereCondition.OR = [
        { ho_ten: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ten_dn: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      const normalizedRole = this.normalizeRole(role);
      const roleRecord = await adminUsersRepository.findRoleByName(normalizedRole);
      if (roleRecord) {
        whereCondition.vai_tro_id = roleRecord.id;
      }
    }

    if (status) {
      whereCondition.trang_thai = status;
    }

    return whereCondition;
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

    if (!data.mssv || !data.lop_id) {
      throw new Error('Thiếu mssv hoặc lop_id cho vai trò sinh viên');
    }

    const ngaySinh = data.ngay_sinh ? new Date(data.ngay_sinh) : new Date();
    const newStudent = await adminUsersRepository.createStudent(
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
      await adminUsersRepository.updateClassMonitor(data.lop_id, newStudent.id, tx);
    }

    return newStudent;
  }

  async buildUserUpdateData(existingUser, validatedData) {
    const updateData = {};

    if (validatedData.maso && validatedData.maso !== existingUser.ten_dn) {
      const masoExists = await adminUsersRepository.findUserByTenDn(validatedData.maso);
      if (masoExists) {
        throw new Error('Mã số đã tồn tại');
      }
      updateData.ten_dn = validatedData.maso;
    }

    if (validatedData.hoten) updateData.ho_ten = validatedData.hoten;
    if (validatedData.email) updateData.email = validatedData.email;

    if (validatedData.password) {
      updateData.mat_khau = await bcrypt.hash(validatedData.password, 10);
    }

    if (validatedData.trang_thai) {
      updateData.trang_thai = validatedData.trang_thai;
    }

    if (validatedData.role && validatedData.role !== existingUser.vai_tro?.ten_vt) {
      const normalizedRole = this.normalizeRole(validatedData.role);
      const vaiTro = await adminUsersRepository.upsertRole(normalizedRole);
      updateData.vai_tro_id = vaiTro.id;
    }

    return updateData;
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
      await adminUsersRepository.updateStudent(studentId, updatePayload);
    }
  }

  async handleHeadTeacherTransfer(tx, userId) {
    const classesAsHeadTeacher = await adminUsersRepository.findClassesAsHeadTeacher(tx, userId);
    if (!classesAsHeadTeacher.length) return;

    const replacementTeacher = await adminUsersRepository.findReplacementTeacher(tx, userId);

    if (!replacementTeacher) {
      throw new Error(
        `Không thể xóa user vì đang là chủ nhiệm ${classesAsHeadTeacher.length} lớp ` +
          `(${classesAsHeadTeacher.map((c) => c.ten_lop).join(', ')}) ` +
          'và không có giảng viên khác để thay thế. Vui lòng chuyển chủ nhiệm trước khi xóa.'
      );
    }

    await adminUsersRepository.updateHeadTeacherForClasses(tx, userId, replacementTeacher.id);
    logInfo('Transferred class head teacher', {
      from: userId,
      to: replacementTeacher.id,
      classCount: classesAsHeadTeacher.length
    });
  }

  async handleActivityTransfer(tx, userId) {
    const createdActivities = await adminUsersRepository.countActivitiesByCreator(tx, userId);
    if (!createdActivities) return;

    const otherAdmin = await adminUsersRepository.findReplacementAdmin(tx, userId);

    if (otherAdmin) {
      await adminUsersRepository.reassignActivities(tx, userId, otherAdmin.id);
    } else {
      await adminUsersRepository.deleteActivitiesByCreator(tx, userId);
    }
  }

  async handleAttendanceTransfer(tx, userId) {
    const attendanceRecordsByUser = await adminUsersRepository.countAttendanceByChecker(tx, userId);
    if (!attendanceRecordsByUser) return;

    const replacementChecker = await adminUsersRepository.findReplacementChecker(tx, userId);

    if (replacementChecker) {
      await adminUsersRepository.reassignAttendanceChecker(tx, userId, replacementChecker.id);
    } else {
      await adminUsersRepository.deleteAttendanceByChecker(tx, userId);
      logInfo('Deleted attendance records with no replacement', {
        count: attendanceRecordsByUser
      });
    }
  }
}

module.exports = new AdminUsersService();

