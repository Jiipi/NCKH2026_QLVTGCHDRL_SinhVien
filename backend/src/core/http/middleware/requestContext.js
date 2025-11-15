/**
 * Request Context Middleware
 * Attaches contextual information to the request object
 * This includes user ID, class ID, role, semester ID, etc.
 */

const { logError } = require('../../logger');
const { prisma } = require('../../../infrastructure/prisma/client');

/**
 * Attach request context
 * Enriches req with user context, class info, etc.
 */
const requestContext = async (req, res, next) => {
  try {
    // Initialize context object
    req.context = {
      userId: req.user?.sub || null,
      userRole: req.user?.role || null,
      tabId: req.user?.tabId || req.headers['x-tab-id'] || null,
      classId: null,
      className: null,
      semesterId: null,
      isAdmin: req.user?.role === 'ADMIN',
      isTeacher: ['GIANG_VIEN', 'ADMIN'].includes(req.user?.role),
      isMonitor: ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'].includes(req.user?.role),
      isStudent: req.user?.role === 'SINH_VIEN',
    };

    // If user is authenticated, try to get class info
    if (req.context.userId && !req.context.isAdmin) {
      try {
        // For students and monitors, get their class
        const student = await prisma.sinhVien.findUnique({
          where: { nguoi_dung_id: req.context.userId },
          select: {
            id: true,
            lop_id: true,
            lop: {
              select: {
                id: true,
                ten_lop: true,
                ma_lop: true,
              },
            },
          },
        });

        if (student && student.lop) {
          req.context.classId = student.lop.id;
          req.context.className = student.lop.ten_lop;
          req.context.classCode = student.lop.ma_lop;
          req.context.studentId = student.id;
        }

        // For teachers, get their managed classes (first one as default)
        if (req.context.isTeacher && !req.context.classId) {
          const teacher = await prisma.giangVien.findUnique({
            where: { nguoi_dung_id: req.context.userId },
            select: {
              id: true,
              lop_quan_ly: {
                take: 1,
                select: {
                  id: true,
                  ten_lop: true,
                  ma_lop: true,
                },
              },
            },
          });

          if (teacher && teacher.lop_quan_ly && teacher.lop_quan_ly.length > 0) {
            const firstClass = teacher.lop_quan_ly[0];
            req.context.classId = firstClass.id;
            req.context.className = firstClass.ten_lop;
            req.context.classCode = firstClass.ma_lop;
            req.context.teacherId = teacher.id;
          }
        }
      } catch (error) {
        logError('Failed to fetch user class context', error);
        // Continue without class info
      }
    }

    // Try to get current active semester
    try {
      const activeSemester = await prisma.hocKy.findFirst({
        where: { trang_thai: 'dang_ap_dung' },
        select: { id: true, ten_hk: true },
      });

      if (activeSemester) {
        req.context.semesterId = activeSemester.id;
        req.context.semesterName = activeSemester.ten_hk;
      }
    } catch (error) {
      logError('Failed to fetch active semester', error);
      // Continue without semester info
    }

    next();
  } catch (error) {
    logError('Request context middleware error', error);
    // Don't block request if context fails
    req.context = {
      userId: req.user?.sub || null,
      userRole: req.user?.role || null,
    };
    next();
  }
};

/**
 * Require class context
 * Ensures user has a class associated
 */
const requireClassContext = (req, res, next) => {
  if (!req.context || !req.context.classId) {
    return res.status(400).json({
      success: false,
      message: 'Không tìm thấy thông tin lớp của bạn',
    });
  }
  next();
};

module.exports = {
  requestContext,
  requireClassContext,
};




