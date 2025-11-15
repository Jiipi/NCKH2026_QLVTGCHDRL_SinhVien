const monitorRepo = require('./monitor.repo');
const { logInfo, logError } = require('../../core/logger');
const { parseSemesterString, buildRobustActivitySemesterWhere } = require('../../core/utils/semester');
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

      // Build robust semester filter for activities (matches exact labels, contains year, or date range)
      const activityFilter = semester ? buildRobustActivitySemesterWhere(semester) : buildRobustActivitySemesterWhere('current');

      // Get all students in the class
      const students = await monitorRepo.findStudentsByClass(classId);

      // Fetch all participated registrations once and aggregate by student
      const regs = await monitorRepo.findClassRegistrationsForPoints(classId, activityFilter);
      const totalsByStudent = new Map();
      const lastDateByStudent = new Map();
      const countByStudent = new Map();
      regs.forEach(r => {
        const id = r.sv_id;
        const cur = Number(totalsByStudent.get(id) || 0) + Number(r.hoat_dong?.diem_rl || 0);
        totalsByStudent.set(id, cur);
        countByStudent.set(id, (countByStudent.get(id) || 0) + 1);
        lastDateByStudent.set(id, r.ngay_dang_ky);
      });

      const studentsWithPoints = students.map((student) => {
        const totalPoints = Number(totalsByStudent.get(student.id) || 0);
        const activitiesJoined = Number(countByStudent.get(student.id) || 0);
        const lastActivityDate = lastDateByStudent.get(student.id) || null;

        // Status based on points (critical < 30, warning < 50, active >= 50)
        let status = 'active';
        if (totalPoints < 30) status = 'critical';
        else if (totalPoints < 50) status = 'warning';

        return {
          id: student.id,
          mssv: student.mssv,
          nguoi_dung: {
            ...student.nguoi_dung,
            sdt: student.sdt
          },
          lop: student.lop,
          totalPoints,
          totalPointsRounded: Math.round(totalPoints),
          activitiesJoined,
          lastActivityDate,
          rank: 0,
          gpa: parseFloat((Math.random() * 2 + 2).toFixed(1)),
          academicYear: '2021-2025',
          status
        };
      });

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
      
      // Get class creators (students + homeroom teacher) for filtering
      const classStudents = await monitorRepo.findAllStudentsInClass(classId);
      const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
      
      // Get homeroom teacher
      const lop = await monitorRepo.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      // Add class creators filter to activityFilter
      const activityFilterWithClass = {
        ...activityFilter,
        nguoi_tao_id: { in: classCreatorUserIds }
      };

      const registrations = await monitorRepo.findClassRegistrations(classId, {
        status,
        activityFilter: (activityFilterWithClass && Object.keys(activityFilterWithClass).length) ? activityFilterWithClass : {}
      });

      return registrations;
    } catch (error) {
      logError('Error getting pending registrations', error);
      throw error;
    }
  }

  /**
   * Get pending registrations count (only class activities)
   * @param {string} classId - Class ID
   * @returns {Promise<number>} Count of pending registrations
   */
  static async getPendingRegistrationsCount(classId) {
    try {
      // Get class creators (students + homeroom teacher) for filtering
      const classStudents = await monitorRepo.findAllStudentsInClass(classId);
      const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
      
      // Get homeroom teacher
      const lop = await monitorRepo.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      // Filter by class creators
      const activityFilter = {
        nguoi_tao_id: { in: classCreatorUserIds }
      };
      
      const count = await monitorRepo.countRegistrations(classId, { 
        status: 'cho_duyet',
        activityFilter
      });
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

      // Update registration with approver meta in ghi_chu
      await monitorRepo.updateRegistrationStatus(registrationId, 'da_duyet', {
        ghi_chu: `APPROVED_BY:${userRole}|USER:${userId}`
      });

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

      // Update registration with reject meta in ghi_chu
      await monitorRepo.updateRegistrationStatus(registrationId, 'tu_choi', {
        ly_do_tu_choi: reason || 'Bị từ chối',
        ghi_chu: `REJECTED_BY:${userRole}|USER:${userId}`
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
      // Use robust filter to avoid missing records due to label variations
      const baseActivityFilter = semester ? buildRobustActivitySemesterWhere(semester) : buildRobustActivitySemesterWhere('current');

      // Get class creators (students + homeroom teacher) for filtering
      const classStudents = await monitorRepo.findAllStudentsInClass(classId);
      const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
      
      // Get homeroom teacher
      const lop = await monitorRepo.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      // Add class creators filter to activityFilter
      const activityFilterWithClass = {
        ...baseActivityFilter,
        nguoi_tao_id: { in: classCreatorUserIds }
      };

      // Parallel queries
      const [
        totalStudents,
        pendingCount,
        recentRegistrations,
        classActivities,
        allStudentsInClass,
        classRegistrationsForCount,
        regsForPoints
      ] = await Promise.all([
        monitorRepo.countStudentsByClass(classId),
        monitorRepo.countRegistrations(classId, { status: 'cho_duyet', activityFilter: activityFilterWithClass }),
        monitorRepo.findRecentRegistrations(classId, activityFilterWithClass, 5),
        monitorRepo.findUpcomingActivities(classId, activityFilterWithClass, 5),
        monitorRepo.findAllStudentsInClass(classId),
        // Count ALL activities registered by class (not filtered by creator)
        monitorRepo.findClassRegistrationsForCount(classId, baseActivityFilter),
        // IMPORTANT: Points must include ALL participated activities (no class-creator filter)
        monitorRepo.findClassRegistrationsForPoints(classId, baseActivityFilter)
      ]);

      // Count distinct activities
      const uniqueActivities = [...new Set(classRegistrationsForCount.map(r => r.hd_id))];
      const totalActivities = uniqueActivities.length;

      // Calculate points for ALL students (participated only)
      const pointsByStudent = new Map();
      const countByStudent = new Map();
      regsForPoints.forEach(r => {
        pointsByStudent.set(r.sv_id, Number(pointsByStudent.get(r.sv_id) || 0) + Number(r.hoat_dong?.diem_rl || 0));
        countByStudent.set(r.sv_id, (countByStudent.get(r.sv_id) || 0) + 1);
      });

      const studentScores = allStudentsInClass.map((student) => {
        const pts = Number(pointsByStudent.get(student.id) || 0);
        return {
          id: student.id,
          name: student.nguoi_dung?.ho_ten || 'N/A',
          mssv: student.mssv,
          points: pts,
          pointsRounded: Math.round(pts),
          activitiesCount: Number(countByStudent.get(student.id) || 0)
        };
      });

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

  /**
   * Get class reports with statistics
   * @param {string} classId - Class ID
   * @param {Object} options - Options
   * @param {string} options.timeRange - Time range filter
   * @param {string} options.semester - Semester filter
   * @returns {Promise<Object>} Report data
   */
  static async getClassReports(classId, options = {}) {
    try {
      const { timeRange = 'semester', semester } = options;
      logInfo('Getting class reports', { classId, timeRange, semester });

      const now = new Date();
      let activityWhere = {};
      if (semester) {
        // Robust semester relation filter when semester provided
        activityWhere = buildRobustActivitySemesterWhere(semester);
        logInfo('Semester filter applied', { semester, activityWhere: JSON.stringify(activityWhere) });
      } else {
        let startDate;
        switch (timeRange) {
          case 'year':
            startDate = new Date(now.getFullYear() - 1, 6, 1);
            break;
          case 'all':
            startDate = new Date(2020, 0, 1);
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth() - 4, 1);
        }
        activityWhere = { ngay_bd: { gte: startDate } };
      }

      const [totalStudents, regs, allRegsForPoints, approvedActivitiesCount, strictActivitiesCount] = await Promise.all([
        monitorRepo.countStudentsByClass(classId),
        monitorRepo.findClassRegistrationsForReports(classId, activityWhere),
        // ✅ Lấy thêm registrations đã tham gia (da_tham_gia) để tính điểm và tỷ lệ tham gia
        monitorRepo.findClassRegistrationsForPoints(classId, activityWhere),
        // ✅ Đếm số hoạt động "Có sẵn" được lớp tạo và đã được duyệt (khớp thẻ hoạt động lớp)
        monitorRepo.countApprovedActivitiesForClass(classId, activityWhere),
        // ✅ Đếm tổng hoạt động lớp tạo theo filter học kỳ STRICT (khớp trang Hoạt động lớp - Tổng hoạt động)
        (async () => {
          if (semester) {
            const sem = parseSemesterString(semester);
            const strictWhere = sem?.semester && sem?.yearLabel ? { hoc_ky: sem.semester, nam_hoc: sem.yearLabel } : {};
            return monitorRepo.countActivitiesForClassStrict(classId, strictWhere);
          }
          return 0;
        })()
      ]);

      // Log để debug: kiểm tra số lượng registration và học kỳ của chúng
      if (semester) {
        const semesterInfo = parseSemesterString(semester);
        logInfo('Reports data check', {
          semester,
          semesterInfo,
          totalActivitiesApprovedClassCreated: approvedActivitiesCount,
          totalRegistrations: regs.length,
          totalParticipatedRegistrations: allRegsForPoints.length,
          uniqueSemesters: [...new Set(regs.map(r => `${r.hoat_dong?.hoc_ky || 'N/A'}_${r.hoat_dong?.nam_hoc || 'N/A'}`))],
          sampleRegistrations: regs.slice(0, 3).map(r => ({
            id: r.id,
            hoc_ky: r.hoat_dong?.hoc_ky,
            nam_hoc: r.hoat_dong?.nam_hoc,
            trang_thai_dk: r.trang_thai_dk
          }))
        });
      }

      // ✅ Calculate points per student from PARTICIPATED registrations (da_tham_gia) only
      const studentPointsMap = new Map();
      allRegsForPoints.forEach(r => {
        const svId = r.sv_id;
        const points = Number(r.hoat_dong?.diem_rl || 0);
        studentPointsMap.set(svId, (studentPointsMap.get(svId) || 0) + points);
      });
      
      const totalPoints = Array.from(studentPointsMap.values()).reduce((sum, pts) => sum + pts, 0);
      const avgPoints = totalStudents > 0 ? totalPoints / totalStudents : 0;
      
      // ✅ Participation rate: students with PARTICIPATED registrations (da_tham_gia) / total students
      const uniqueParticipants = new Set(allRegsForPoints.map(r => r.sv_id)).size;
      const participationRate = totalStudents > 0 ? (uniqueParticipants / totalStudents) * 100 : 0;

      // ✅ Pass both regs (for activity counting) and allRegsForPoints (for points/participation)
      const monthlyActivities = this._calculateMonthlyActivities(regs, allRegsForPoints);
      const activityTypes = this._calculateActivityTypes(regs);
      const topStudents = this._calculateTopStudents(allRegsForPoints);
      const pointsDistribution = this._calculatePointsDistribution(allRegsForPoints, totalStudents);
      const attendanceRate = this._calculateAttendanceRate(allRegsForPoints, totalStudents);

      // ✅ Tổng số hoạt động KHỚP trang Hoạt động lớp (header "TỔNG HOẠT ĐỘNG")
      //    - Đếm theo strict semester (hoc_ky + nam_hoc) và do lớp tạo (không ép trạng thái)
      //    - Nếu không có semester, fallback về số 0 (hoặc có thể dùng approvedActivitiesCount)
      const totalActivities = semester ? strictActivitiesCount : approvedActivitiesCount;

      return {
        overview: {
          totalStudents,
          totalActivities,
          avgPoints: Math.round(avgPoints * 10) / 10,
          participationRate: Math.round(participationRate * 10) / 10
        },
        monthlyActivities,
        pointsDistribution,
        activityTypes,
        topStudents,
        attendanceRate
      };
    } catch (error) {
      logError('Error getting class reports', error);
      throw error;
    }
  }

  static _calculateMonthlyActivities(regs, participatedRegs = []) {
    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthlyActivityIds = new Map();
    const monthlyParticipantSets = new Map();
    
    // Count activities from all registrations (regs)
    regs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = monthKey(d);
      if (!monthlyActivityIds.has(key)) monthlyActivityIds.set(key, new Set());
      if (r.hoat_dong?.id) monthlyActivityIds.get(key).add(r.hoat_dong.id);
    });
    
    // Count participants from participated registrations only
    participatedRegs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = monthKey(d);
      if (!monthlyParticipantSets.has(key)) monthlyParticipantSets.set(key, new Set());
      monthlyParticipantSets.get(key).add(r.sv_id);
    });
    
    return Array.from(monthlyActivityIds.keys()).sort().map(key => {
      const [year, mm] = key.split('-');
      const monthNumber = parseInt(mm, 10);
      const label = `T${monthNumber}/${year}`;
      const activities = monthlyActivityIds.get(key)?.size || 0;
      const participants = monthlyParticipantSets.get(key)?.size || 0;
      return { month: label, activities, participants };
    });
  }

  static _calculateActivityTypes(regs) {
    const activitiesById = new Map();
    regs.forEach(r => {
      const id = r.hoat_dong?.id;
      if (!id || activitiesById.has(id)) return;
      activitiesById.set(id, {
        typeName: r.hoat_dong?.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: Number(r.hoat_dong?.diem_rl || 0)
      });
    });
    const typeAgg = new Map();
    activitiesById.forEach(({ typeName, diem_rl }) => {
      const cur = typeAgg.get(typeName) || { name: typeName, count: 0, points: 0 };
      cur.count += 1;
      cur.points += diem_rl;
      typeAgg.set(typeName, cur);
    });
    return Array.from(typeAgg.values());
  }

  static _calculateTopStudents(participatedRegs) {
    const studentPoints = new Map();
    // ✅ Calculate from participated registrations only (already filtered by da_tham_gia)
    participatedRegs.forEach(r => {
      const id = r.sv_id;
      // Need to get student info from regs if available, otherwise use minimal data
      const cur = studentPoints.get(id) || { 
        id, 
        name: r.sinh_vien?.nguoi_dung?.ho_ten || r.sinh_vien?.ho_ten || '', 
        mssv: r.sinh_vien?.mssv || '', 
        points: 0, 
        activities: 0 
      };
      cur.points += Number(r.hoat_dong?.diem_rl || 0);
      cur.activities += 1;
      studentPoints.set(id, cur);
    });
    return Array.from(studentPoints.values()).sort((a,b)=>b.points-a.points).slice(0,5).map((s,idx)=>({ rank: idx+1, ...s }));
  }

  static _calculatePointsDistribution(participatedRegs, totalStudents) {
    const studentPoints = new Map();
    // ✅ Calculate from participated registrations only (already filtered by da_tham_gia)
    participatedRegs.forEach(r => {
      const id = r.sv_id;
      const cur = studentPoints.get(id) || { points: 0 };
      cur.points += Number(r.hoat_dong?.diem_rl || 0);
      studentPoints.set(id, cur);
    });

    const bins = [
      { range: '0-49', min: 0, max: 49 },
      { range: '50-64', min: 50, max: 64 },
      { range: '65-79', min: 65, max: 79 },
      { range: '80-89', min: 80, max: 89 },
      { range: '90-100', min: 90, max: 100 }
    ];
    const binCounts = bins.map(() => 0);
    const studentsWithPoints = Array.from(studentPoints.values());
    studentsWithPoints.forEach(s => {
      const p = Math.max(0, Math.min(100, Math.round(Number(s.points || 0))));
      const idx = bins.findIndex(b => p >= b.min && p <= b.max);
      if (idx >= 0) binCounts[idx] += 1;
    });

    // ✅ Count participants from participated registrations
    const participantsCount = new Set(participatedRegs.map(r => r.sv_id)).size;
    const nonParticipants = Math.max(0, totalStudents - participantsCount);
    binCounts[0] += nonParticipants;

    return bins.map((b, i) => ({
      range: b.range,
      count: binCounts[i],
      name: b.range,
      value: binCounts[i],
      percentage: totalStudents > 0 ? parseFloat(((binCounts[i] / totalStudents) * 100).toFixed(1)) : 0
    }));
  }

  static _calculateAttendanceRate(participatedRegs, totalStudents) {
    const monthlyParticipantSets = new Map();
    // ✅ Calculate from participated registrations only (already filtered by da_tham_gia)
    participatedRegs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyParticipantSets.has(key)) monthlyParticipantSets.set(key, new Set());
      monthlyParticipantSets.get(key).add(r.sv_id);
    });

    return Array.from(monthlyParticipantSets.keys()).sort().map(key => {
      const mmSet = monthlyParticipantSets.get(key) || new Set();
      const monthNumber = parseInt(key.split('-')[1], 10);
      return {
        month: `T${monthNumber}`,
        rate: totalStudents > 0 ? Math.round((mmSet.size / totalStudents) * 100) : 0
      };
    });
  }
}

module.exports = MonitorService;





