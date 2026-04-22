import type { PrismaClient, HocKy, Prisma } from '@prisma/client';
import ISemesterRepository, {
  SemesterOption,
  ClassDetail,
  ClassStudent,
  Activity,
  Registration,
  SemesterDistinctRow,
  ClassIdentity,
  StudentClassIdentity
} from '../../business/interfaces/ISemesterRepository';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { buildSemesterValue } from '../../../../core/utils/semester';

interface SemesterOptionResult {
  value: string;
  label: string;
  semester: string | null;
  year: string | null;
}

interface ClassRow {
  id: string;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  chu_nhiem_rel: {
    ho_ten: string | null;
    ten_dn: string | null;
    email: string | null;
  } | null;
  lop_truong_rel: {
    mssv: string;
    nguoi_dung: { ho_ten: string | null } | null;
  } | null;
  _count: { sinh_viens: number } | null;
}

interface ClassDetailRow {
  id: string;
  ten_lop: string;
  khoa: string | null;
  nien_khoa: string | null;
  chu_nhiem_rel: {
    id: string;
    ho_ten: string | null;
    ten_dn: string | null;
    email: string | null;
  } | null;
  lop_truong_rel: {
    id: string;
    mssv: string;
    nguoi_dung: { ho_ten: string | null; email: string | null } | null;
  } | null;
  _count: { sinh_viens: number } | null;
}

interface StudentRow {
  id: string;
  mssv: string;
  email: string | null;
  sdt: string | null;
  nguoi_dung: { ho_ten: string | null; email: string | null } | null;
}

/**
 * SemesterPrismaRepository
 * Prisma implementation of ISemesterRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class SemesterPrismaRepository extends ISemesterRepository {
  async findSystemActivityType() {
    return prisma.loaiHoatDong.findFirst({
      where: { ten_loai_hd: 'Hệ thống' }
    });
  }

  async createSystemActivityType() {
    return prisma.loaiHoatDong.create({
      data: {
        ten_loai_hd: 'Hệ thống',
        mo_ta: 'Loại hoạt động hệ thống để quản lý học kỳ',
        diem_mac_dinh: 0,
        diem_toi_da: 0,
        mau_sac: '#94a3b8'
      }
    });
  }

  async getDistinctSemesters(): Promise<SemesterDistinctRow[]> {
    return prisma.hoatDong.findMany({
      select: { hoc_ky: true, nam_hoc: true },
      distinct: ['hoc_ky', 'nam_hoc'],
      where: {
        nam_hoc: { not: null }
      }
    }) as Promise<SemesterDistinctRow[]>;
  }

  async existsSemesterActivity(hocKy: HocKy, namHoc: string): Promise<boolean> {
    const existing = await prisma.hoatDong.findFirst({
      where: {
        hoc_ky: hocKy,
        nam_hoc: namHoc
      },
      select: { id: true }
    });
    return !!existing;
  }

  async createSemesterSystemActivity(data: {
    hoc_ky: HocKy;
    nam_hoc: string;
    ngay_bd: Date;
    ngay_kt: Date;
    loai_hd_id: string;
    nguoi_tao_id: string;
  }): Promise<void> {
    await prisma.hoatDong.create({
      data: {
        ten_hd: `[SYSTEM] Học kỳ ${data.hoc_ky === 'hoc_ky_1' ? '1' : '2'} năm học ${data.nam_hoc}`,
        mo_ta: 'Hoạt động hệ thống để đánh dấu học kỳ mới',
        hoc_ky: data.hoc_ky,
        nam_hoc: data.nam_hoc,
        ngay_bd: data.ngay_bd,
        ngay_kt: data.ngay_kt,
        ngay_tao: new Date(),
        loai_hd_id: data.loai_hd_id,
        nguoi_tao_id: data.nguoi_tao_id,
        trang_thai: 'da_duyet'
      }
    });
  }

  async findClassByMonitorUserId(userId: string): Promise<ClassIdentity | null> {
    return prisma.lop.findFirst({
      where: {
        lop_truong_rel: {
          nguoi_dung_id: userId
        }
      },
      select: { id: true }
    }) as Promise<ClassIdentity | null>;
  }

  async findStudentClassByUserId(userId: string): Promise<StudentClassIdentity | null> {
    return prisma.sinhVien.findFirst({
      where: { nguoi_dung_id: userId },
      select: { lop_id: true }
    }) as Promise<StudentClassIdentity | null>;
  }

  async getSemesterOptions(): Promise<SemesterOption[]> {
    const rows = await prisma.hoatDong.findMany({
      select: { hoc_ky: true, nam_hoc: true },
      distinct: ['hoc_ky', 'nam_hoc'],
    });

    const seen = new Set<string>();
    const opts: SemesterOptionResult[] = rows
      .filter((r) => r.hoc_ky && r.nam_hoc)
      .map((r) => {
        const semesterNum = r.hoc_ky === 'hoc_ky_1' ? '1' : r.hoc_ky === 'hoc_ky_2' ? '2' : r.hoc_ky;
        const yearMatch = r.nam_hoc?.match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : r.nam_hoc || '';
        // Use standardized format with underscore: hoc_ky_1_2025
        const value = buildSemesterValue(r.hoc_ky as string, year);
        const label = `Học kỳ ${semesterNum} - ${year}`;

        if (seen.has(value)) return null;
        seen.add(value);

        return {
          value,
          label,
          semester: r.hoc_ky,
          year: year,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.value.localeCompare(a.value));

    // Add "All semesters" option at the beginning
    return [
      { value: '', label: 'Tất cả học kỳ', semester: null, year: null } as unknown as SemesterOption,
      ...opts as unknown as SemesterOption[]
    ];
  }

  async getAllClasses(): Promise<ClassDetail[]> {
    const rows: ClassRow[] = await prisma.lop.findMany({
      select: {
        id: true,
        ten_lop: true,
        khoa: true,
        nien_khoa: true,
        chu_nhiem_rel: { select: { ho_ten: true, ten_dn: true, email: true } },
        lop_truong_rel: {
          select: {
            mssv: true,
            nguoi_dung: { select: { ho_ten: true } }
          }
        },
        _count: { select: { sinh_viens: true } }
      },
      orderBy: { ten_lop: 'asc' }
    });

    return rows.map((r): ClassDetail => ({
      id: r.id,
      ten: r.ten_lop,
      ten_lop: r.ten_lop,
      khoa: r.khoa,
      nien_khoa: r.nien_khoa,
      studentCount: r._count?.sinh_viens || 0,
      teacher: r.chu_nhiem_rel ? {
        name: r.chu_nhiem_rel.ho_ten || r.chu_nhiem_rel.ten_dn,
        email: r.chu_nhiem_rel.email
      } : null,
      monitor: r.lop_truong_rel ? {
        mssv: r.lop_truong_rel.mssv,
        name: r.lop_truong_rel.nguoi_dung?.ho_ten || null
      } : null
    }));
  }

  async getClassDetail(classId: string): Promise<ClassDetail | null> {
    const classRow: ClassDetailRow | null = await prisma.lop.findUnique({
      where: { id: classId },
      include: {
        chu_nhiem_rel: { select: { id: true, ho_ten: true, ten_dn: true, email: true } },
        lop_truong_rel: {
          select: {
            id: true,
            mssv: true,
            nguoi_dung: { select: { ho_ten: true, email: true } }
          }
        },
        _count: { select: { sinh_viens: true } }
      }
    });

    if (!classRow) {
      return null;
    }

    return {
      id: classRow.id,
      ten: classRow.ten_lop,
      name: classRow.ten_lop,
      faculty: classRow.khoa,
      academicYear: classRow.nien_khoa,
      studentCount: classRow._count?.sinh_viens || 0,
      teacher: classRow.chu_nhiem_rel
        ? {
            id: classRow.chu_nhiem_rel.id,
            name: classRow.chu_nhiem_rel.ho_ten || classRow.chu_nhiem_rel.ten_dn,
            email: classRow.chu_nhiem_rel.email
          }
        : null,
      monitor: classRow.lop_truong_rel
        ? {
            id: classRow.lop_truong_rel.id,
            mssv: classRow.lop_truong_rel.mssv,
            name: classRow.lop_truong_rel.nguoi_dung?.ho_ten || null,
            email: classRow.lop_truong_rel.nguoi_dung?.email || null
          }
        : null
    };
  }

  async getClassStudents(classId: string): Promise<ClassStudent[]> {
    const students: StudentRow[] = await prisma.sinhVien.findMany({
      where: { lop_id: classId },
      orderBy: [{ mssv: 'asc' }],
      select: {
        id: true,
        mssv: true,
        email: true,
        sdt: true,
        nguoi_dung: { select: { ho_ten: true, email: true } }
      }
    });

    return students.map((student): ClassStudent => ({
      id: student.id,
      maSV: student.mssv,
      hoTen: student.nguoi_dung?.ho_ten || '',
      ho_ten: student.nguoi_dung?.ho_ten,
      name: student.nguoi_dung?.ho_ten,
      ten_sv: student.nguoi_dung?.ho_ten,
      mssv: student.mssv,
      ma_sv: student.mssv,
      email: student.email || student.nguoi_dung?.email || null,
      phone: student.sdt || null
    }));
  }

  async getActivitiesBySemester(classId: string, semester: string): Promise<Activity[]> {
    const parts = semester ? semester.split('_') : [null, null];
    const hoc_ky = parts[0] || null;
    const nam_hoc = parts[1] || null;

    const where: Prisma.HoatDongWhereInput = { lop_id: classId };
    if (hoc_ky && nam_hoc) {
      where.hoc_ky = hoc_ky as HocKy;
      where.nam_hoc = nam_hoc;
    }

    const activities = await prisma.hoatDong.findMany({
      where,
      include: {
        loai_hd: { select: { ten_loai_hd: true } },
        dang_ky_hd: {
          select: {
            trang_thai_dk: true,
            sv_id: true,
          },
        },
      },
      orderBy: { ngay_bd: 'desc' },
    });

    return activities as unknown as Activity[];
  }

  async getRegistrationsBySemester(classId: string, semester: string): Promise<Registration[]> {
    const parts = semester ? semester.split('_') : [null, null];
    const hoc_ky = parts[0] || null;
    const nam_hoc = parts[1] || null;

    const where: Prisma.DangKyHoatDongWhereInput = {
      hoat_dong: { lop_id: classId },
    };

    if (hoc_ky && nam_hoc) {
      where.hoat_dong = {
        ...where.hoat_dong as Prisma.HoatDongWhereInput,
        hoc_ky: hoc_ky as HocKy,
        nam_hoc,
      };
    }

    const registrations = await prisma.dangKyHoatDong.findMany({
      where,
      include: {
        sinh_vien: {
          select: {
            mssv: true,
            nguoi_dung: { select: { ho_ten: true } },
          },
        },
        hoat_dong: {
          select: {
            ten_hd: true,
            ngay_bd: true,
            hoc_ky: true,
            nam_hoc: true,
          },
        },
      },
      orderBy: { ngay_dang_ky: 'desc' },
    });

    return registrations as unknown as Registration[];
  }
}

export default SemesterPrismaRepository;
module.exports = SemesterPrismaRepository;
