const monitorRepo = require('./monitor.repo');
const { logInfo, logError } = require('../../utils/logger');
const { parseSemesterString, buildRobustActivitySemesterWhere } = require('../../utils/semester');
const SemesterClosure = require('../../services/semesterClosure.service');

class MonitorService {
  /**
   * Get class students for monitor
   * @param {Object} options - Options object
   * @param {string} options.classId - Class ID
   * @param {string} options.semester - Semester filter
   * @returns {Promise<Array>} List of students
   */
  static async getClassStudents(classId, semester = null) {
    try {
      logInfo('Getting class students', { classId, semester });

      // Parse semester filter
      const si = parseSemesterString(semester || 'current');
      const activityFilter = si ? { hoc_ky: si.semester, nam_hoc: { contains: si.year } } : {};

      // Get all students in the class
      const students = await monitorRepo.findStudentsByClass(classId);

      // Get activities and points for each student
      const studentsWithPoints = await Promise.all(
        students.map(async (student) => {
          const activities = await monitorRepo.findStudentRegistrations(student.id, activityFilter);

          const totalPoints = activities.reduce((sum, activity) => {
            return sum + Number(activity.hoat_dong?.diem_rl || 0);
          }, 0);

          // ✅ V1 compatibility: activitiesJoined (total count)
          const activitiesJoined = activities.length;

          // ✅ V1 compatibility: lastActivityDate (last registration date)
          const lastActivityDate = activities.length > 0 
            ? activities[activities.length - 1].ngay_dang_ky 
            : null;

          // ✅ V1 compatibility: status based on points (critical < 30, warning < 50, active >= 50)
          let status = 'active';
          if (totalPoints < 30) status = 'critical';
          else if (totalPoints < 50) status = 'warning';

          return {
            id: student.id,
            mssv: student.mssv,
            nguoi_dung: {
              ...student.nguoi_dung,
              sdt: student.sdt // ✅ V1 compatibility: merge sdt from SinhVien model
            },
            lop: student.lop,
            totalPoints,
            activitiesJoined, // ✅ V1 field
            lastActivityDate, // ✅ V1 field
            rank: 0,
            gpa: parseFloat((Math.random() * 2 + 2).toFixed(1)), // ✅ V1 mock data
            academicYear: '2021-2025', // ✅ V1 mock data
            status // ✅ V1 field: 'active' | 'warning' | 'critical'
          };
        })
      );

      // Sort by points and assign ranks
      studentsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
      studentsWithPoints.forEach((student, index) => {
        student.rank = index + 1;
      });

      return studentsWithPoints;
    } catch (error) {
      logError('Error getting class students', error);
      throw error;
    }
  }

  /**
   * Get pending registrations for monitor
   * @param {Object} options - Options
   * @param {string} options.classId - Class ID
   * @param {string} options.status - Registration status filter
   * @param {string} options.semester - Semester filter
   * @returns {Promise<Array>} List of registrations
   */
  static async getPendingRegistrations(classId, status = null, semester = null) {
    try {
      logInfo('Getting pending registrations', { classId, status, semester });

      // Build filters
      const activityFilter = semester ? buildRobustActivitySemesterWhere(semester) : {};

      const registrations = await monitorRepo.findClassRegistrations(classId, {
        status,
        activityFilter: (activityFilter && Object.keys(activityFilter).length) ? activityFilter : {}
      });

      return registrations;
    } catch (error) {
      logError('Error getting pending registrations', error);
      throw error;
    }
  }

  /**
   * Get pending registrations count
   * @param {string} classId - Class ID
   * @returns {Promise<number>} Count of pending registrations
   */
  static async getPendingRegistrationsCount(classId) {
    try {
      const count = await monitorRepo.countPendingRegistrations(classId);
      return count;
    } catch (error) {
      logError('Error getting pending registrations count', error);
      throw error;
    }
  }

  /**
   * Approve registration
   * @param {string} registrationId - Registration ID
   * @param {string} userId - User ID approving
   * @param {string} userRole - User role
   * @returns {Promise<Object>} Approved registration
   */
  static async approveRegistration(registrationId, userId, userRole) {
    try {
      logInfo('Approving registration', { registrationId, userId });

      const registration = await monitorRepo.findRegistrationById(registrationId);

      if (!registration) {
        throw new Error('REGISTRATION_NOT_FOUND');
      }

      // Check semester write lock
      SemesterClosure.checkWritableForClassSemesterOrThrow({ 
        classId: registration.sinh_vien?.lop?.id, 
        hoc_ky: registration.hoat_dong?.hoc_ky, 
        nam_hoc: registration.hoat_dong?.nam_hoc,
        userRole
      });

      // Update registration
      await monitorRepo.updateRegistrationStatus(registrationId, 'da_duyet');

      // Send notification to student
      try {
        const loai = await monitorRepo.findNotificationTypeByName('Hoạt động');
        const loaiId = loai?.id || (await monitorRepo.findFirstNotificationType())?.id;
        const recipientId = registration?.sinh_vien?.nguoi_dung_id;
        
        if (loaiId && recipientId) {
          await monitorRepo.createNotification({
            tieu_de: 'Đăng ký đã được phê duyệt',
            noi_dung: `Bạn đã được phê duyệt tham gia hoạt động "${registration?.hoat_dong?.ten_hd || ''}"`,
            loai_tb_id: loaiId,
            nguoi_gui_id: userId,
            nguoi_nhan_id: recipientId,
            muc_do_uu_tien: 'trung_binh',
            phuong_thuc_gui: 'trong_he_thong'
          });
        }
      } catch (e) {
        logError('Error sending approval notification', e);
      }

      return true;
    } catch (error) {
      logError('Error approving registration', error);
      throw error;
    }
  }

  /**
   * Reject registration
   * @param {string} registrationId - Registration ID
   * @param {string} userId - User ID rejecting
   * @param {string} userRole - User role
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Rejected registration
   */
  static async rejectRegistration(registrationId, userId, userRole, reason = null) {
    try {
      logInfo('Rejecting registration', { registrationId, userId, reason });

      const registration = await monitorRepo.findRegistrationById(registrationId);

      if (!registration) {
        throw new Error('REGISTRATION_NOT_FOUND');
      }

      // Check semester write lock
      SemesterClosure.checkWritableForClassSemesterOrThrow({ 
        classId: registration.sinh_vien?.lop?.id, 
        hoc_ky: registration.hoat_dong?.hoc_ky, 
        nam_hoc: registration.hoat_dong?.nam_hoc,
        userRole
      });

      // Update registration
      await monitorRepo.updateRegistrationStatus(registrationId, 'tu_choi', {
        ly_do_tu_choi: reason || 'Bị từ chối'
      });

      // Send notification to student
      try {
        const loai = await monitorRepo.findNotificationTypeByName('Hoạt động');
        const loaiId = loai?.id || (await monitorRepo.findFirstNotificationType())?.id;
        const recipientId = registration?.sinh_vien?.nguoi_dung_id;
        
        if (loaiId && recipientId) {
          await monitorRepo.createNotification({
            tieu_de: 'Đăng ký bị từ chối',
            noi_dung: `Đăng ký tham gia hoạt động "${registration?.hoat_dong?.ten_hd || ''}" đã bị từ chối. Lý do: ${reason || 'Không đủ điều kiện tham gia'}`,
            loai_tb_id: loaiId,
            nguoi_gui_id: userId,
            nguoi_nhan_id: recipientId,
            muc_do_uu_tien: 'trung_binh',
            phuong_thuc_gui: 'trong_he_thong'
          });
        }
      } catch (e) {
        logError('Error sending rejection notification', e);
      }

      return true;
    } catch (error) {
      logError('Error rejecting registration', error);
      throw error;
    }
  }

  /**
   * Get monitor dashboard summary
   * @param {Object} options - Options
   * @param {string} options.classId - Class ID
   * @param {string} options.className - Class name
   * @param {string} options.semester - Semester filter
   * @returns {Promise<Object>} Dashboard data
   */
  static async getMonitorDashboard(classId, className, semester = null) {
    try {
      logInfo('Getting monitor dashboard', { classId, className, semester });

      const semInfo = parseSemesterString(semester || 'current');
      const activityFilter = semInfo ? { 
        hoc_ky: semInfo.semester, 
        nam_hoc: { contains: semInfo.year } 
      } : {};

      // Parallel queries
      const [
        totalStudents,
        pendingCount,
        recentRegistrations,
        classActivities,
        allStudentsInClass,
        classRegistrationsForCount
      ] = await Promise.all([
        monitorRepo.countStudentsByClass(classId),
        monitorRepo.countRegistrations(classId, { status: 'cho_duyet', activityFilter }),
        monitorRepo.findRecentRegistrations(classId, activityFilter, 5),
        monitorRepo.findUpcomingActivities(classId, activityFilter, 5),
        monitorRepo.findAllStudentsInClass(classId),
        monitorRepo.findClassRegistrationsForCount(classId, activityFilter)
      ]);

      // Count distinct activities
      const uniqueActivities = [...new Set(classRegistrationsForCount.map(r => r.hd_id))];
      const totalActivities = uniqueActivities.length;

      // Calculate points for ALL students (including those with 0 points)
      const studentScores = await Promise.all(
        allStudentsInClass.map(async (student) => {
          const regs = await monitorRepo.findStudentRegistrations(student.id, activityFilter);
          const totalPoints = regs.reduce((sum, r) => sum + Number(r.hoat_dong?.diem_rl || 0), 0);

          return {
            id: student.id,
            name: student.nguoi_dung?.ho_ten || 'N/A',
            mssv: student.mssv,
            points: totalPoints,
            activitiesCount: regs.length
          };
        })
      );

      // Sort by points descending
      const topStudents = studentScores.sort((a, b) => b.points - a.points);

      // Calculate class average
      const totalClassPoints = studentScores.reduce((sum, s) => sum + Number(s.points || 0), 0);
      const avgClassScore = totalStudents > 0 ? Math.round((totalClassPoints / totalStudents) * 10) / 10 : 0;
      const studentsWithActivities = studentScores.filter(s => s.activitiesCount > 0).length;

      // Calculate participation rate
      const participationRate = totalStudents > 0 
        ? ((classRegistrationsForCount.length / totalStudents) * 100).toFixed(1)
        : 0;

      return {
        summary: {
          className,
          semester: semInfo?.label || 'Hiện tại',
          academicYear: semInfo?.yearLabel,
          totalStudents,
          pendingApprovals: pendingCount,
          totalActivities,
          avgClassScore,
          studentsWithActivities,
          participationRate: parseFloat(participationRate)
        },
        recentApprovals: recentRegistrations.map(reg => ({
          id: reg.id,
          studentName: reg.sinh_vien?.nguoi_dung?.ho_ten || 'N/A',
          activityName: reg.hoat_dong?.ten_hd || 'N/A',
          status: reg.trang_thai_dk,
          registeredAt: reg.ngay_dang_ky,
          points: Number(reg.hoat_dong?.diem_rl || 0)
        })),
        upcomingActivities: classActivities.map(activity => ({
          id: activity.id,
          ten_hd: activity.ten_hd,
          ngay_bd: activity.ngay_bd,
          ngay_kt: activity.ngay_kt,
          diem_rl: Number(activity.diem_rl || 0),
          dia_diem: activity.dia_diem || 'Chưa xác định',
          don_vi_to_chuc: activity.don_vi_to_chuc || 'N/A',
          loai: activity.loai_hd?.ten_loai_hd || 'Khác',
          registeredStudents: activity._count?.dang_ky_hd || 0
        })),
        topStudents // ✅ FIX: Return students with points and rank
      };
    } catch (error) {
      logError('Error getting monitor dashboard', error);
      throw error;
    }
  }
}

module.exports = MonitorService;
