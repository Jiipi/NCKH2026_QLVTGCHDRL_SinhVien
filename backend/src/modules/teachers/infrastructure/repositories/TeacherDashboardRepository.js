/**
 * Teacher Dashboard Repository
 * Handles dashboard statistics and notifications
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../../infrastructure/prisma/client');
const { parseSemesterString } = require('../../../../core/utils/semester');
const { findTeacherClassesRaw } = require('./helpers/teacherClassHelper');

class TeacherDashboardRepository {
  /**
   * Get teacher dashboard stats with semester support
   * @param {string} teacherId - Teacher's user ID
   * @param {string} semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   * @param {string} classId - Optional class ID filter
   * @returns {Promise<Object>} Dashboard statistics
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
  }

  /**
   * Get class statistics by class name
   * @param {string} className - Class name (ten_lop)
   * @param {string} semesterId - Optional semester filter
   * @returns {Promise<Object>} Class statistics
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

    // Build activity filter
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
      const semStr = String(semesterId).trim();
      let hocKy = null;
      let yearRaw = null;

      const m = semStr.match(/^(hoc_ky_1|hoc_ky_2|1|2)[-_](\d{4})$/);
      if (m) {
        const hkToken = m[1];
        yearRaw = m[2];
        hocKy = (hkToken === '2' || hkToken === 'hoc_ky_2') ? 'hoc_ky_2' : 'hoc_ky_1';
      } else {
        const y = semStr.match(/(\d{4})/);
        if (y) yearRaw = y[1];
        if (/hoc_ky_2|\b2\b/.test(semStr)) hocKy = 'hoc_ky_2';
        else if (/hoc_ky_1|\b1\b/.test(semStr)) hocKy = 'hoc_ky_1';
      }

      if (hocKy && yearRaw) {
        activityWhere.hoc_ky = hocKy;
        activityWhere.nam_hoc = yearRaw;
        approvedActivityWhere.hoc_ky = hocKy;
        approvedActivityWhere.nam_hoc = yearRaw;
      }
    }

    const [totalStudents, totalActivities, approvedActivities] = await Promise.all([
      prisma.sinhVien.count({ where: { lop_id: lop.id } }),
      prisma.hoatDong.count({ where: activityWhere }),
      prisma.hoatDong.count({ where: approvedActivityWhere })
    ]);

    // Registrations by students in class
    const registrationWhere = {
      sinh_vien: { lop_id: lop.id }
    };
    if (semesterId && activityWhere.hoc_ky && activityWhere.nam_hoc) {
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
  }

  /**
   * Get recent notifications sent by teacher
   * @param {string} teacherId - Teacher's user ID
   * @param {number} limit - Max number of notifications to return
   * @returns {Promise<Array>} Array of notifications
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
  }
}

module.exports = TeacherDashboardRepository;

