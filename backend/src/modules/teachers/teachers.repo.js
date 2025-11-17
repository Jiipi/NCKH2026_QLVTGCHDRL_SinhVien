/**
 * Teachers Repository - Pure Data Access Layer (updated for new Prisma schema)
 * Maps teacher operations onto current models: NguoiDung, Lop, SinhVien, HoatDong, DangKyHoatDong.
 * NOTE: Legacy naming (class, user, activity, registration) replaced.
 */

const { prisma } = require('../../infrastructure/prisma/client');
const { parseSemesterString } = require('../../core/utils/semester');

// Helper: get classes where teacher is homeroom (chu_nhiem)
async function findTeacherClassesRaw(teacherId) {
  return prisma.lop.findMany({
    where: { chu_nhiem: teacherId },
    select: { id: true, ten_lop: true }
  });
}

const teachersRepo = {
  /**
   * Get teacher dashboard stats with semester support (V1 compatible).
   * Counts classes, students, activities, participation rate, avg score.
   * @param {string} teacherId - Teacher's user ID
   * @param {string} semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   */
  async getDashboardStats(teacherId, semester = null, classId = null) {
    let classes = await findTeacherClassesRaw(teacherId);
    if (classId) {
      classes = classes.filter(c => String(c.id) === String(classId));
    }
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return {
        totalActivities: 0,
        pendingApprovals: 0,
        totalStudents: 0,
        avgClassScore: 0,
        participationRate: 0,
        approvedThisWeek: 0
      };
    }

    // Get all students in teacher's classes
    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      select: { id: true, nguoi_dung_id: true }
    });

    const studentIds = students.map(s => s.id);
    const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);

    // Build activity filter with simple semester matching
    const activityWhere = {
      nguoi_tao_id: { in: studentUserIds }
    };
    
    if (semester) {
      const { parseSemesterString } = require('../../core/utils/semester');
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        activityWhere.hoc_ky = parsed.semester;
        activityWhere.nam_hoc = parsed.year;
      }
    }

    const [
      totalActivities,
      pendingActivitiesCount,
      approvedLastWeek,
      participatedRegistrations
    ] = await Promise.all([
      // Total activities created by students
      prisma.hoatDong.count({ where: activityWhere }),

      // Pending activities count
      prisma.hoatDong.count({
        where: {
          ...activityWhere,
          trang_thai: 'cho_duyet'
        }
      }),

      // Approved activities in last 7 days
      prisma.hoatDong.count({
        where: {
          ...activityWhere,
          trang_thai: 'da_duyet',
          ngay_cap_nhat: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Get participated registrations to calculate scores
      prisma.dangKyHoatDong.findMany({
        where: {
          sv_id: { in: studentIds },
          trang_thai_dk: 'da_tham_gia',
          hoat_dong: activityWhere
        },
        include: {
          hoat_dong: {
            select: { diem_rl: true }
          }
        }
      })
    ]);

    // Calculate average score
    const totalScore = participatedRegistrations.reduce((sum, reg) => {
      return sum + (Number(reg.hoat_dong?.diem_rl) || 0);
    }, 0);
    const avgClassScore = studentIds.length > 0 
      ? Math.round(totalScore / studentIds.length) 
      : 0;

    // Calculate participation rate
    const uniqueParticipants = new Set(participatedRegistrations.map(r => r.sv_id));
    const participationRate = studentIds.length > 0
      ? Math.round((uniqueParticipants.size / studentIds.length) * 100)
      : 0;

    return {
      totalActivities,
      pendingApprovals: pendingActivitiesCount,
      totalStudents: studentIds.length,
      avgClassScore,
      participationRate,
      approvedThisWeek: approvedLastWeek
    };
  },

  /**
   * Get class names (ten_lop) assigned to teacher (homeroom).
   */
  async getTeacherClassNames(teacherId) {
    const classes = await findTeacherClassesRaw(teacherId);
    return classes.map(c => c.ten_lop);
  },

  /**
   * Get pending activities from teacher's class students (V1 compatible).
   * @param {string} teacherId - Teacher's user ID
   * @param {string} semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   * @param {number} limit - Max number of activities to return
   */
  async getPendingActivitiesList(teacherId, semester = null, limit = 10, classId = null) {
    let classes = await findTeacherClassesRaw(teacherId);
    if (classId) {
      classes = classes.filter(c => String(c.id) === String(classId));
    }
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return [];
    }

    // Get all students in teacher's classes
    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      select: { nguoi_dung_id: true }
    });

    const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);

    // Build semester where clause using simple filter
    const activityWhere = {
      nguoi_tao_id: { in: studentUserIds },
      trang_thai: 'cho_duyet'
    };
    
    if (semester) {
      const { parseSemesterString } = require('../../core/utils/semester');
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        activityWhere.hoc_ky = parsed.semester;
        activityWhere.nam_hoc = parsed.year;
      }
    }

    // Get pending activities
    return prisma.hoatDong.findMany({
      where: activityWhere,
      include: {
        loai_hd: true,
        nguoi_tao: {
          select: {
            ho_ten: true,
            sinh_vien: {
              select: {
                mssv: true,
                lop: { select: { ten_lop: true } }
              }
            }
          }
        }
      },
      orderBy: { ngay_tao: 'desc' },
      take: limit
    });
  },

  /**
   * Get recent notifications sent by teacher.
   * @param {string} teacherId - Teacher's user ID
   * @param {number} limit - Max number of notifications to return
   */
  async getRecentNotifications(teacherId, limit = 5) {
    return prisma.thongBao.findMany({
      where: {
        nguoi_gui_id: teacherId
      },
      include: {
        loai_tb: true
      },
      orderBy: { ngay_gui: 'desc' },
      take: limit
    });
  },

  /**
   * Get classes assigned to teacher with counts.
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
  },

  /**
   * Get students in teacher's classes (V1 compatible).
   * Returns NguoiDung objects with sinh_vien relation.
   * @param {string} teacherId - Teacher's user ID
   * @param {Object} filters - Optional filters { search, classFilter }
   */
  async getTeacherStudents(teacherId, filters = {}) {
    const classes = await findTeacherClassesRaw(teacherId);
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return [];
    }

    const { search, classId, semester } = filters;

    // Build where clause - query from SinhVien
    const whereSinhVien = {
      lop_id: classId ? String(classId) : { in: classIds },
      ...(search && {
        OR: [
          { mssv: { contains: String(search), mode: 'insensitive' } },
          { nguoi_dung: { 
            OR: [
              { ho_ten: { contains: String(search), mode: 'insensitive' } },
              { email: { contains: String(search), mode: 'insensitive' } }
            ]
          } }
        ]
      })
    };

    // Build semester where clause using simple filter
    const registrationWhere = {
      trang_thai_dk: 'da_tham_gia'
    };
    
    if (semester) {
      const { parseSemesterString } = require('../../core/utils/semester');
      const parsed = parseSemesterString(semester);
      if (parsed && parsed.year) {
        registrationWhere.hoat_dong = {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        };
      }
    }

    return prisma.sinhVien.findMany({
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
                diem_rl: true
              }
            }
          }
        }
      },
      orderBy: { mssv: 'asc' }
    });
  },

  /**
   * Get class statistics by class name (ten_lop).
   * semesterFilter can be based on hoc_ky + nam_hoc; semesterId param from legacy replaced by parsing.
   */
  async getClassStats(className, semesterId = null) {
    // Resolve class id from name
    const lop = await prisma.lop.findUnique({ where: { ten_lop: className } });
    if (!lop) {
      return {
        totalStudents: 0,
        totalActivities: 0,
        approvedActivities: 0,
        totalRegistrations: 0,
        approvedRegistrations: 0
      };
    }

    // Build activity filter: activities created by teacher involving this class's students
    // Since HoatDong does not directly link to Lop, we approximate by registrations of students in class.
    // Counts:
    const totalStudents = await prisma.sinhVien.count({ where: { lop_id: lop.id } });

    // Activities with at least one registration from class
    const activityWhere = {
      dang_ky_hd: {
        some: {
          sinh_vien: { lop_id: lop.id }
        }
      }
    };

    const approvedActivityWhere = {
      ...activityWhere,
      trang_thai: 'da_duyet'
    };

    if (semesterId) {
      // Expect semesterId maybe encoded as hocKy-year combination. Basic parse attempt:
      // Format assumption: "1-2024" => hoc_ky_1 + year contains 2024.
      const [hkRaw, yearRaw] = String(semesterId).split('-');
      const hocKy = hkRaw === '2' ? 'hoc_ky_2' : 'hoc_ky_1';
      activityWhere.hoc_ky = hocKy;
      activityWhere.nam_hoc = { contains: yearRaw };
      approvedActivityWhere.hoc_ky = hocKy;
      approvedActivityWhere.nam_hoc = { contains: yearRaw };
    }

    const [totalActivities, approvedActivities] = await Promise.all([
      prisma.hoatDong.count({ where: activityWhere }),
      prisma.hoatDong.count({ where: approvedActivityWhere })
    ]);

    // Registrations by students in class
    const registrationWhere = {
      sinh_vien: { lop_id: lop.id }
    };
    if (semesterId) {
      registrationWhere.hoat_dong = {
        hoc_ky: activityWhere.hoc_ky,
        nam_hoc: activityWhere.nam_hoc
      };
    }
    const approvedRegistrationWhere = {
      ...registrationWhere,
      trang_thai_dk: 'da_duyet'
    };

    const [totalRegistrations, approvedRegistrations] = await Promise.all([
      prisma.dangKyHoatDong.count({ where: registrationWhere }),
      prisma.dangKyHoatDong.count({ where: approvedRegistrationWhere })
    ]);

    return {
      totalStudents,
      totalActivities,
      approvedActivities,
      totalRegistrations,
      approvedRegistrations
    };
  },

  /**
   * Export students data for teacher's classes.
   */
  async exportStudents(teacherId) {
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
  },

  /**
   * Check if teacher has access to class (homeroom owner).
   */
  async hasAccessToClass(teacherId, className) {
    const lop = await prisma.lop.findUnique({ where: { ten_lop: className } });
    if (!lop) return false;
    return lop.chu_nhiem === teacherId;
  },

  /**
   * Check if teacher created the activity.
   */
  /**
   * Check if teacher has access to activity (V1 compatible).
   * Teacher can approve/reject activities created by students in their homeroom classes.
   * @param {string} teacherId - Teacher's user ID
   * @param {string} activityId - Activity ID
   */
  async hasAccessToActivity(teacherId, activityId) {
    const activity = await prisma.hoatDong.findUnique({
      where: { id: String(activityId) },
      select: { nguoi_tao_id: true }
    });

    if (!activity) return false;

    // Get all student user IDs in teacher's homeroom classes
    const classes = await findTeacherClassesRaw(teacherId);
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) return false;

    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      select: { nguoi_dung_id: true }
    });

    const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);

    // Check if activity creator is a student in teacher's classes
    return studentUserIds.includes(activity.nguoi_tao_id);
  },

  /**
   * Get all registrations from students in teacher's classes
   */
  async getClassRegistrations(classIds, filters = {}) {
    try {
      const { status, semester } = filters;
      
      console.log('[getClassRegistrations] classIds:', classIds);
      console.log('[getClassRegistrations] filters:', filters);
      
      // Build where clause - filter by students in teacher's classes
      const where = {
        sinh_vien: {
          lop_id: { in: classIds }
        }
      };
      
      // Only filter by status if it's not 'all'
      if (status && status !== 'all') {
        where.trang_thai_dk = status;
      }
      
      // Build activity filter for semester using simple matcher
      const activityFilter = {};
      if (semester) {
        const parsed = parseSemesterString(semester);
        if (parsed && parsed.year) {
          activityFilter.hoc_ky = parsed.semester;
          activityFilter.nam_hoc = parsed.year;
        }
      }
      
      // Add activity filter to where clause if present
      if (Object.keys(activityFilter).length > 0) {
        where.hoat_dong = { is: activityFilter };
      }
      
      console.log('[getClassRegistrations] where clause:', JSON.stringify(where, null, 2));
      
      // Get registrations with full relations
      const registrations = await prisma.dangKyHoatDong.findMany({
        where,
        include: {
          sinh_vien: {
            include: {
              nguoi_dung: { 
                select: { 
                  ho_ten: true, 
                  email: true, 
                  anh_dai_dien: true 
                } 
              },
              lop: { 
                select: { 
                  ten_lop: true 
                } 
              }
            }
          },
          hoat_dong: { 
            select: { 
              id: true,
              ten_hd: true, 
              ngay_bd: true, 
              diem_rl: true, 
              dia_diem: true, 
              hinh_anh: true,
              loai_hd: { select: { id: true, ten_loai_hd: true } }
            } 
          }
        },
        orderBy: { ngay_dang_ky: 'desc' },
        take: 500
      });
      
      console.log('[getClassRegistrations] Found registrations:', registrations.length);
      
      return registrations;
    } catch (error) {
      console.error('[getClassRegistrations] Error:', error);
      throw error;
    }
  }
};

module.exports = teachersRepo;





