/**
 * GetDetailedScoresUseCase
 * Use case for retrieving detailed score breakdown
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import { parseSemesterString } from '../../../../core/utils/semester';
import type { IDashboardRepository } from '../interfaces/IDashboardRepository';
import type { StudentInfo, DashboardActivityFilter } from '../../dashboard.types';
import { calculateActivityPoints, type ActivityWithPoints } from '../utils/activityPoints';
import type { HocKy } from '@prisma/client';

export interface DetailedScoresQuery {
  semester?: string;
  semesterValue?: string;
  hoc_ky?: string;
  nam_hoc?: string;
  year?: string;
}

export interface DetailedActivityItem {
  id: string;
  ten_hd: string;
  mo_ta: string | null;
  loai_hd: string;
  diem_rl: number;
  ngay_bd: Date;
  ngay_kt: Date | null;
  dia_diem: string | null;
  hoc_ky?: string;
  nam_hoc?: string;
  ngay_dang_ky: Date;
  trang_thai_dk: string;
  trang_thai: string;
  ngay_duyet?: Date | null;
  ly_do_tu_choi?: string | null;
}

export interface DetailedScoresResult {
  student_info: StudentInfo;
  activities: DetailedActivityItem[];
  summary: {
    tong_diem: number;
    tong_hoat_dong: number;
    xep_loai: string;
  };
  class_rankings: {
    my_rank_in_class: number | null;
    total_students_in_class: number;
  };
}

class GetDetailedScoresUseCase {
  private repository: IDashboardRepository;

  constructor(dashboardRepository: IDashboardRepository) {
    this.repository = dashboardRepository;
  }

  /**
   * Parse semester filter từ query
   */
  private _parseSemesterFilter(query: DetailedScoresQuery): DashboardActivityFilter {
    const { semester, semesterValue, hoc_ky, nam_hoc, year } = query;
    const semesterParam = semesterValue || semester;
    
    if (semesterParam) {
      const parsed = parseSemesterString(semesterParam);
      if (parsed && parsed.year) {
        return {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        };
      }
    } else if (hoc_ky && (nam_hoc || year)) {
      return { hoc_ky: hoc_ky as HocKy, nam_hoc: nam_hoc || year };
    }
    
    return {};
  }

  /**
   * Xác định xếp loại theo điểm
   */
  private _getClassification(points: number): string {
    if (points >= 90) return 'Xuất sắc';
    if (points >= 80) return 'Tốt';
    if (points >= 65) return 'Khá';
    if (points >= 50) return 'Trung bình';
    return 'Yếu';
  }

  async execute(userId: string, query: DetailedScoresQuery): Promise<DetailedScoresResult> {
    const studentInfo = await this.repository.getStudentInfo(userId);
    if (!studentInfo) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const activityFilter = this._parseSemesterFilter(query);

    const registrations = await this.repository.getStudentRegistrations(studentInfo.id, activityFilter);
    
    // CHỈ lấy các đăng ký đã tham gia (da_tham_gia) để tính điểm
    const attendedRegistrations = registrations.filter(reg => 
      reg.trang_thai_dk === 'da_tham_gia' && reg.hoat_dong
    );
    
    // Tính tổng điểm từ các hoạt động đã tham gia
    let totalPoints = 0;
    attendedRegistrations.forEach(reg => {
      const points = calculateActivityPoints(reg.hoat_dong as ActivityWithPoints);
      totalPoints += points;
    });
    
    // Map activities với điểm đã được tính đúng - CHỈ lấy da_tham_gia
    const activities: DetailedActivityItem[] = attendedRegistrations.map(reg => {
      const hoatDong = reg.hoat_dong!;
      const calculatedPoints = calculateActivityPoints(hoatDong as ActivityWithPoints);
      
      return {
        id: hoatDong.id,
        ten_hd: hoatDong.ten_hd,
        mo_ta: hoatDong.mo_ta || null,
        loai_hd: hoatDong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: calculatedPoints,
        ngay_bd: hoatDong.ngay_bd,
        ngay_kt: hoatDong.ngay_kt || null,
        dia_diem: hoatDong.dia_diem || null,
        hoc_ky: hoatDong.hoc_ky,
        nam_hoc: hoatDong.nam_hoc,
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai_dk: reg.trang_thai_dk,
        trang_thai: reg.trang_thai_dk, // Alias cho frontend
        ngay_duyet: (reg as any).ngay_duyet,
        ly_do_tu_choi: (reg as any).ly_do_tu_choi
      };
    });
    
    // Tính xếp hạng trong lớp
    let classRank: number | null = null;
    let totalStudentsInClass = 0;
    
    if (studentInfo.lop_id) {
      const classStudents = await this.repository.getClassStudents(studentInfo.lop_id);
      totalStudentsInClass = classStudents.length;
      
      if (totalStudentsInClass > 0) {
        // Tính điểm cho từng sinh viên trong lớp
        const classScores = await Promise.all(
          classStudents.map(async (classmate) => {
            const classmateRegistrations = await this.repository.getStudentRegistrations(
              classmate.id,
              activityFilter
            );
            
            const classmateAttended = classmateRegistrations.filter(reg =>
              reg.trang_thai_dk === 'da_tham_gia' && reg.hoat_dong
            );
            
            let classmatePoints = 0;
            classmateAttended.forEach(reg => {
              const points = calculateActivityPoints(reg.hoat_dong as ActivityWithPoints);
              classmatePoints += points;
            });
            
            return {
              sv_id: classmate.id,
              tong_diem: classmatePoints
            };
          })
        );
        
        // Sắp xếp theo điểm giảm dần
        classScores.sort((a, b) => b.tong_diem - a.tong_diem);
        
        // Tìm vị trí của sinh viên hiện tại
        const currentStudentIndex = classScores.findIndex(
          score => score.sv_id === studentInfo.id
        );
        
        if (currentStudentIndex !== -1) {
          classRank = currentStudentIndex + 1; // Xếp hạng bắt đầu từ 1
        }
      }
    }
    
    return {
      student_info: studentInfo,
      activities: activities,
      summary: {
        tong_diem: totalPoints,
        tong_hoat_dong: attendedRegistrations.length,
        xep_loai: this._getClassification(totalPoints)
      },
      class_rankings: {
        my_rank_in_class: classRank,
        total_students_in_class: totalStudentsInClass
      }
    };
  }
}

export default GetDetailedScoresUseCase;
