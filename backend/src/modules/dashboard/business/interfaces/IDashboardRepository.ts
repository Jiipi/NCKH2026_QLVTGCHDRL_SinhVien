/**
 * IDashboardRepository
 * Interface for dashboard data access
 * Follows Dependency Inversion Principle (DIP)
 */

import type {
  StudentInfo,
  ClassStudentInfo,
  ActivityTypeSummary,
  StudentRegistration,
  UpcomingActivity,
  DashboardActivityFilter,
  SemesterFilter
} from '../../dashboard.types';

export interface AdminOverviewStats {
  totalUsers: number;
  totalActivities: number;
  totalRegistrations: number;
  activeUsers: number;
  pendingApprovals: number;
  todayApprovals: number;
  newUsersThisMonth: number;
}

export interface ActivityStatsByStatus {
  trang_thai: string;
  _count: {
    id: number;
  };
}

export interface ClassRegistration {
  sv_id: string;
  hoat_dong: {
    diem_rl: number | null;
    loai_hd?: {
      diem_mac_dinh: number | null;
      diem_toi_da: number | null;
    } | null;
  };
}

export interface IDashboardRepository {
  getStudentInfo(userId: string): Promise<StudentInfo | null>;
  
  getClassStudents(lopId: string): Promise<ClassStudentInfo[]>;
  
  getActivityTypes(): Promise<ActivityTypeSummary[]>;
  
  getStudentRegistrations(svId: string, activityFilter?: DashboardActivityFilter): Promise<StudentRegistration[]>;
  
  getUpcomingActivities(svId: string, classCreators?: string[], semesterFilter?: SemesterFilter): Promise<UpcomingActivity[]>;
  
  getUnreadNotificationsCount(userId: string): Promise<number>;
  
  getActivityStatsByTimeRange(fromDate: Date): Promise<ActivityStatsByStatus[]>;
  
  getTotalActivitiesCount(fromDate: Date): Promise<number>;
  
  getTotalRegistrationsCount(fromDate: Date): Promise<number>;
  
  getAdminOverviewStats(): Promise<AdminOverviewStats>;
  
  getClassRegistrations(lopId: string, activityFilter?: DashboardActivityFilter): Promise<ClassRegistration[]>;
}

export default IDashboardRepository;
