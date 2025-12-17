/**
 * GetStudentDashboardUseCase
 * Use case for retrieving student dashboard data
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import { parseSemesterString } from '../../../../core/utils/semester';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import { countClassActivities } from '../../../../core/utils/classActivityCounter';
import { calculateActivityPoints, type ActivityWithPoints } from '../utils/activityPoints';
import type { IDashboardRepository } from '../interfaces/IDashboardRepository';
import type { StudentInfo, UpcomingActivity, DashboardActivityFilter, SemesterFilter } from '../../dashboard.types';
import type { HocKy } from '@prisma/client';

export interface StudentDashboardQuery {
  semester?: string;
  semesterValue?: string;
  hoc_ky?: string;
  nam_hoc?: string;
}

export interface DashboardActivityItem {
  id: string;
  hoat_dong: {
    id: string;
    ten_hd: string;
    mo_ta: string | null;
    hinh_anh: string[];
    loai_hd: {
      ten_loai_hd: string;
      diem_mac_dinh?: number | null;
      diem_toi_da?: number | null;
    };
    diem_rl: number;
    ngay_bd: Date;
    ngay_kt: Date | null;
    dia_diem: string | null;
    hoc_ky?: string;
    nam_hoc?: string;
  };
  diem_rl: number;
  hinh_anh: string[];
  ten_hd: string;
  ngay_bd: Date;
  dia_diem: string | null;
  ngay_dang_ky: Date;
  trang_thai_dk: string;
  trang_thai: string;
  ngay_duyet?: Date | null;
  ly_do_tu_choi?: string | null;
  is_class_activity: boolean;
}

export interface StudentDashboardResult {
  sinh_vien: StudentInfo;
  activities: DashboardActivityItem[];
  hoat_dong_sap_toi: UpcomingActivity[];
  thong_bao_chua_doc: number;
  tong_quan: {
    tong_diem: number;
    tong_hoat_dong: number;
    so_hoat_dong_da_tham_gia: number;
    muc_tieu: number;
  };
  so_sanh_lop: {
    my_rank_in_class: number | null;
    total_students_in_class: number;
  };
}

class GetStudentDashboardUseCase {
  private repository: IDashboardRepository;

  constructor(dashboardRepository: IDashboardRepository) {
    this.repository = dashboardRepository;
  }

  /**
   * Lấy danh sách class creators (sinh viên trong lớp + GVCN)
   */
  private async _getClassCreators(lopId: string | null, chuNhiemId: string | null | undefined): Promise<string[]> {
    if (!lopId) return [];
    
    // Lấy tất cả sinh viên trong lớp
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: { nguoi_dung_id: true }
    });
    
    const classCreatorUserIds = classStudents
      .map(s => s.nguoi_dung_id)
      .filter((id): id is string => id != null);
    
    // Thêm GVCN vào danh sách
    if (chuNhiemId) {
      classCreatorUserIds.push(chuNhiemId);
    }
    
    return [...new Set(classCreatorUserIds)]; // Remove duplicates
  }

  /**
   * Parse semester filter từ query
   */
  private _parseSemesterFilter(query: StudentDashboardQuery): SemesterFilter {
    const { semester, semesterValue, hoc_ky, nam_hoc } = query;
    const semesterParam = semesterValue || semester;
    
    if (semesterParam) {
      const parsed = parseSemesterString(semesterParam);
      if (parsed && parsed.year) {
        return {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        };
      }
    } else if (hoc_ky && nam_hoc) {
      return { hoc_ky: hoc_ky as HocKy, nam_hoc };
    }
    
    return {};
  }

  async execute(userId: string, query: StudentDashboardQuery): Promise<StudentDashboardResult> {
    const studentInfo = await this.repository.getStudentInfo(userId);
    if (!studentInfo) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }
    
    // Parse semester filter
    const semesterFilter = this._parseSemesterFilter(query);
    
    // Get class creators để filter upcoming activities
    const classCreators = await this._getClassCreators(
      studentInfo.lop_id,
      studentInfo.lop?.chu_nhiem
    );
    
    // Build activity filter với semester
    const activityFilter: DashboardActivityFilter = { ...semesterFilter };
    
    // Get registrations với filter
    const registrations = await this.repository.getStudentRegistrations(studentInfo.id, activityFilter);
    
    // Get upcoming activities với class creators và semester filter
    const upcomingActivities = await this.repository.getUpcomingActivities(
      studentInfo.id,
      classCreators,
      semesterFilter
    );
    
    const unreadCount = await this.repository.getUnreadNotificationsCount(userId);
    
    // Tính tổng điểm từ các đăng ký đã tham gia (da_tham_gia)
    const attendedRegistrations = registrations.filter(reg => 
      reg.trang_thai_dk === 'da_tham_gia' && reg.hoat_dong
    );
    
    let totalPoints = 0;
    attendedRegistrations.forEach(reg => {
      const points = calculateActivityPoints(reg.hoat_dong as ActivityWithPoints);
      totalPoints += points;
    });
    
    // Get class students count for ranking
    const classStudents = studentInfo.lop_id 
      ? await this.repository.getClassStudents(studentInfo.lop_id)
      : [];
    const totalStudentsInClass = classStudents.length;
    
    // Đếm tổng hoạt động của lớp theo chuẩn:
    // Tất cả hoạt động da_duyet/ket_thuc do SV/GVCN của lớp tạo
    const totalClassActivities = studentInfo.lop_id 
      ? await countClassActivities(studentInfo.lop_id, semesterFilter)
      : 0;

    let myRankInClass: number | null = null;
    if (studentInfo.lop_id && totalStudentsInClass > 0) {
      // Optimized: Fetch all class registrations in one query instead of N+1
      const allClassRegistrations = await this.repository.getClassRegistrations(
        studentInfo.lop_id, 
        activityFilter
      );
      
      // Group by student and calculate points
      const studentPointsMap: Record<number, number> = {};
      allClassRegistrations.forEach(reg => {
        if (reg.hoat_dong) {
          const points = calculateActivityPoints(reg.hoat_dong as ActivityWithPoints);
          studentPointsMap[reg.sv_id] = (studentPointsMap[reg.sv_id] || 0) + points;
        }
      });

      const classScores = classStudents.map(classmate => ({
        sv_id: classmate.id,
        tong_diem: studentPointsMap[classmate.id] || 0
      }));

      classScores.sort((a, b) => b.tong_diem - a.tong_diem);

      let prevScore: number | null = null;
      let currentRank = 0;
      classScores.forEach((score, index) => {
        if (prevScore === null || score.tong_diem < prevScore) {
          currentRank = index + 1;
          prevScore = score.tong_diem;
        }

        if (score.sv_id === studentInfo.id && myRankInClass === null) {
          myRankInClass = currentRank;
        }
      });
    }
    
    // Map registrations to activities (full list)
    const activities: DashboardActivityItem[] = registrations.map(reg => {
      if (!reg.hoat_dong) {
        return {
          ...reg,
          hoat_dong: null as any,
          diem_rl: 0,
          hinh_anh: [],
          ten_hd: '',
          ngay_bd: new Date(),
          dia_diem: null,
          trang_thai: reg.trang_thai_dk,
          is_class_activity: false
        } as DashboardActivityItem;
      }
      
      const hoatDong = reg.hoat_dong;
      const calculatedPoints = calculateActivityPoints(hoatDong as ActivityWithPoints);
      
      return {
        id: reg.id,
        hoat_dong: {
          id: hoatDong.id,
          ten_hd: hoatDong.ten_hd,
          mo_ta: hoatDong.mo_ta || null,
          hinh_anh: (hoatDong as any).hinh_anh || [],
          loai_hd: hoatDong.loai_hd ? {
            ten_loai_hd: hoatDong.loai_hd.ten_loai_hd || 'Khác',
            diem_mac_dinh: hoatDong.loai_hd.diem_mac_dinh,
            diem_toi_da: hoatDong.loai_hd.diem_toi_da
          } : { ten_loai_hd: 'Khác' },
          diem_rl: calculatedPoints,
          ngay_bd: hoatDong.ngay_bd,
          ngay_kt: hoatDong.ngay_kt || null,
          dia_diem: hoatDong.dia_diem || null,
          hoc_ky: hoatDong.hoc_ky,
          nam_hoc: hoatDong.nam_hoc
        },
        diem_rl: calculatedPoints,
        hinh_anh: (hoatDong as any).hinh_anh || [],
        ten_hd: hoatDong.ten_hd,
        ngay_bd: hoatDong.ngay_bd,
        dia_diem: hoatDong.dia_diem || null,
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai_dk: reg.trang_thai_dk,
        trang_thai: reg.trang_thai_dk,
        ngay_duyet: (reg as any).ngay_duyet,
        ly_do_tu_choi: (reg as any).ly_do_tu_choi,
        is_class_activity: true
      };
    });
    
    return {
      sinh_vien: studentInfo,
      activities: activities,
      hoat_dong_sap_toi: upcomingActivities,
      thong_bao_chua_doc: unreadCount,
      tong_quan: {
        tong_diem: totalPoints,
        tong_hoat_dong: totalClassActivities,
        so_hoat_dong_da_tham_gia: attendedRegistrations.length,
        muc_tieu: 100
      },
      so_sanh_lop: {
        my_rank_in_class: myRankInClass,
        total_students_in_class: totalStudentsInClass
      }
    };
  }
}

export default GetStudentDashboardUseCase;
