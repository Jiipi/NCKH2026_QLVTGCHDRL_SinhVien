const ISemesterRepository = require('../../business/interfaces/ISemesterRepository');
const { prisma } = require('../../../../data/infrastructure/prisma/client');

/**
 * SemesterPrismaRepository
 * Prisma implementation of ISemesterRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class SemesterPrismaRepository extends ISemesterRepository {
  async getSemesterOptions() {
    const rows = await prisma.hoatDong.findMany({
      select: { hoc_ky: true, nam_hoc: true },
      distinct: ['hoc_ky', 'nam_hoc'],
    });

    const seen = new Set();
    const opts = rows
      .filter((r) => r.hoc_ky && r.nam_hoc)
      .map((r) => {
        const semesterNum = r.hoc_ky === 'hoc_ky_1' ? '1' : r.hoc_ky === 'hoc_ky_2' ? '2' : r.hoc_ky;
        const yearMatch = r.nam_hoc.match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : r.nam_hoc;
        const value = `${r.hoc_ky}-${year}`;
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
      .filter(Boolean)
      .sort((a, b) => b.value.localeCompare(a.value));

    // Add "All semesters" option at the beginning
    return [
      { value: '', label: 'Tất cả học kỳ', semester: null, year: null },
      ...opts
    ];
  }

  async getAllClasses() {
    const rows = await prisma.lop.findMany({
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

    return rows.map(r => ({
      id: r.id,
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

  async getClassDetail(classId) {
    const classRow = await prisma.lop.findUnique({
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

  async getClassStudents(classId) {
    const students = await prisma.sinhVien.findMany({
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

    return students.map((student) => ({
      id: student.id,
      ho_ten: student.nguoi_dung?.ho_ten,
      name: student.nguoi_dung?.ho_ten,
      ten_sv: student.nguoi_dung?.ho_ten,
      mssv: student.mssv,
      ma_sv: student.mssv,
      email: student.email || student.nguoi_dung?.email || null,
      phone: student.sdt || null
    }));
  }

  async getActivitiesBySemester(classId, semester) {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where = { lop_id: classId };
    if (hoc_ky && nam_hoc) {
      where.hoc_ky = hoc_ky;
      where.nam_hoc = nam_hoc;
    }

    const activities = await prisma.hoatDong.findMany({
      where,
      include: {
        loai_hoat_dong: { select: { ten_loai_hd: true } },
        dang_ky: {
          select: {
            trang_thai: true,
            sinh_vien_id: true,
          },
        },
      },
      orderBy: { ngay_to_chuc: 'desc' },
    });

    return activities;
  }

  async getRegistrationsBySemester(classId, semester) {
    const [hoc_ky, nam_hoc] = semester ? semester.split('_') : [null, null];

    const where = {
      hoat_dong: { lop_id: classId },
    };

    if (hoc_ky && nam_hoc) {
      where.hoat_dong = {
        ...where.hoat_dong,
        hoc_ky,
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
            ngay_to_chuc: true,
            hoc_ky: true,
            nam_hoc: true,
          },
        },
      },
      orderBy: { ngay_dang_ky: 'desc' },
    });

    return registrations;
  }
}

module.exports = SemesterPrismaRepository;

