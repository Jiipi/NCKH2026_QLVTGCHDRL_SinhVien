/**
 * GetMyActivitiesUseCase
 * Use case for retrieving student's registered activities
 */

import { NotFoundError } from '../../../../core/errors/AppError';
import { parseSemesterString } from '../../../../core/utils/semester';
import { calculateActivityPoints, type ActivityWithPoints } from '../utils/activityPoints';
import type { IDashboardRepository } from '../interfaces/IDashboardRepository';
import type { DashboardActivityFilter } from '../../dashboard.types';
import type { HocKy } from '@prisma/client';

export interface MyActivitiesQuery {
  semester?: string;
  semesterValue?: string;
  hoc_ky?: string;
  nam_hoc?: string;
}

export interface MyActivityItem {
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

class GetMyActivitiesUseCase {
  private repository: IDashboardRepository;

  constructor(dashboardRepository: IDashboardRepository) {
    this.repository = dashboardRepository;
  }

  /**
   * Parse semester filter từ query
   */
  private _parseSemesterFilter(query: MyActivitiesQuery): DashboardActivityFilter {
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

  async execute(userId: string, query: MyActivitiesQuery = {}): Promise<MyActivityItem[]> {
    const studentInfo = await this.repository.getStudentInfo(userId);
    if (!studentInfo) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const activityFilter = this._parseSemesterFilter(query);

    const registrations = await this.repository.getStudentRegistrations(studentInfo.id, activityFilter);
    
    // Map registrations với điểm đã được tính đúng và flatten structure để frontend dễ dùng
    return registrations.map(reg => {
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
        } as MyActivityItem;
      }
      
      const calculatedPoints = calculateActivityPoints(reg.hoat_dong as ActivityWithPoints);
      const hoatDong = reg.hoat_dong;
      
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
        // Flatten để frontend có thể lấy trực tiếp
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
  }
}

export default GetMyActivitiesUseCase;
