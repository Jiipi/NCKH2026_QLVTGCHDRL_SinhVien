/**
 * Teacher Statistics Service
 * Handles statistics and report calculations for teachers
 * Follows Single Responsibility Principle (SRP)
 */

const teachersRepo = require('../teachers.repo');
const { ForbiddenError } = require('../../../core/errors/AppError');

const getUserId = (user) => user?.sub || user?.id;

class TeacherStatisticsService {
  /**
   * Get class statistics
   */
  async getClassStatistics(className, semesterId, user) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem thống kê');
    }

    // Check access
    const userId = getUserId(user);
    const hasAccess = await teachersRepo.hasAccessToClass(userId, className);
    if (!hasAccess) {
      throw new ForbiddenError('Bạn không có quyền xem lớp này');
    }

    return await teachersRepo.getClassStats(className, semesterId);
  }

  /**
   * Get statistics for reports
   */
  async getReportStatistics(user, filters = {}) {
    if (user.role !== 'GIANG_VIEN') {
      throw new ForbiddenError('Chỉ giảng viên mới được xem báo cáo');
    }

    const userId = getUserId(user);
    const classNames = await teachersRepo.getTeacherClassNames(userId);

    // Get aggregated stats for all teacher's classes
    const stats = await Promise.all(
      classNames.map(className => 
        teachersRepo.getClassStats(className, filters.semesterId)
      )
    );

    // Get ALL registrations for activity counting
    const allRegistrations = await teachersRepo.getTeacherClassRegistrationsForChartsAll(
      userId, 
      filters.semesterId
    );

    // Get PARTICIPATED registrations for points/participation calculations
    const participatedRegistrations = await teachersRepo.getTeacherClassRegistrationsForReports(
      userId, 
      filters.semesterId
    );

    // Count total approved activities (strict semester filter)
    const totalActivities = await teachersRepo.countActivitiesForTeacherClassesStrict(
      userId,
      filters.semesterId
    );

    const totalStudents = stats.reduce((sum, s) => sum + s.totalStudents, 0);
    const approvedActivities = stats.reduce((sum, s) => sum + s.approvedActivities, 0);
    const approvedRegistrations = stats.reduce((sum, s) => sum + s.approvedRegistrations, 0);

    // Calculate average points from PARTICIPATED registrations only
    const studentPointsMap = new Map();
    participatedRegistrations.forEach(r => {
      const svId = r.sv_id;
      const points = Number(r.hoat_dong?.diem_rl || 0);
      studentPointsMap.set(svId, (studentPointsMap.get(svId) || 0) + points);
    });
    
    const totalPoints = Array.from(studentPointsMap.values()).reduce((sum, pts) => sum + pts, 0);
    const avgPoints = totalStudents > 0 ? totalPoints / totalStudents : 0;
    
    // Participation rate: students with PARTICIPATED registrations / total students
    const uniqueParticipants = new Set(participatedRegistrations.map(r => r.sv_id)).size;
    const participationRate = totalStudents > 0 ? (uniqueParticipants / totalStudents) * 100 : 0;

    // Calculate chart data using helper methods - pass both types of registrations
    const monthlyActivities = this._calculateMonthlyActivities(allRegistrations, participatedRegistrations);
    const activityTypes = this._calculateActivityTypes(allRegistrations);
    const topStudents = this._calculateTopStudents(participatedRegistrations);
    const pointsDistribution = this._calculatePointsDistribution(participatedRegistrations, totalStudents);
    const attendanceRate = this._calculateAttendanceRate(participatedRegistrations, totalStudents);

    return {
      classNames,
      stats,
      summary: {
        totalStudents,
        totalActivities,
        approvedActivities,
        totalRegistrations: stats.reduce((sum, s) => sum + s.totalRegistrations, 0),
        approvedRegistrations
      },
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
  }

  // Helper methods for chart calculations
  _calculateMonthlyActivities(regs, participatedRegs = []) {
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

  _calculateActivityTypes(regs) {
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

  _calculateTopStudents(regs) {
    const studentPoints = new Map();
    regs.forEach(r => {
      const id = r.sv_id;
      const cur = studentPoints.get(id) || { 
        id, 
        name: r.sinh_vien?.nguoi_dung?.ho_ten || '', 
        mssv: r.sinh_vien?.mssv || '', 
        points: 0, 
        activities: 0 
      };
      cur.points += Number(r.hoat_dong?.diem_rl || 0);
      cur.activities += 1;
      studentPoints.set(id, cur);
    });
    
    return Array.from(studentPoints.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((s, idx) => ({ rank: idx + 1, ...s }));
  }

  _calculatePointsDistribution(regs, totalStudents) {
    const studentPoints = new Map();
    regs.forEach(r => {
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

    // Count participants from participated registrations
    const participantsCount = new Set(regs.map(r => r.sv_id)).size;
    const nonParticipants = Math.max(0, totalStudents - participantsCount);
    binCounts[0] += nonParticipants;

    return bins.map((b, i) => ({
      range: b.range,
      count: binCounts[i],
      name: b.range,
      value: binCounts[i],
      percentage: totalStudents > 0 ? Math.round((binCounts[i] / totalStudents) * 100) : 0
    }));
  }

  _calculateAttendanceRate(regs, totalStudents) {
    // Group by month and calculate attendance rate
    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthlyParticipants = new Map();
    
    regs.forEach(r => {
      const d = r.ngay_dang_ky ? new Date(r.ngay_dang_ky) : new Date();
      const key = monthKey(d);
      if (!monthlyParticipants.has(key)) monthlyParticipants.set(key, new Set());
      monthlyParticipants.get(key).add(r.sv_id);
    });
    
    return Array.from(monthlyParticipants.keys()).sort().map(key => {
      const [year, mm] = key.split('-');
      const monthNumber = parseInt(mm, 10);
      const label = `T${monthNumber}/${year}`;
      const rate = totalStudents > 0 
        ? Math.round((monthlyParticipants.get(key).size / totalStudents) * 100) 
        : 0;
      return { month: label, rate };
    });
  }
}

module.exports = TeacherStatisticsService;

