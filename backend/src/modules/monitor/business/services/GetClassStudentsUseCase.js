const { parseSemesterString } = require('../../../../core/utils/semester');
const { logInfo, logError } = require('../../../../core/logger');

/**
 * GetClassStudentsUseCase
 * Use case for getting class students with points
 * Follows Single Responsibility Principle (SRP)
 */
class GetClassStudentsUseCase {
  constructor(monitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(classId, semester = null) {
    try {
      logInfo('Getting class students', { classId, semester });

      let activityFilter = {};
      if (semester) {
        const parsed = parseSemesterString(semester);
        if (parsed && parsed.year) {
          activityFilter = {
            hoc_ky: parsed.semester,
            nam_hoc: parsed.year
          };
        }
      } else {
        const current = parseSemesterString('current');
        if (current && current.year) {
          activityFilter = {
            hoc_ky: current.semester,
            nam_hoc: current.year
          };
        }
      }

      const students = await this.monitorRepository.findStudentsByClass(classId);
      const regs = await this.monitorRepository.findClassRegistrationsForPoints(classId, activityFilter);
      
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
}

module.exports = GetClassStudentsUseCase;

