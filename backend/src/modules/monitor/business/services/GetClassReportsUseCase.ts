import type { DangKyHoatDong, SinhVien, HoatDong, Lop, TrangThaiDangKy } from '@prisma/client';
import type IMonitorRepository from '../interfaces/IMonitorRepository';
import type { RegistrationWithRelations, ActivityFilter } from '../interfaces/IMonitorRepository';

import { parseSemesterString } from '../../../../core/utils/semester';
import { logInfo, logError } from '../../../../core/logger';

interface MonthlyActivity {
  month: string;
  activities: number;
  participants: number;
}

interface ActivityType {
  name: string;
  count: number;
  points: number;
}

interface TopStudent {
  rank: number;
  id: string;
  name: string;
  mssv: string;
  points: number;
  activities: number;
}

interface PointsDistribution {
  range: string;
  count: number;
  name: string;
  value: number;
  percentage: number;
}

interface AttendanceRate {
  month: string;
  rate: number;
}

interface ReportOptions {
  timeRange?: string;
  semester?: string;
}

interface ReportOverview {
  totalStudents: number;
  totalActivities: number;
  avgPoints: number;
  participationRate: number;
}

interface ClassReport {
  overview: ReportOverview;
  monthlyActivities: MonthlyActivity[];
  pointsDistribution: PointsDistribution[];
  activityTypes: ActivityType[];
  topStudents: TopStudent[];
  attendanceRate: AttendanceRate[];
}

/**
 * GetClassReportsUseCase
 * Use case for getting class reports with statistics
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassReportsUseCase {
  private monitorRepository: IMonitorRepository;

  constructor(monitorRepository: IMonitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  private _calculateMonthlyActivities(regs: RegistrationWithRelations[], participatedRegs: RegistrationWithRelations[] = []): MonthlyActivity[] {
    const monthKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthlyActivityIds = new Map<string, Set<string>>();
    const monthlyParticipantSets = new Map<string, Set<string>>();
    
    regs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = monthKey(d);
      if (!monthlyActivityIds.has(key)) monthlyActivityIds.set(key, new Set());
      if (r.hoat_dong?.id) monthlyActivityIds.get(key)!.add(r.hoat_dong.id);
    });
    
    participatedRegs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = monthKey(d);
      if (!monthlyParticipantSets.has(key)) monthlyParticipantSets.set(key, new Set());
      monthlyParticipantSets.get(key)!.add(r.sv_id);
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

  private _calculateActivityTypes(regs: RegistrationWithRelations[]): ActivityType[] {
    const activitiesById = new Map<string, { typeName: string; diem_rl: number }>();
    regs.forEach(r => {
      const id = r.hoat_dong?.id;
      if (!id || activitiesById.has(id)) return;
      activitiesById.set(id, {
        typeName: r.hoat_dong?.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: Number(r.hoat_dong?.diem_rl || 0)
      });
    });
    const typeAgg = new Map<string, ActivityType>();
    activitiesById.forEach(({ typeName, diem_rl }) => {
      const cur = typeAgg.get(typeName) || { name: typeName, count: 0, points: 0 };
      cur.count += 1;
      cur.points += diem_rl;
      typeAgg.set(typeName, cur);
    });
    return Array.from(typeAgg.values());
  }

  private _calculateTopStudents(participatedRegs: RegistrationWithRelations[]): TopStudent[] {
    const studentPoints = new Map<string, { id: string; name: string; mssv: string; points: number; activities: number }>();
    participatedRegs.forEach(r => {
      const id = r.sv_id;
      const cur = studentPoints.get(id) || { 
        id, 
        name: (r.sinh_vien?.nguoi_dung as { ho_ten?: string })?.ho_ten || '', 
        mssv: r.sinh_vien?.mssv || '', 
        points: 0, 
        activities: 0 
      };
      cur.points += Number(r.hoat_dong?.diem_rl || 0);
      cur.activities += 1;
      studentPoints.set(id, cur);
    });
    return Array.from(studentPoints.values()).sort((a, b) => b.points - a.points).slice(0, 5).map((s, idx) => ({ rank: idx + 1, ...s }));
  }

  private _calculatePointsDistribution(participatedRegs: RegistrationWithRelations[], totalStudents: number): PointsDistribution[] {
    const studentPoints = new Map<string, { points: number }>();
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

  private _calculateAttendanceRate(participatedRegs: RegistrationWithRelations[], totalStudents: number): AttendanceRate[] {
    const monthlyParticipantSets = new Map<string, Set<string>>();
    participatedRegs.forEach(r => {
      const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyParticipantSets.has(key)) monthlyParticipantSets.set(key, new Set());
      monthlyParticipantSets.get(key)!.add(r.sv_id);
    });

    return Array.from(monthlyParticipantSets.keys()).sort().map(key => {
      const mmSet = monthlyParticipantSets.get(key) || new Set<string>();
      const monthNumber = parseInt(key.split('-')[1], 10);
      return {
        month: `T${monthNumber}`,
        rate: totalStudents > 0 ? Math.round((mmSet.size / totalStudents) * 100) : 0
      };
    });
  }

  async execute(classId: string, options: ReportOptions = {}): Promise<ClassReport> {
    try {
      const { timeRange = 'semester', semester } = options;
      logInfo('Getting class reports', { classId, timeRange, semester });

      const now = new Date();
      let activityWhere: ActivityFilter = {};
      if (semester) {
        const parsed = parseSemesterString(semester);
        if (parsed && parsed.year) {
          activityWhere = {
            hoc_ky: parsed.semester,
            nam_hoc: parsed.year
          };
        }
        logInfo('Semester filter applied', { semester, activityWhere: JSON.stringify(activityWhere) });
      } else {
        let startDate: Date;
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

      const [totalStudents, regs, allRegsForPoints, strictActivitiesCount] = await Promise.all([
        this.monitorRepository.countStudentsByClass(classId),
        this.monitorRepository.findClassRegistrationsForReports(classId, activityWhere),
        this.monitorRepository.findClassRegistrationsForPoints(classId, activityWhere),
        (async (): Promise<number> => {
          if (semester) {
            const sem = parseSemesterString(semester);
            const strictWhere = sem?.semester && sem?.year ? { hoc_ky: sem.semester, nam_hoc: sem.year } : {};
            return this.monitorRepository.countActivitiesForClassStrict(classId, strictWhere);
          }
          return 0;
        })()
      ]);

      if (semester) {
        const semesterInfo = parseSemesterString(semester);
        logInfo('Reports data check', {
          semester,
          semesterInfo,
          totalActivitiesStrictCount: strictActivitiesCount,
          totalRegistrations: regs.length,
          totalParticipatedRegistrations: allRegsForPoints.length,
          uniqueSemesters: [...new Set(regs.map(r => `${r.hoat_dong?.hoc_ky || 'N/A'}_${r.hoat_dong?.nam_hoc || 'N/A'}`))]
        });
      }

      const studentPointsMap = new Map<string, number>();
      allRegsForPoints.forEach(r => {
        const svId = r.sv_id;
        const points = Number(r.hoat_dong?.diem_rl || 0);
        studentPointsMap.set(svId, (studentPointsMap.get(svId) || 0) + points);
      });
      
      const totalPoints = Array.from(studentPointsMap.values()).reduce((sum, pts) => sum + pts, 0);
      const avgPoints = totalStudents > 0 ? totalPoints / totalStudents : 0;
      
      const uniqueParticipants = new Set(allRegsForPoints.map(r => r.sv_id)).size;
      const participationRate = totalStudents > 0 ? (uniqueParticipants / totalStudents) * 100 : 0;

      const monthlyActivities = this._calculateMonthlyActivities(regs, allRegsForPoints);
      const activityTypes = this._calculateActivityTypes(regs);
      const topStudents = this._calculateTopStudents(allRegsForPoints);
      const pointsDistribution = this._calculatePointsDistribution(allRegsForPoints, totalStudents);
      const attendanceRate = this._calculateAttendanceRate(allRegsForPoints, totalStudents);

      const totalActivities = strictActivitiesCount;

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
}

export default GetClassReportsUseCase;
module.exports = GetClassReportsUseCase;
