/**
 * Middleware: Class Activity Access Control
 * 
 * Rule: Sinh viên/Lớp trưởng/GVCN CHỈ được truy cập hoạt động trong lớp của mình
 * 
 * - Sinh viên chỉ thấy hoạt động do lớp mình tạo (GVCN hoặc bất kỳ sinh viên nào trong lớp)
 * - Lớp trưởng chỉ tạo/quản lý hoạt động cho lớp mình
 * - GVCN chỉ quản lý hoạt động của các lớp mình phụ trách
 * - Admin: không bị giới hạn (full access)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get class creators (GVCN + all students in class)
 * @param {number} lopId - Class ID
 * @returns {Promise<number[]>} Array of user IDs
 */
async function getClassCreators(lopId) {
  if (!lopId) return [];
  
  try {
    // Get all students in the class
    const allClassStudents = await prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: { nguoi_dung_id: true }
    });
    
    const classStudentUserIds = allClassStudents
      .map(s => s.nguoi_dung_id)
      .filter(Boolean);
    
    // Get class advisor (GVCN)
    const lop = await prisma.lop.findUnique({
      where: { id: lopId },
      select: { chu_nhiem: true }
    });
    
    const classCreators = [...classStudentUserIds];
    if (lop?.chu_nhiem) {
      classCreators.push(lop.chu_nhiem);
    }
    
    return classCreators;
  } catch (error) {
    console.error('Error getting class creators:', error);
    return [];
  }
}

/**
 * Get all class IDs that a teacher (GVCN) is responsible for
 * @param {number} userId - User ID (GVCN)
 * @returns {Promise<number[]>} Array of class IDs
 */
async function getTeacherClasses(userId) {
  try {
    const classes = await prisma.lop.findMany({
      where: { chu_nhiem: userId },
      select: { id: true }
    });
    return classes.map(c => c.id);
  } catch (error) {
    console.error('Error getting teacher classes:', error);
    return [];
  }
}

/**
 * Get student info (including class ID)
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Student object with lop_id
 */
async function getStudentInfo(userId) {
  try {
    return await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true, lop_id: true, mssv: true }
    });
  } catch (error) {
    console.error('Error getting student info:', error);
    return null;
  }
}

/**
 * Check if user can access activities in a class
 * @param {number} userId - User ID
 * @param {string} userRole - User role (sinh_vien, lop_truong, giao_vien, admin)
 * @param {number} lopId - Class ID to check
 * @returns {Promise<boolean>}
 */
async function canAccessClassActivities(userId, userRole, lopId) {
  // Admin has full access
  if (userRole === 'admin') return true;
  
  // Student or Class Monitor
  if (userRole === 'sinh_vien' || userRole === 'lop_truong') {
    const student = await getStudentInfo(userId);
    return student && student.lop_id === lopId;
  }
  
  // Teacher (GVCN)
  if (userRole === 'giao_vien') {
    const teacherClasses = await getTeacherClasses(userId);
    return teacherClasses.includes(lopId);
  }
  
  return false;
}

/**
 * Middleware: Inject class filter for activities query
 * Adds req.classActivityFilter based on user role and class
 */
async function injectClassActivityFilter(req, res, next) {
  try {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    
    if (!userId || !userRole) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - No user info' 
      });
    }
    
    // Admin: no filter, can see all activities
    if (userRole === 'admin') {
      req.classActivityFilter = {};
      req.classCreators = [];
      req.userClassId = null;
      return next();
    }
    
    // Student or Class Monitor: filter by their class
    if (userRole === 'sinh_vien' || userRole === 'lop_truong') {
      const student = await getStudentInfo(userId);
      
      if (!student || !student.lop_id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Không tìm thấy thông tin lớp của bạn' 
        });
      }
      
      const classCreators = await getClassCreators(student.lop_id);
      
      // Filter: activities created by anyone in the class (including GVCN)
      req.classActivityFilter = {
        nguoi_tao_id: { in: classCreators }
      };
      req.classCreators = classCreators;
      req.userClassId = student.lop_id;
      req.studentId = student.id;
      
      return next();
    }
    
    // Teacher (GVCN): filter by their classes
    if (userRole === 'giao_vien') {
      const teacherClasses = await getTeacherClasses(userId);
      
      if (teacherClasses.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn chưa được phân công làm GVCN cho lớp nào' 
        });
      }
      
      // Get all students in teacher's classes
      const allStudents = await prisma.sinhVien.findMany({
        where: { lop_id: { in: teacherClasses } },
        select: { nguoi_dung_id: true }
      });
      
      const studentUserIds = allStudents
        .map(s => s.nguoi_dung_id)
        .filter(Boolean);
      
      // Include teacher's own ID
      const classCreators = [...studentUserIds, userId];
      
      // Filter: activities created by teacher or students in their classes
      req.classActivityFilter = {
        nguoi_tao_id: { in: classCreators }
      };
      req.classCreators = classCreators;
      req.userClassIds = teacherClasses;
      
      return next();
    }
    
    // Unknown role
    return res.status(403).json({ 
      success: false, 
      message: 'Không có quyền truy cập' 
    });
    
  } catch (error) {
    console.error('Class activity filter error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống khi kiểm tra quyền truy cập' 
    });
  }
}

/**
 * Middleware: Check if user can register for an activity
 * Verifies that the activity belongs to user's class
 */
async function canRegisterActivity(req, res, next) {
  try {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const activityId = parseInt(req.params.id || req.body.hd_id);
    
    if (!activityId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin hoạt động' 
      });
    }
    
    // Admin can register anyone
    if (userRole === 'admin') {
      return next();
    }
    
    // Get activity info
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId },
      select: { 
        id: true, 
        nguoi_tao_id: true,
        ten_hd: true 
      }
    });
    
    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy hoạt động' 
      });
    }
    
    // Student/Monitor: check if activity is from their class
    if (userRole === 'sinh_vien' || userRole === 'lop_truong') {
      const student = await getStudentInfo(userId);
      
      if (!student || !student.lop_id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Không tìm thấy thông tin lớp của bạn' 
        });
      }
      
      const classCreators = await getClassCreators(student.lop_id);
      
      // Check if activity creator is in the same class
      if (!classCreators.includes(activity.nguoi_tao_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn chỉ có thể đăng ký hoạt động trong lớp của mình' 
        });
      }
      
      return next();
    }
    
    // Teacher: can approve registrations for their class activities
    if (userRole === 'giao_vien') {
      const teacherClasses = await getTeacherClasses(userId);
      
      if (teacherClasses.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn chưa được phân công làm GVCN' 
        });
      }
      
      // Check if teacher created this activity OR if activity is from their class
      const allStudents = await prisma.sinhVien.findMany({
        where: { lop_id: { in: teacherClasses } },
        select: { nguoi_dung_id: true }
      });
      
      const classCreators = [
        ...allStudents.map(s => s.nguoi_dung_id).filter(Boolean),
        userId
      ];
      
      if (!classCreators.includes(activity.nguoi_tao_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn chỉ có thể quản lý hoạt động trong lớp của mình' 
        });
      }
      
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Không có quyền thực hiện thao tác này' 
    });
    
  } catch (error) {
    console.error('Registration permission check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống khi kiểm tra quyền đăng ký' 
    });
  }
}

module.exports = {
  getClassCreators,
  getTeacherClasses,
  getStudentInfo,
  canAccessClassActivities,
  injectClassActivityFilter,
  canRegisterActivity
};
