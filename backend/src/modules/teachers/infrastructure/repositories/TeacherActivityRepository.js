/**
 * Teacher Activity Repository
 * Handles activity-related operations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

const { prisma } = require('../../../../infrastructure/prisma/client');
const { parseSemesterString } = require('../../../../core/utils/semester');
const { findTeacherClassesRaw } = require('./helpers/teacherClassHelper');

class TeacherActivityRepository {
  /**
   * Get pending activities from teacher's class students
   * @param {string} teacherId - Teacher's user ID
   * @param {string} semester - Optional semester string (e.g., 'hoc_ky_1-2025')
   * @param {number} limit - Max number of activities to return
   * @param {string} classId - Optional class ID filter
   * @returns {Promise<Array>} Array of pending activities
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
  }

  /**
   * Check if teacher has access to activity
   * Teacher can approve/reject activities created by students in their homeroom classes
   * @param {string} teacherId - Teacher's user ID
   * @param {string} activityId - Activity ID
   * @returns {Promise<boolean>} True if teacher has access
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
  }

  /**
   * Count total approved activities for teacher's classes (strict semester filter)
   * @param {string} teacherId - Teacher's user ID
   * @param {string} semesterId - Semester filter (e.g., '1-2025')
   * @returns {Promise<number>} Count of approved activities
   */
  async countActivitiesForTeacherClassesStrict(teacherId, semesterId = null) {
    const classes = await findTeacherClassesRaw(teacherId);
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) return 0;

    // Get all students in teacher's classes
    const students = await prisma.sinhVien.findMany({
      where: { lop_id: { in: classIds } },
      select: { nguoi_dung_id: true }
    });
    const classCreatorUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);

    // Add homeroom teachers (the teacher themselves for their classes)
    classCreatorUserIds.push(teacherId);

    if (classCreatorUserIds.length === 0) return 0;

    // Build semester filter
    let semesterWhere = {};
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
        semesterWhere = {
          hoc_ky: hocKy,
          nam_hoc: yearRaw
        };
      }
    }

    // Count activities created by class members in this semester
    const where = {
      AND: [
        semesterWhere,
        { nguoi_tao_id: { in: classCreatorUserIds } },
        { trang_thai: { in: ['da_duyet', 'ket_thuc'] } }
      ]
    };

    const count = await prisma.hoatDong.count({ where });

    console.log('[countActivitiesForTeacherClassesStrict]', {
      teacherId,
      classesCount: classes.length,
      classCreatorUserIdsCount: classCreatorUserIds.length,
      semesterId,
      semesterWhere,
      count
    });

    return count;
  }
}

module.exports = TeacherActivityRepository;

