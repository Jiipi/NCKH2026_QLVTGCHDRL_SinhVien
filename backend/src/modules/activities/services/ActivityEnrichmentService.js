/**
 * Activity Enrichment Service
 * Handles enrichment of activities with additional data (registrations, permissions, etc.)
 * Follows Single Responsibility Principle (SRP)
 */

const { normalizeRole } = require('../../../core/utils/roleHelper');

class ActivityEnrichmentService {
  /**
   * Enrich activities with student's registration status
   * For LOP_TRUONG: also add has_class_registrations, class_relation, registrationCount
   */
  async enrichActivitiesWithRegistrations(activities, userId, userRole) {
    const { prisma } = require('../../../infrastructure/prisma/client');

    try {
      // Get student ID from user ID
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { id: true, lop_id: true }
      });

      if (!student) {
        return activities;
      }

      // Get all activity IDs
      const activityIds = activities.map(a => a.id).filter(Boolean);
      if (activityIds.length === 0) return activities;

      // Get registrations for this student and these activities
      const registrations = await prisma.dangKyHoatDong.findMany({
        where: {
          sv_id: student.id,
          hd_id: { in: activityIds }
        },
        select: {
          hd_id: true,
          trang_thai_dk: true
        }
      });

      // Create a map of activity ID -> registration status
      const registrationMap = new Map();
      registrations.forEach(reg => {
        registrationMap.set(reg.hd_id, reg.trang_thai_dk);
      });

      // For LOP_TRUONG: get class registrations
      let classRegistrationsMap = new Map();
      if (userRole === 'LOP_TRUONG' && student.lop_id) {
        const classRegistrations = await prisma.dangKyHoatDong.findMany({
          where: {
            hd_id: { in: activityIds },
            sinh_vien: { lop_id: student.lop_id }
          },
          select: {
            hd_id: true,
            trang_thai_dk: true
          }
        });

        // Group by activity ID
        const grouped = classRegistrations.reduce((acc, reg) => {
          if (!acc[reg.hd_id]) {
            acc[reg.hd_id] = [];
          }
          acc[reg.hd_id].push(reg);
          return acc;
        }, {});

        // Count registrations per activity
        Object.keys(grouped).forEach(activityId => {
          classRegistrationsMap.set(activityId, {
            count: grouped[activityId].length,
            registrations: grouped[activityId]
          });
        });

        // Check if teacher is homeroom teacher
        if (userRole === 'LOP_TRUONG') {
          const lop = await prisma.lop.findUnique({
            where: { id: student.lop_id },
            select: { chu_nhiem: true }
          });

          if (lop?.chu_nhiem) {
            // Check if any activities were created by the homeroom teacher
            const teacherActivities = await prisma.hoatDong.findMany({
              where: {
                id: { in: activityIds },
                nguoi_tao_id: lop.chu_nhiem
              },
              select: { id: true }
            });

            const teacherActivityIds = new Set(teacherActivities.map(a => a.id));
            classRegistrationsMap.forEach((value, activityId) => {
              value.is_teacher_activity = teacherActivityIds.has(activityId);
            });
          }
        }
      }

      // Enrich each activity
      return activities.map(activity => {
        const registrationStatus = registrationMap.get(activity.id) || null;
        const classRegData = classRegistrationsMap.get(activity.id);

        return {
          ...activity,
          registration_status: registrationStatus,
          is_registered: !!registrationStatus,
          ...(userRole === 'LOP_TRUONG' && classRegData ? {
            has_class_registrations: classRegData.count > 0,
            class_relation: classRegData.is_teacher_activity ? 'teacher' : 'other',
            registrationCount: classRegData.count
          } : {})
        };
      });
    } catch (error) {
      console.error('Error enriching activities with registrations:', error);
      // Return original activities if enrichment fails
      return activities;
    }
  }

  /**
   * Enrich activity with computed fields
   */
  enrichActivity(activity, user) {
    // Add user-specific flags
    // Handle null/undefined user safely
    const userRole = user ? normalizeRole(user.role) : null;
    const userId = user?.sub || null;

    const enriched = {
      ...activity,
      is_creator: userId ? (activity.nguoi_tao_id === userId) : false,
      can_edit: userId ? (activity.nguoi_tao_id === userId || ['ADMIN', 'GIANG_VIEN'].includes(userRole)) : false,
      can_delete: userRole ? ['ADMIN', 'GIANG_VIEN'].includes(userRole) : false
    };

    return enriched;
  }
}

module.exports = ActivityEnrichmentService;

