const { parseSemesterString } = require('../../../../core/utils/semester');
const { logInfo, logError } = require('../../../../core/logger');
const { countClassActivities } = require('../../../../core/utils/classActivityCounter');

/**
 * GetMonitorDashboardUseCase
 * Use case for getting monitor dashboard summary
 * Follows Single Responsibility Principle (SRP)
 */
class GetMonitorDashboardUseCase {
  constructor(monitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(classId, className, semester = null) {
    try {
      logInfo('Getting monitor dashboard', { classId, className, semester });

      const semInfo = parseSemesterString(semester || 'current');
      
      let baseActivityFilter = {};
      if (semInfo && semInfo.year) {
        baseActivityFilter = {
          hoc_ky: semInfo.semester,
          nam_hoc: semInfo.year
        };
      }

      const classStudents = await this.monitorRepository.findAllStudentsInClass(classId);
      const classCreatorUserIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
      
      const lop = await this.monitorRepository.findClassById(classId);
      if (lop?.chu_nhiem) {
        classCreatorUserIds.push(lop.chu_nhiem);
      }
      
      const activityFilterWithClass = {
        ...baseActivityFilter,
        nguoi_tao_id: { in: classCreatorUserIds }
      };

      const [
        totalStudents,
        pendingCount,
        recentRegistrations,
        classActivities,
        allStudentsInClass,
        classRegistrationsForCount,
        regsForPoints
      ] = await Promise.all([
        this.monitorRepository.countStudentsByClass(classId),
        this.monitorRepository.countRegistrations(classId, { status: 'cho_duyet', activityFilter: activityFilterWithClass }),
        this.monitorRepository.findRecentRegistrations(classId, activityFilterWithClass, 5),
        this.monitorRepository.findUpcomingActivities(classId, activityFilterWithClass, 5),
        this.monitorRepository.findAllStudentsInClass(classId),
        this.monitorRepository.findClassRegistrationsForCountApproved(classId, baseActivityFilter),
        this.monitorRepository.findClassRegistrationsForPoints(classId, baseActivityFilter)
      ]);

      // Đếm tổng hoạt động của lớp theo chuẩn:
      // Tất cả hoạt động da_duyet/ket_thuc do SV/GVCN của lớp tạo
      const semesterFilter = semInfo && semInfo.year 
        ? { hoc_ky: semInfo.semester, nam_hoc: semInfo.year }
        : {};
      const totalActivities = await countClassActivities(classId, semesterFilter);

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

      const topStudents = studentScores.sort((a, b) => b.points - a.points);

      const totalClassPoints = studentScores.reduce((sum, s) => sum + Number(s.points || 0), 0);
      const avgClassScore = totalStudents > 0 ? Math.round((totalClassPoints / totalStudents) * 10) / 10 : 0;
      const studentsWithActivities = studentScores.filter(s => s.activitiesCount > 0).length;

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
        topStudents
      };
    } catch (error) {
      logError('Error getting monitor dashboard', error);
      throw error;
    }
  }
}

module.exports = GetMonitorDashboardUseCase;

