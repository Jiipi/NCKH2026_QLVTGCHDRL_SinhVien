const dashboardRepo = require('./dashboard.repo');

/**
 * Dashboard Service
 * Handles business logic for dashboard data and calculations
 */
class DashboardService {
  /**
   * Classification thresholds for student points
   */
  getClassification(points) {
    if (points >= 90) return 'Xuất sắc';
    if (points >= 80) return 'Giỏi';
    if (points >= 70) return 'Khá';
    if (points >= 50) return 'Trung bình';
    return 'Yếu';
  }

  /**
   * Parse semester filter from query params
   * Supports both 'semester' (legacy) and 'semesterValue' (new) for backward compatibility
   */
  parseSemesterFilter(query) {
    const { semester, semesterValue, hoc_ky, nam_hoc } = query;
    const semesterFilter = {};
    
    // Support both 'semester' (legacy) and 'semesterValue' (new)
    const semesterParam = semesterValue || semester;
    
    if (semesterParam) {
      // New format: "hoc_ky_1-2024" or "hoc_ky_2-2024"
      const match = String(semesterParam).match(/^(hoc_ky_1|hoc_ky_2)-(\d{4})$/);
      if (match) {
        const hocKy = match[1];
        const year = parseInt(match[2], 10);
        const namHoc = hocKy === 'hoc_ky_1' ? `${year}-${year + 1}` : `${year - 1}-${year}`;
        semesterFilter.hoc_ky = hocKy;
        semesterFilter.nam_hoc = namHoc;
      }
    } else if (hoc_ky && nam_hoc) {
      // Legacy format support
      semesterFilter.hoc_ky = hoc_ky;
      semesterFilter.nam_hoc = nam_hoc;
    }
    
    return semesterFilter;
  }

  /**
   * Get class creators (homeroom teacher + all students in class)
   */
  async getClassCreators(lopId, chuNhiemId) {
    if (!lopId) return [];
    
    const classStudents = await dashboardRepo.getClassStudents(lopId);
    const classStudentUserIds = classStudents
      .map(s => s.nguoi_dung_id)
      .filter(Boolean);
    
    const creators = [...classStudentUserIds];
    if (chuNhiemId) {
      creators.push(chuNhiemId);
    }
    
    return creators;
  }

  /**
   * Calculate points summary with type breakdown and max points cap
   */
  async calculatePointsSummary(svId, activityFilter) {
    const registrations = await dashboardRepo.getStudentRegistrations(svId, activityFilter);
    const activityTypes = await dashboardRepo.getActivityTypes();
    
    // Align with Prisma Studio and monitor pages: count based on registration status 'da_tham_gia'
    const validRegistrations = registrations.filter(r => r.trang_thai_dk === 'da_tham_gia');
    
    // Create max points map
    const maxPointsMap = {};
    activityTypes.forEach(type => {
      maxPointsMap[type.ten_loai_hd] = Number(type.diem_toi_da || 0);
    });
    
    // Calculate points by type
    const pointsByType = {};
    
    validRegistrations.forEach(reg => {
      const activity = reg.hoat_dong;
      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      const points = parseFloat(activity.diem_rl || 0);
      
      if (!pointsByType[activityType]) {
        pointsByType[activityType] = {
          ten_loai: activityType,
          so_hoat_dong: 0,
          tong_diem_thuc: 0,
          diem_toi_da: maxPointsMap[activityType] || 0,
          tong_diem: 0
        };
      }
      
      pointsByType[activityType].so_hoat_dong++;
      pointsByType[activityType].tong_diem_thuc += points;
    });
    
    // Apply max points cap for each type
    let totalPoints = 0;
    let totalPointsUncapped = 0;
    Object.values(pointsByType).forEach(typeData => {
      const cappedPoints = Math.min(typeData.tong_diem_thuc, typeData.diem_toi_da);
      typeData.tong_diem = cappedPoints;
      totalPoints += cappedPoints;
      totalPointsUncapped += typeData.tong_diem_thuc;
    });
    
    const totalMaxPoints = activityTypes.reduce((sum, type) => 
      sum + Number(type.diem_toi_da || 0), 0
    );
    
    // Use uncapped total to match Prisma Studio and monitor pages
    return {
      tong_diem: totalPointsUncapped,
      tong_diem_toi_da: totalMaxPoints,
      tong_hoat_dong: validRegistrations.length,
      diem_theo_loai: Object.values(pointsByType),
      maxPointsMap
    };
  }

  /**
   * Build criteria progress array with icons and colors
   */
  buildCriteriaProgress(pointsByType, maxPointsMap) {
    const criteriaMapping = {
      'Học tập': { 
        ten_tieu_chi: 'Ý thức và kết quả học tập',
        mau_sac: '#3B82F6',
        icon: '📚'
      },
      'Nội quy': { 
        ten_tieu_chi: 'Ý thức và kết quả chấp hành nội quy',
        mau_sac: '#10B981',
        icon: '⚖️'
      },
      'Tình nguyện': { 
        ten_tieu_chi: 'Hoạt động phong trào, tình nguyện',
        mau_sac: '#F59E0B',
        icon: '🤝'
      },
      'Xã hội': { 
        ten_tieu_chi: 'Phẩm chất công dân và quan hệ xã hội',
        mau_sac: '#8B5CF6',
        icon: '🌟'
      },
      'Khen thưởng': { 
        ten_tieu_chi: 'Hoạt động khen thưởng, kỷ luật',
        mau_sac: '#EF4444',
        icon: '🏆'
      }
    };
    
    const criteriaProgress = [];
    let index = 1;
    
    Object.entries(criteriaMapping).forEach(([key, config]) => {
      const typeData = pointsByType.find(item => item.ten_loai === key);
      const diemToiDa = maxPointsMap[key] || 0;
      
      criteriaProgress.push({
        id: index++,
        ten_tieu_chi: config.ten_tieu_chi,
        diem_hien_tai: typeData?.tong_diem || 0,
        diem_toi_da: diemToiDa,
        mau_sac: config.mau_sac,
        icon: config.icon
      });
    });
    
    return criteriaProgress;
  }

  /**
   * Calculate class rank for student
   */
  async calculateClassRank(sinhVien, activityFilter, classCreators) {
    if (!sinhVien.lop_id) {
      return { rank: 1, total: 1 };
    }
    
    const classmates = await dashboardRepo.getClassStudents(sinhVien.lop_id);
    const totalStudentsInClass = classmates.length;
    
    // Calculate points for each student - same logic as calculatePointsSummary
    const classScores = await Promise.all(
      classmates.map(async (c) => {
        const cRegs = await dashboardRepo.getStudentRegistrations(c.id, activityFilter);
        
        // Only count 'da_tham_gia' registrations to match points calculation
        const cValid = cRegs.filter(r => r.trang_thai_dk === 'da_tham_gia');
        const cPoints = cValid.reduce((s, r) => s + Number(r.hoat_dong.diem_rl || 0), 0);
        
        return {
          mssv: c.mssv,
          points: cPoints,
          isCurrent: c.id === sinhVien.id
        };
      })
    );
    
    // Sort by points descending
    classScores.sort((a, b) => b.points - a.points);
    
    // Find current student rank
    const classRank = classScores.findIndex(s => s.isCurrent) + 1;
    
    return { rank: classRank, total: totalStudentsInClass };
  }

  /**
   * Format upcoming activities
   */
  formatUpcomingActivities(activities) {
    return activities.map(activity => ({
      id: activity.id,
      ten_hd: activity.ten_hd,
      ngay_bd: activity.ngay_bd,
      ngay_kt: activity.ngay_kt,
      dia_diem: activity.dia_diem,
      diem_rl: parseFloat(activity.diem_rl || 0),
      loai_hd: activity.loai_hd?.ten_loai_hd || 'Khác',
      da_dang_ky: activity.dang_ky_hd.length > 0,
      trang_thai_dk: activity.dang_ky_hd[0]?.trang_thai_dk || null
    }));
  }

  /**
   * Format recent activities
   */
  formatRecentActivities(registrations) {
    return registrations
      .sort((a, b) => {
        const dateA = new Date(a.ngay_duyet || a.ngay_dang_ky || 0);
        const dateB = new Date(b.ngay_duyet || b.ngay_dang_ky || 0);
        return dateB - dateA;
      })
      .map(reg => ({
        id: reg.hoat_dong.id,
        registration_id: reg.id,  // Add registration ID for cancel functionality
        ten_hd: reg.hoat_dong.ten_hd,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
        ngay_tham_gia: reg.ngay_duyet,
        ngay_bd: reg.hoat_dong.ngay_bd,
        trang_thai: reg.trang_thai_dk
      }));
  }

  /**
   * Get student dashboard data
   */
  async getStudentDashboard(userId, query) {
    console.log('🔍 getStudentDashboard called - userId:', userId, 'query:', query);
    
    // Get student info
    const sinhVien = await dashboardRepo.getStudentInfo(userId);
    if (!sinhVien) {
      throw new Error('Không tìm thấy thông tin sinh viên');
    }
    console.log('✅ Student found:', { id: sinhVien.id, mssv: sinhVien.mssv, lop_id: sinhVien.lop_id });
    
    // Parse semester filter
    const semesterFilter = this.parseSemesterFilter(query);
    console.log('📅 Semester filter:', semesterFilter);
    
    // Build activity filter
    const activityWhereClause = { ...semesterFilter };
    
    // Get class creators (only activities from class)
    const classCreators = await this.getClassCreators(sinhVien.lop_id, sinhVien.lop.chu_nhiem);
    console.log('👥 Class creators count:', classCreators.length);
    
    if (classCreators.length > 0) {
      activityWhereClause.nguoi_tao_id = { in: classCreators };
    }
    console.log('🔍 Activity where clause:', JSON.stringify(activityWhereClause, null, 2));
    
    // Calculate points summary with QR validation
    const pointsSummary = await this.calculatePointsSummary(sinhVien.id, activityWhereClause);
    
    // Get upcoming activities
    const upcomingActivities = await dashboardRepo.getUpcomingActivities(
      sinhVien.id,
      classCreators,
      semesterFilter
    );
    
    // Get recent activities - only from 'da_tham_gia' registrations to match points calculation
    const allRegistrations = await dashboardRepo.getStudentRegistrations(sinhVien.id, activityWhereClause);
    const validRegs = allRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia');
    
    // Get unread notifications
    const unreadNotifications = await dashboardRepo.getUnreadNotificationsCount(userId);
    
    // Build criteria progress
    const criteriaProgress = this.buildCriteriaProgress(
      pointsSummary.diem_theo_loai,
      pointsSummary.maxPointsMap
    );
    
    // Calculate class rank
    const { rank, total } = await this.calculateClassRank(
      sinhVien,
      activityWhereClause,
      classCreators
    );
    
    // Get classification
    const xepLoai = this.getClassification(pointsSummary.tong_diem);
    
    // Build response
    return {
      sinh_vien: {
        mssv: sinhVien.mssv,
        ho_ten: sinhVien.nguoi_dung.ho_ten,
        email: sinhVien.nguoi_dung.email,
        lop: sinhVien.lop
      },
      tong_quan: {
        tong_diem: pointsSummary.tong_diem,
        tong_diem_toi_da: pointsSummary.tong_diem_toi_da,
        tong_hoat_dong: pointsSummary.tong_hoat_dong,
        ti_le_hoan_thanh: pointsSummary.tong_diem_toi_da > 0 
          ? Math.min(pointsSummary.tong_diem / pointsSummary.tong_diem_toi_da, 1)
          : 0,
        thong_bao_chua_doc: unreadNotifications,
        xep_loai: xepLoai,
        muc_tieu: 100
      },
      hoat_dong_sap_toi: this.formatUpcomingActivities(upcomingActivities),
      hoat_dong_gan_day: this.formatRecentActivities(validRegs),
      tien_do_tieu_chi: criteriaProgress,
      so_sanh_lop: {
        my_total: pointsSummary.tong_diem,
        class_average: 68,
        department_average: 65,
        my_rank_in_class: rank,
        total_students_in_class: total,
        my_rank_in_department: 45,
        total_students_in_department: 280,
        class_name: sinhVien.lop.ten_lop,
        department_name: sinhVien.lop.khoa
      }
    };
  }

  /**
   * Get ALL my registered activities (for My Activities page)
   * Returns full list with is_class_activity flag
   */
  async getMyActivities(userId, query = {}) {
    console.log('🔍 getMyActivities called - userId:', userId, 'query:', query);
    
    // Get student info
    const sinhVien = await dashboardRepo.getStudentInfo(userId);
    if (!sinhVien) {
      console.error('❌ Student not found for userId:', userId);
      throw new Error('Không tìm thấy thông tin sinh viên');
    }
    console.log('✅ Student found:', { id: sinhVien.id, mssv: sinhVien.mssv, lop_id: sinhVien.lop_id });
    
    // Parse semester filter
    const semesterFilter = this.parseSemesterFilter(query);
    console.log('📅 Semester filter:', semesterFilter);
    
    // Build activity filter
    const activityWhereClause = { ...semesterFilter };
    
    // Get class creators
    const classCreators = await this.getClassCreators(sinhVien.lop_id, sinhVien.lop.chu_nhiem);
    console.log('👥 Class creators count:', classCreators.length);
    
    if (classCreators.length > 0) {
      activityWhereClause.nguoi_tao_id = { in: classCreators };
    }
    console.log('🔍 Activity where clause:', JSON.stringify(activityWhereClause));
    
    // Get ALL registrations (not just top 5)
    const registrations = await dashboardRepo.getStudentRegistrations(sinhVien.id, activityWhereClause);
    console.log('📋 Found registrations:', registrations.length);
    
    // Log unique status values for debugging
    const uniqueStatuses = [...new Set(registrations.map(r => r.trang_thai_dk))];
    console.log('📊 Unique registration statuses:', uniqueStatuses);
    
    // Map to frontend format with is_class_activity flag
    const result = registrations
      .sort((a, b) => {
        // Sort by activity's ngay_cap_nhat (last updated) first, then by registration date
        const dateA = a.hoat_dong?.ngay_cap_nhat || a.ngay_duyet || a.ngay_dang_ky || new Date(0);
        const dateB = b.hoat_dong?.ngay_cap_nhat || b.ngay_duyet || b.ngay_dang_ky || new Date(0);
        return new Date(dateB) - new Date(dateA); // Mới nhất trước
      })
      .map(reg => ({
        id: reg.hoat_dong.id,
        hd_id: reg.hoat_dong.id,
        registration_id: reg.id,
        ten_hd: reg.hoat_dong.ten_hd,
        hoat_dong: {
          id: reg.hoat_dong.id,
          ten_hd: reg.hoat_dong.ten_hd,
          loai_hd: reg.hoat_dong.loai_hd,
          loai: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
          diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
          dia_diem: reg.hoat_dong.dia_diem,
          ngay_bd: reg.hoat_dong.ngay_bd,
          ngay_kt: reg.hoat_dong.ngay_kt,
          hinh_anh: reg.hoat_dong.hinh_anh,
          trang_thai: reg.hoat_dong.trang_thai
        },
        trang_thai_dk: reg.trang_thai_dk,
        ngay_dang_ky: reg.ngay_dang_ky,
        ngay_duyet: reg.ngay_duyet,
        ly_do_tu_choi: reg.ly_do_tu_choi,
        is_class_activity: true  // Always true since we filtered by class creators
      }));
    
    console.log('✅ Returning', result.length, 'activities with statuses:', result.map(r => r.trang_thai_dk));
    return result;
  }

  /**
   * Get activity statistics by time range
   */
  async getActivityStats(timeRange = '30d') {
    const now = new Date();
    let fromDate;
    
    switch (timeRange) {
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const stats = await dashboardRepo.getActivityStatsByTimeRange(fromDate);
    const totalActivities = await dashboardRepo.getTotalActivitiesCount(fromDate);
    const totalRegistrations = await dashboardRepo.getTotalRegistrationsCount(fromDate);
    
    return {
      time_range: timeRange,
      total_activities: totalActivities,
      total_registrations: totalRegistrations,
      activity_status: stats,
      generated_at: new Date()
    };
  }

  /**
   * Get admin dashboard statistics (Admin only)
   * Provides system-wide overview with counts
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getAdminDashboard() {
    const { prisma } = require('../../infrastructure/prisma/client');
    
    const [
      totalUsers,
      totalActivities,
      totalRegistrations,
      activeUsers
    ] = await Promise.all([
      prisma.nguoiDung.count(),
      prisma.hoatDong.count(),
      prisma.dangKyHoatDong.count(),
      prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } })
    ]);

    const pendingApprovals = await prisma.dangKyHoatDong.count({
      where: { trang_thai_dk: 'cho_duyet' }
    });

    return {
      totalUsers,
      totalActivities,
      totalRegistrations,
      activeUsers,
      pendingApprovals
    };
  }
}

module.exports = new DashboardService();





