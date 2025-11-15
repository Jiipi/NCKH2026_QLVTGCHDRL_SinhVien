/**
 * Registrations Repository - Pure Data Access Layer
 * Chỉ chứa Prisma queries, không có business logic
 */

const { prisma } = require('../../infrastructure/prisma/client');

const registrationsRepo = {
  /**
   * Lấy danh sách registrations với filter và pagination
   * ✅ FIX: Default sort by ngay_dang_ky DESC (mới nhất trước)
   */
  async findMany({ where = {}, skip = 0, limit = 20, orderBy = { ngay_dang_ky: 'desc' }, include = {} }) {
    const [items, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          activity: include.activity ? {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              location: true,
              maxParticipants: true,
              status: true
            }
          } : false,
          user: include.user ? {
            select: {
              id: true,
              mssv: true,
              fullName: true,
              email: true,
              role: true
            }
          } : false,
          approvedBy: include.approvedBy ? {
            select: {
              id: true,
              mssv: true,
              fullName: true,
              role: true
            }
          } : false,
          ...include
        }
      }),
      prisma.registration.count({ where })
    ]);

    return { items, total };
  },

  /**
   * Lấy registration theo ID
   */
  async findById(id, include = {}) {
    return prisma.registration.findUnique({
      where: { id: parseInt(id) },
      include: {
        activity: include.activity ? {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            maxParticipants: true,
            status: true,
            createdBy: true
          }
        } : false,
        user: include.user ? {
          select: {
            id: true,
            mssv: true,
            fullName: true,
            email: true,
            role: true,
            class: true
          }
        } : false,
        approvedBy: include.approvedBy ? {
          select: {
            id: true,
            mssv: true,
            fullName: true,
            role: true
          }
        } : false,
        ...include
      }
    });
  },

  /**
   * Lấy registration theo userId và activityId
   */
  async findByUserAndActivity(userId, activityId) {
    return prisma.registration.findFirst({
      where: {
        userId: parseInt(userId),
        activityId: parseInt(activityId)
      },
      include: {
        activity: true,
        user: true
      }
    });
  },

  /**
   * Tạo registration mới
   */
  async create(data) {
    return prisma.registration.create({
      data: {
        userId: parseInt(data.userId),
        activityId: parseInt(data.activityId),
        status: data.status || 'PENDING',
        note: data.note || null,
        attendanceStatus: data.attendanceStatus || null,
        checkInTime: data.checkInTime || null
      },
      include: {
        activity: true,
        user: true
      }
    });
  },

  /**
   * Update registration
   */
  async update(id, data) {
    const updateData = {};
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.attendanceStatus !== undefined) updateData.attendanceStatus = data.attendanceStatus;
    if (data.checkInTime !== undefined) updateData.checkInTime = data.checkInTime;
    if (data.approvedById !== undefined) updateData.approvedById = parseInt(data.approvedById);
    if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt;
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason;

    return prisma.registration.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        activity: true,
        user: true,
        approvedBy: true
      }
    });
  },

  /**
   * Xóa registration
   */
  async delete(id) {
    return prisma.registration.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Check registration exists
   */
  async exists(id) {
    const count = await prisma.registration.count({
      where: { id: parseInt(id) }
    });
    return count > 0;
  },

  /**
   * Đếm số registrations theo activity
   */
  async countByActivity(activityId) {
    return prisma.registration.count({
      where: { activityId: parseInt(activityId) }
    });
  },

  /**
   * Đếm số registrations theo status
   */
  async countByStatus(activityId, status) {
    return prisma.registration.count({
      where: {
        activityId: parseInt(activityId),
        status
      }
    });
  },

  /**
   * Lấy stats cho activity
   */
  async getActivityStats(activityId) {
    const [total, approved, rejected, pending] = await Promise.all([
      prisma.registration.count({
        where: { activityId: parseInt(activityId) }
      }),
      prisma.registration.count({
        where: { activityId: parseInt(activityId), status: 'APPROVED' }
      }),
      prisma.registration.count({
        where: { activityId: parseInt(activityId), status: 'REJECTED' }
      }),
      prisma.registration.count({
        where: { activityId: parseInt(activityId), status: 'PENDING' }
      })
    ]);

    return { total, approved, rejected, pending };
  },

  /**
   * Bulk approve registrations
   */
  async bulkApprove(ids, approvedById) {
    return prisma.registration.updateMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
      data: {
        status: 'APPROVED',
        approvedById: parseInt(approvedById),
        approvedAt: new Date()
      }
    });
  },

  /**
   * Bulk reject registrations
   */
  async bulkReject(ids, rejectionReason) {
    return prisma.registration.updateMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
      data: {
        status: 'REJECTED',
        rejectionReason
      }
    });
  },

  /**
   * Check-in registration
   */
  async checkIn(id, checkInTime = new Date()) {
    return prisma.registration.update({
      where: { id: parseInt(id) },
      data: {
        attendanceStatus: 'CHECKED_IN',
        checkInTime
      }
    });
  },

  /**
   * Lấy registrations của user
   * ✅ FIX: Sort by ngay_dang_ky DESC (mới nhất trước)
   */
  async findByUser(userId, where = {}) {
    return prisma.registration.findMany({
      where: {
        userId: parseInt(userId),
        ...where
      },
      include: {
        activity: true
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });
  }
};

module.exports = registrationsRepo;





