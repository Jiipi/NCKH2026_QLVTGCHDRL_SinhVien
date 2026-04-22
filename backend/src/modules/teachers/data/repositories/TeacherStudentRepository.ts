/**
 * Teacher Student Repository
 * Handles student-related operations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import { parseSemesterString } from '../../../../core/utils/semester';
import bcrypt from 'bcryptjs';
import { findTeacherClassesRaw } from './helpers/teacherClassHelper';
import type { HocKy, Prisma } from '@prisma/client';

export interface TeacherStudentFilters {
  search?: string;
  classId?: string;
  semester?: string;
}

export interface CreateStudentPayload {
  ho_ten: string;
  email: string;
  mssv: string;
  ngay_sinh?: string | Date;
  gt?: string;
  lop_id: string;
  dia_chi?: string | null;
  sdt?: string | null;
  ten_dn: string;
  mat_khau: string;
}

export interface CreateStudentResult {
  id: string;
  nguoi_dung: {
    id: string;
    ten_dn: string;
    email: string;
    ho_ten: string | null;
    vai_tro_id: string;
  };
  sinh_vien: {
    id: string;
    nguoi_dung_id: string;
    mssv: string;
    lop_id: string;
  };
}

export interface UpdateStudentPayload {
  ho_ten?: string;
  email?: string;
  mssv?: string;
  ngay_sinh?: string | Date;
  gt?: string;
  lop_id?: string;
  dia_chi?: string | null;
  sdt?: string | null;
  ten_dn?: string;
  mat_khau?: string;
}

export interface ExportStudentData {
  mssv: string;
  ho_ten: string | null | undefined;
  email: string | null | undefined;
  lop: string | null | undefined;
  khoa: string | null | undefined;
  nien_khoa: string | null | undefined;
  sdt: string | null;
}

/**
 * Teacher Student Repository class
 */
class TeacherStudentRepository {
  /**
   * Get students in teacher's classes
   * @param teacherId - Teacher's user ID
   * @param filters - Optional filters { search, classId, semester }
   * @returns Array of students with relations
   */
  async getTeacherStudents(teacherId: string, filters: TeacherStudentFilters = {}) {
    const classes = await findTeacherClassesRaw(teacherId);
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return [];
    }

    const { search, classId, semester } = filters;

    // Build where clause - query from SinhVien
    const whereSinhVien: Prisma.SinhVienWhereInput = {
      lop_id: classId ? String(classId) : { in: classIds },
      ...(search && {
        OR: [
          { mssv: { contains: String(search), mode: 'insensitive' as const } },
          {
            nguoi_dung: {
              OR: [
                { ho_ten: { contains: String(search), mode: 'insensitive' as const } },
                { email: { contains: String(search), mode: 'insensitive' as const } }
              ]
            }
          }
        ]
      })
    };

    // Build semester where clause using simple filter
    // IMPORTANT: For dashboard, we want to show ALL students in the class
    // But only calculate points from registrations in the selected semester
    const registrationWhere: Prisma.DangKyHoatDongWhereInput = {
      trang_thai_dk: 'da_tham_gia' // Only count if student actually attended (QR scanned)
    };

    // Apply semester filter to registrations (not to students)
    if (semester) {
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        registrationWhere.hoat_dong = {
          hoc_ky: parsed.semester as HocKy,
          nam_hoc: {
            contains: parsed.year
          }
        };
      }
    }

    const students = await prisma.sinhVien.findMany({
      where: whereSinhVien,
      include: {
        nguoi_dung: {
          select: {
            id: true,
            ho_ten: true,
            email: true,
            anh_dai_dien: true
          }
        },
        lop: {
          select: {
            id: true,
            ten_lop: true
          }
        },
        dang_ky_hd: {
          where: registrationWhere,
          select: {
            hoat_dong: {
              select: {
                diem_rl: true,
                loai_hd: {
                  select: {
                    diem_mac_dinh: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { mssv: 'asc' }
    });

    // Calculate totalPoints from dang_ky_hd array (sum of diem_rl)
    return students.map(sv => {
      const totalPoints = (sv.dang_ky_hd || []).reduce((sum, reg) => {
        return sum + Number(reg.hoat_dong?.diem_rl || 0);
      }, 0);

      return {
        ...sv,
        totalPoints,
        activitiesJoined: sv.dang_ky_hd?.length || 0
      };
    });
  }

  /**
   * Export students data for teacher's classes
   * @param teacherId - Teacher's user ID
   * @returns Array of student export data
   */
  async exportStudents(teacherId: string): Promise<ExportStudentData[]> {
    const classes = await findTeacherClassesRaw(teacherId);
    const classIds = classes.map(c => c.id);

    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      include: {
        nguoi_dung: { select: { ho_ten: true, email: true } },
        lop: { select: { ten_lop: true, khoa: true, nien_khoa: true } }
      },
      orderBy: [{ lop: { ten_lop: 'asc' } }, { mssv: 'asc' }]
    });

    return students.map(s => ({
      mssv: s.mssv,
      ho_ten: s.nguoi_dung?.ho_ten,
      email: s.nguoi_dung?.email,
      lop: s.lop?.ten_lop,
      khoa: s.lop?.khoa,
      nien_khoa: s.lop?.nien_khoa,
      sdt: s.sdt
    }));
  }

  /**
   * Create a single student in a class owned by the teacher
   * @param teacherId - Teacher's user ID
   * @param payload - Student data
   * @returns Created user and student
   */
  async createStudent(teacherId: string, payload: CreateStudentPayload): Promise<CreateStudentResult> {
    const {
      ho_ten, email, mssv,
      ngay_sinh, gt = 'nam', lop_id,
      dia_chi = null, sdt = null,
      ten_dn, mat_khau
    } = payload;

    // 1) Verify class ownership
    const lop = await prisma.lop.findFirst({ where: { id: String(lop_id), chu_nhiem: String(teacherId) } });
    if (!lop) {
      const err = new Error('Bạn không có quyền trên lớp này hoặc lớp không tồn tại') as Error & { statusCode?: number };
      err.statusCode = 403;
      throw err;
    }

    // 2) Uniqueness checks
    const [existsSV, existsUserByEmail, existsUserByUsername] = await Promise.all([
      prisma.sinhVien.findFirst({ where: { mssv: String(mssv) } }),
      prisma.nguoiDung.findFirst({ where: { email: String(email).toLowerCase() } }),
      prisma.nguoiDung.findFirst({ where: { ten_dn: String(ten_dn) } })
    ]);
    if (existsSV) {
      const e = new Error('MSSV đã tồn tại') as Error & { statusCode?: number };
      e.statusCode = 400;
      throw e;
    }
    if (existsUserByEmail) {
      const e = new Error('Email đã tồn tại') as Error & { statusCode?: number };
      e.statusCode = 400;
      throw e;
    }
    if (existsUserByUsername) {
      const e = new Error('Tên đăng nhập đã tồn tại') as Error & { statusCode?: number };
      e.statusCode = 400;
      throw e;
    }

    // 3) Ensure student role exists
    let studentRole = await prisma.vaiTro.findFirst({ where: { ten_vt: { in: ['SINH_VIEN', 'SINH_VIÊN'] } } });
    if (!studentRole) {
      studentRole = await prisma.vaiTro.create({ data: { ten_vt: 'SINH_VIEN', mo_ta: 'Vai trò Sinh viên' } });
    }

    // 4) Transaction create
    const hashed = await bcrypt.hash(String(mat_khau), 10);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.nguoiDung.create({
        data: {
          ten_dn: String(ten_dn),
          mat_khau: hashed,
          email: String(email).toLowerCase(),
          ho_ten: String(ho_ten),
          vai_tro_id: studentRole!.id,
          trang_thai: 'hoat_dong'
        }
      });
      const sv = await tx.sinhVien.create({
        data: {
          nguoi_dung_id: user.id,
          mssv: String(mssv),
          ngay_sinh: ngay_sinh ? new Date(ngay_sinh as string) : null,
          gt: (gt || 'nam') as 'nam' | 'nu',
          lop_id: String(lop_id),
          dia_chi,
          sdt: sdt ? String(sdt) : null,
          email: String(email).toLowerCase()
        }
      });
      return {
        id: user.id,
        nguoi_dung: {
          id: user.id,
          ten_dn: user.ten_dn,
          email: user.email,
          ho_ten: user.ho_ten,
          vai_tro_id: user.vai_tro_id!
        },
        sinh_vien: {
          id: sv.id,
          nguoi_dung_id: sv.nguoi_dung_id!,
          mssv: sv.mssv,
          lop_id: sv.lop_id!
        }
      };
    });

    return result;
  }

  /**
   * Update a student in a class owned by the teacher
   */
  async updateStudent(teacherId: string, studentId: string, payload: UpdateStudentPayload): Promise<CreateStudentResult> {
    const sv = await prisma.sinhVien.findFirst({
      where: {
        OR: [
          { id: studentId },
          { nguoi_dung_id: studentId }
        ],
        lop: { chu_nhiem: teacherId }
      },
      include: { nguoi_dung: true, lop: true }
    });

    if (!sv) {
      const err = new Error('Sinh viên không thuộc lớp bạn phụ trách hoặc không tồn tại') as Error & { statusCode?: number };
      err.statusCode = 403;
      throw err;
    }

    const {
      ho_ten, email, mssv,
      ngay_sinh, gt, lop_id,
      dia_chi, sdt,
      ten_dn, mat_khau
    } = payload;

    if (mssv && mssv !== sv.mssv) {
      const e = await prisma.sinhVien.findFirst({ where: { mssv: String(mssv) } });
      if (e) {
        const err = new Error('MSSV đã tồn tại') as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
    }
    if (email && email.toLowerCase() !== sv.email?.toLowerCase()) {
      const e = await prisma.nguoiDung.findFirst({ where: { email: String(email).toLowerCase() } });
      if (e) {
        const err = new Error('Email đã tồn tại') as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
    }
    if (ten_dn && ten_dn !== sv.nguoi_dung?.ten_dn) {
      const e = await prisma.nguoiDung.findFirst({ where: { ten_dn: String(ten_dn) } });
      if (e) {
        const err = new Error('Tên đăng nhập đã tồn tại') as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
    }

    let hashed: string | undefined;
    if (mat_khau) {
      hashed = await bcrypt.hash(String(mat_khau), 10);
    }

    const result = await prisma.$transaction(async (tx) => {
      const userUpdate: any = {};
      if (ten_dn) userUpdate.ten_dn = String(ten_dn);
      if (hashed) userUpdate.mat_khau = hashed;
      if (email) userUpdate.email = String(email).toLowerCase();
      if (ho_ten) userUpdate.ho_ten = String(ho_ten);

      let user;
      if (Object.keys(userUpdate).length > 0) {
        user = await tx.nguoiDung.update({
          where: { id: sv.nguoi_dung_id! },
          data: userUpdate
        });
      } else {
        user = sv.nguoi_dung!;
      }

      const svUpdate: any = {};
      if (mssv) svUpdate.mssv = String(mssv);
      if (ngay_sinh) svUpdate.ngay_sinh = new Date(ngay_sinh as string);
      if (gt) svUpdate.gt = gt as 'nam' | 'nu';
      if (lop_id) svUpdate.lop_id = String(lop_id);
      if (dia_chi !== undefined) svUpdate.dia_chi = dia_chi;
      if (sdt !== undefined) svUpdate.sdt = sdt ? String(sdt) : null;
      if (email) svUpdate.email = String(email).toLowerCase();

      let student;
      if (Object.keys(svUpdate).length > 0) {
        student = await tx.sinhVien.update({
          where: { id: sv.id },
          data: svUpdate
        });
      } else {
        student = sv;
      }

      return {
        id: user.id,
        nguoi_dung: {
          id: user.id,
          ten_dn: user.ten_dn,
          email: user.email,
          ho_ten: user.ho_ten,
          vai_tro_id: user.vai_tro_id!
        },
        sinh_vien: {
          id: student.id,
          nguoi_dung_id: student.nguoi_dung_id!,
          mssv: student.mssv,
          lop_id: student.lop_id!
        }
      };
    });

    return result;
  }

  /**
   * Delete a student in a class owned by the teacher
   */
  async deleteStudent(teacherId: string, studentId: string): Promise<boolean> {
    const sv = await prisma.sinhVien.findFirst({
      where: {
        OR: [
          { id: studentId },
          { nguoi_dung_id: studentId }
        ],
        lop: { chu_nhiem: teacherId }
      },
      select: { id: true, nguoi_dung_id: true }
    });

    if (!sv) {
      const err = new Error('Sinh viên không thuộc lớp bạn phụ trách hoặc không tồn tại') as Error & { statusCode?: number };
      err.statusCode = 403;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      // Delete relationships first
      await tx.dangKyHoatDong.deleteMany({ where: { sv_id: sv.id } });
      await tx.diemDanh.deleteMany({ where: { sv_id: sv.id } });
      // Delete SinhVien
      await tx.sinhVien.delete({ where: { id: sv.id } });
      // Delete NguoiDung
      if (sv.nguoi_dung_id) {
        await tx.nguoiDung.delete({ where: { id: sv.nguoi_dung_id } });
      }
    });

    return true;
  }
}

export default TeacherStudentRepository;
