/**
 * Monitor Data Mappers (Tầng 2: Business Logic)
 * Map API response -> UI model
 * 
 * NOTE: Core mapping functions have been moved to shared/lib/mappers
 * This file now re-exports and extends them for monitor-specific use cases
 */

import {
  mapActivityToUI as sharedMapActivityToUI,
  mapRegistrationStatusMonitor,
  mapRegistrationToUIMonitor,
  groupRegistrationsByStatusMonitor,
  type MappedActivity
} from '../../../../shared/lib/mappers';

// Re-export core functions
export { 
  mapRegistrationStatusMonitor as mapRegistrationStatus,
  mapRegistrationToUIMonitor as mapRegistrationToUI,
  groupRegistrationsByStatusMonitor as groupRegistrationsByStatus
};

/**
 * Map activity data từ API sang UI format (monitor view)
 */
export function mapActivityToUI(activity: any): MappedActivity {
  return sharedMapActivityToUI(activity);
}

/**
 * Map dashboard data từ API sang UI format
 */
export function mapDashboardToUI(apiData: any) {
  return {
    summary: {
      className: apiData.summary?.className || '',
      totalStudents: apiData.summary?.totalStudents || 0,
      pendingApprovals: apiData.summary?.pendingApprovals || 0,
      totalActivities: apiData.summary?.totalActivities || 0,
      avgClassScore: apiData.summary?.avgClassScore || 0,
      participationRate: apiData.summary?.participationRate || 0
    },
    upcomingActivities: (apiData.upcomingActivities || []).map(mapActivityToUI),
    recentApprovals: (apiData.recentApprovals || []).map(mapRegistrationToUIMonitor),
    topStudents: (apiData.topStudents || []).map((student: any) => ({
      id: student.id,
      name: student.name,
      mssv: student.mssv,
      points: student.points || student.pointsRounded || 0,
      activitiesCount: student.activitiesCount || 0,
      nguoi_dung: student.nguoi_dung ? {
        ho_ten: student.nguoi_dung.ho_ten,
        anh_dai_dien: student.nguoi_dung.anh_dai_dien
      } : null
    }))
  };
}
