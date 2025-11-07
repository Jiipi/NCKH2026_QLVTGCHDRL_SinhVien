const { prisma } = require('../config/database');

/**
 * Normalize role name
 */
function normalizeRole(input) {
  if (!input) return '';
  const up = String(input).trim().toUpperCase();
  const noAccent = up.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const map = {
    'ADMIN': 'ADMIN',
    'QUAN TRI VIEN': 'ADMIN',
    'QUAN_TRI_VIEN': 'ADMIN',
    'GIANG VIEN': 'GIANG_VIEN',
    'GIANG_VIEN': 'GIANG_VIEN',
    'SINH VIEN': 'SINH_VIEN',
    'SINH_VIEN': 'SINH_VIEN',
    'LOP TRUONG': 'LOP_TRUONG',
    'LOP_TRUONG': 'LOP_TRUONG'
  };
  return map[up] || map[noAccent] || up;
}

/**
 * Tìm kiếm thông minh dựa trên role
 * Admin: tìm activities, users, classes, faculties
 * Teacher/GVCN: tìm activities, students in their classes
 * Monitor: tìm activities, classmates
 * Student: tìm activities only
 */
async function globalSearch(req, res) {
  try {
  const { q } = req.query;
  const userId = req.user?.id || req.user?.sub || null;
    const userRole = normalizeRole(req.user?.vai_tro?.ten_vt || req.user?.role || '');

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          activities: [],
          students: [],
          classes: [],
          teachers: [],
          faculties: [],
          total: 0
        }
      });
    }

    const searchTerm = q.trim().toLowerCase();
    const results = {
      activities: [],
      students: [],
      classes: [],
      teachers: [],
      faculties: [],
      total: 0
    };

    // 1. TÌM HOẠT ĐỘNG (tất cả roles)
    const activityTextFilter = {
      OR: [
        { ten_hd: { contains: searchTerm, mode: 'insensitive' } },
        { mo_ta: { contains: searchTerm, mode: 'insensitive' } },
        { dia_diem: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };
    const activityWhere = { AND: [activityTextFilter] };

    // Nếu là student/monitor, chỉ hiển thị activities của lớp mình
    let studentRecord = null;
    if ((userRole === 'SINH_VIEN' || userRole === 'LOP_TRUONG') && userId) {
      studentRecord = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { id: true, lop_id: true }
      });
      
      if (studentRecord?.lop_id) {
        // Lấy danh sách người tạo từ lớp
        const classCreators = await prisma.sinhVien.findMany({
          where: { lop_id: studentRecord.lop_id },
          select: { nguoi_dung_id: true }
        });
        
        const teacherClass = await prisma.lop.findUnique({
          where: { id: studentRecord.lop_id },
          select: { chu_nhiem: true }
        });

        const creatorIds = classCreators.map(s => s.nguoi_dung_id);
        if (teacherClass?.chu_nhiem) creatorIds.push(teacherClass.chu_nhiem);

        activityWhere.AND.push({ nguoi_tao_id: { in: creatorIds } });
      }
    }

    // Hỗ trợ "Hoạt động của tôi":
    // - Admin/Giảng viên: hoạt động do mình tạo
    // - Sinh viên/Lớp trưởng: hoạt động mình đã đăng ký
    let myActivitiesWhere = null;
    if (userId) {
      if (userRole === 'ADMIN' || userRole === 'GIANG_VIEN') {
        myActivitiesWhere = { AND: [activityTextFilter, { nguoi_tao_id: userId }] };
      } else if ((userRole === 'SINH_VIEN' || userRole === 'LOP_TRUONG') && studentRecord?.id) {
        myActivitiesWhere = { AND: [activityTextFilter, { dang_ky_hd: { some: { sv_id: studentRecord.id } } }] };
      }
    }

    // Truy vấn hoạt động chung
    const baseActivities = await prisma.hoatDong.findMany({
      where: activityWhere,
      select: {
        id: true,
        ten_hd: true,
        mo_ta: true,
        dia_diem: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        trang_thai: true,
        nguoi_tao: {
          select: {
            ho_ten: true,
            vai_tro: { select: { ten_vt: true } }
          }
        }
      },
      take: 5,
      orderBy: { ngay_tao: 'desc' }
    });

    // Truy vấn "Hoạt động của tôi" (nếu áp dụng)
    let myActivities = [];
    if (myActivitiesWhere) {
      myActivities = await prisma.hoatDong.findMany({
        where: myActivitiesWhere,
        select: {
          id: true,
          ten_hd: true,
          mo_ta: true,
          dia_diem: true,
          ngay_bd: true,
          ngay_kt: true,
          diem_rl: true,
          trang_thai: true,
          nguoi_tao: {
            select: {
              ho_ten: true,
              vai_tro: { select: { ten_vt: true } }
            }
          }
        },
        take: 5,
        orderBy: { ngay_tao: 'desc' }
      });
    }

    // Gộp kết quả: ưu tiên "của tôi" lên trước, tránh trùng ID, giới hạn 8 mục
    const mineSet = new Set(myActivities.map(a => a.id));
    const combinedActivities = [
      ...myActivities.map(a => ({ ...a, isMine: true })),
      ...baseActivities.filter(a => !mineSet.has(a.id)).map(a => ({ ...a, isMine: false }))
    ];
    results.activities = combinedActivities.slice(0, 8);

    // 2. TÌM SINH VIÊN (Admin, Teacher, Monitor)
    if (userRole === 'ADMIN' || userRole === 'GIANG_VIEN' || userRole === 'LOP_TRUONG') {
      const studentWhere = {
        OR: [
          { nguoi_dung: { is: { ho_ten: { contains: searchTerm, mode: 'insensitive' } } } },
          { nguoi_dung: { is: { ten_dn: { contains: searchTerm, mode: 'insensitive' } } } },
          { nguoi_dung: { is: { email: { contains: searchTerm, mode: 'insensitive' } } } },
          { mssv: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      // Teacher/Monitor chỉ thấy sinh viên trong lớp mình
      if (userRole === 'GIANG_VIEN' && userId) {
        const teacherClasses = await prisma.lop.findMany({
          where: { chu_nhiem: userId },
          select: { id: true }
        });
        studentWhere.lop_id = { in: teacherClasses.map(c => c.id) };
      } else if (userRole === 'LOP_TRUONG' && userId) {
        const monitor = await prisma.sinhVien.findUnique({
          where: { nguoi_dung_id: userId },
          select: { lop_id: true }
        });
        if (monitor?.lop_id) {
          studentWhere.lop_id = monitor.lop_id;
        }
      }

      results.students = await prisma.sinhVien.findMany({
        where: studentWhere,
        select: {
          nguoi_dung_id: true,
          mssv: true,
          nguoi_dung: {
            select: {
              ho_ten: true,
              email: true,
              anh_dai_dien: true
            }
          },
          lop: {
            select: {
              ten_lop: true
            }
          }
        },
        take: 5
      });
    }

    // 3. TÌM LỚP HỌC (Admin, Teacher)
    if (userRole === 'ADMIN' || userRole === 'GIANG_VIEN') {
      const classWhere = {
        OR: [
          { ten_lop: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      if (userRole === 'GIANG_VIEN' && userId) {
        classWhere.chu_nhiem = userId;
      }

      results.classes = await prisma.lop.findMany({
        where: classWhere,
        select: {
          id: true,
          ten_lop: true,
            chu_nhiem_rel: { select: { ho_ten: true } }, // relation field name for homeroom teacher in schema is 'chu_nhiem_rel'
            _count: { select: { sinh_viens: true } }
        },
        take: 5
      });
    }

    // 4. TÌM GIẢNG VIÊN (Admin only)
    if (userRole === 'ADMIN') {
      results.teachers = await prisma.nguoiDung.findMany({
        where: {
          AND: [
            {
              OR: [
                { ho_ten: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { ten_dn: { contains: searchTerm, mode: 'insensitive' } }
              ]
            },
            {
                vai_tro: { is: { ten_vt: { in: ['GIANG_VIEN', 'GIẢNG_VIÊN', 'giang_vien'] } } } // relation field name in schema is 'vai_tro'
            }
          ]
        },
        select: {
          id: true,
          ho_ten: true,
          email: true,
          anh_dai_dien: true,
          vai_tro: { select: { ten_vt: true } }
        },
        take: 5
      });
    }

    // Tính tổng số kết quả
    results.total = 
      results.activities.length +
      results.students.length +
      results.classes.length +
      results.teachers.length;

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tìm kiếm',
      error: error.message
    });
  }
}

module.exports = {
  globalSearch
};
