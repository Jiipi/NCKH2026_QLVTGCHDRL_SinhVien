/**
 * Teacher Class Repository
 * Handles class-related operations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');
const { findTeacherClassesRaw } = require('./helpers/teacherClassHelper');

class TeacherClassRepository {
  /**
   * Get classes assigned to teacher with counts
   * @param {string} teacherId - Teacher's user ID
   * @param {Object} include - Optional Prisma include object
   * @returns {Promise<Array>} Array of classes
   */
  async getTeacherClasses(teacherId, include = {}) {
    console.log('[getTeacherClasses] teacherId=', teacherId);
    const result = await prisma.lop.findMany({
      where: { chu_nhiem: teacherId },
      include: {
        _count: {
          select: {
            sinh_viens: true
          }
        },
        ...include
      },
      orderBy: { ten_lop: 'asc' }
    });
    console.log('[getTeacherClasses] found', result.length, 'classes');
    return result;
  }

  /**
   * Get class names (ten_lop) assigned to teacher
   * @param {string} teacherId - Teacher's user ID
   * @returns {Promise<Array>} Array of class names
   */
  async getTeacherClassNames(teacherId) {
    const classes = await findTeacherClassesRaw(teacherId);
    return classes.map(c => c.ten_lop);
  }

  /**
   * Check if teacher has access to class (homeroom owner)
   * @param {string} teacherId - Teacher's user ID
   * @param {string} className - Class name (ten_lop)
   * @returns {Promise<boolean>} True if teacher has access
   */
  async hasAccessToClass(teacherId, className) {
    const lop = await prisma.lop.findUnique({ where: { ten_lop: className } });
    if (!lop) return false;
    return lop.chu_nhiem === teacherId;
  }

  /**
   * Assign class monitor for a class the teacher owns
   * @param {string} teacherId - Teacher's user id (NguoiDung.id)
   * @param {string} classId - Lop.id
   * @param {string} studentId - SinhVien.id
   * @returns {Promise<Object>} Result with classId and monitorStudentId
   */
  async assignClassMonitor(teacherId, classId, studentId) {
    // 1) Verify class ownership
    const lop = await prisma.lop.findFirst({
      where: { id: String(classId), chu_nhiem: String(teacherId) },
      select: { id: true, ten_lop: true, lop_truong: true }
    });
    if (!lop) {
      const err = new Error('Bạn không có quyền trên lớp này hoặc lớp không tồn tại');
      err.statusCode = 403;
      throw err;
    }

    // 2) Verify student belongs to class
    const student = await prisma.sinhVien.findFirst({
      where: { id: String(studentId), lop_id: String(classId) },
      select: { id: true, nguoi_dung_id: true }
    });
    if (!student) {
      const err = new Error('Sinh viên không thuộc lớp này hoặc không tồn tại');
      err.statusCode = 400;
      throw err;
    }

    // 3) Ensure roles exist
    let roleMonitor = await prisma.vaiTro.findFirst({ where: { ten_vt: 'LOP_TRUONG' } });
    if (!roleMonitor) {
      roleMonitor = await prisma.vaiTro.create({ data: { ten_vt: 'LOP_TRUONG', mo_ta: 'Vai trò Lớp trưởng' } });
    }
    let roleStudent = await prisma.vaiTro.findFirst({ where: { ten_vt: 'SINH_VIEN' } });
    if (!roleStudent) {
      roleStudent = await prisma.vaiTro.create({ data: { ten_vt: 'SINH_VIEN', mo_ta: 'Vai trò Sinh viên' } });
    }

    // 4) Transaction: downgrade previous monitor, set new one, update roles
    const result = await prisma.$transaction(async (tx) => {
      // Downgrade previous monitor if different
      if (lop.lop_truong && String(lop.lop_truong) !== String(student.id)) {
        const prev = await tx.sinhVien.findUnique({
          where: { id: String(lop.lop_truong) },
          select: { nguoi_dung_id: true }
        });
        if (prev?.nguoi_dung_id) {
          await tx.nguoiDung.update({
            where: { id: prev.nguoi_dung_id },
            data: { vai_tro_id: roleStudent.id }
          });
        }
      }

      // Set class monitor to new student
      await tx.lop.update({ where: { id: String(classId) }, data: { lop_truong: String(student.id) } });

      // Upgrade selected student's role to LOP_TRUONG
      await tx.nguoiDung.update({
        where: { id: student.nguoi_dung_id },
        data: { vai_tro_id: roleMonitor.id }
      });

      return {
        classId: String(classId),
        monitorStudentId: String(student.id)
      };
    });

    return result;
  }
}

module.exports = TeacherClassRepository;

