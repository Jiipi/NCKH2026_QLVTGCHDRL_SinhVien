const { normalizeRoleName } = require('../../../../core/utils/roleHelper');

/**
 * GlobalSearchUseCase
 * Use case for global search across activities, students, classes, teachers
 * Follows Single Responsibility Principle (SRP)
 */
class GlobalSearchUseCase {
  constructor(searchRepository) {
    this.searchRepository = searchRepository;
  }

  async execute(query, user) {
    const userId = user?.id || user?.sub || null;
    const userRole = normalizeRoleName(user?.vai_tro?.ten_vt || user?.role || '');

    // Validate query
    if (!query || query.trim().length < 2) {
      return {
        activities: [],
        students: [],
        classes: [],
        teachers: [],
        faculties: [],
        total: 0
      };
    }

    const searchTerm = query.trim().toLowerCase();
    const results = {
      activities: [],
      students: [],
      classes: [],
      teachers: [],
      faculties: [],
      total: 0
    };

    // 1. SEARCH ACTIVITIES (all roles)
    const activityTextFilter = {
      OR: [
        { ten_hd: { contains: searchTerm, mode: 'insensitive' } },
        { mo_ta: { contains: searchTerm, mode: 'insensitive' } },
        { dia_diem: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };
    const activityWhere = { AND: [activityTextFilter] };

    // If student/monitor, only show activities from their class
    let studentRecord = null;
    if ((userRole === 'SINH_VIEN' || userRole === 'LOP_TRUONG') && userId) {
      studentRecord = await this.searchRepository.getStudentByUserId(userId);
      
      if (studentRecord?.lop_id) {
        // Get list of creators from class
        const classCreators = await this.searchRepository.getClassCreators(studentRecord.lop_id);
        const teacherClass = await this.searchRepository.getClassHomeroom(studentRecord.lop_id);

        const creatorIds = classCreators.map(s => s.nguoi_dung_id);
        if (teacherClass?.chu_nhiem) creatorIds.push(teacherClass.chu_nhiem);

        activityWhere.AND.push({ nguoi_tao_id: { in: creatorIds } });
      }
    }

    // Support "My Activities":
    // - Admin/Teacher: activities created by me
    // - Student/Monitor: activities I registered for
    let myActivitiesWhere = null;
    if (userId) {
      if (userRole === 'ADMIN' || userRole === 'GIANG_VIEN') {
        myActivitiesWhere = { AND: [activityTextFilter, { nguoi_tao_id: userId }] };
      } else if ((userRole === 'SINH_VIEN' || userRole === 'LOP_TRUONG') && studentRecord?.id) {
        myActivitiesWhere = { AND: [activityTextFilter, { dang_ky_hd: { some: { sv_id: studentRecord.id } } }] };
      }
    }

    // Query general activities
    const baseActivities = await this.searchRepository.searchActivities(activityWhere, { take: 5 });

    // Query "My Activities" (if applicable)
    let myActivities = [];
    if (myActivitiesWhere) {
      myActivities = await this.searchRepository.searchActivities(myActivitiesWhere, { take: 5 });
    }

    // Merge results: prioritize "mine" first, avoid duplicate IDs, limit to 8 items
    const mineSet = new Set(myActivities.map(a => a.id));
    const combinedActivities = [
      ...myActivities.map(a => ({ ...a, isMine: true })),
      ...baseActivities.filter(a => !mineSet.has(a.id)).map(a => ({ ...a, isMine: false }))
    ];
    results.activities = combinedActivities.slice(0, 8);

    // 2. SEARCH STUDENTS (Admin, Teacher, Monitor)
    if (userRole === 'ADMIN' || userRole === 'GIANG_VIEN' || userRole === 'LOP_TRUONG') {
      const studentWhere = {
        OR: [
          { nguoi_dung: { is: { ho_ten: { contains: searchTerm, mode: 'insensitive' } } } },
          { nguoi_dung: { is: { ten_dn: { contains: searchTerm, mode: 'insensitive' } } } },
          { nguoi_dung: { is: { email: { contains: searchTerm, mode: 'insensitive' } } } },
          { mssv: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      // Teacher/Monitor only see students in their class
      if (userRole === 'GIANG_VIEN' && userId) {
        const teacherClasses = await this.searchRepository.getTeacherClasses(userId);
        studentWhere.lop_id = { in: teacherClasses.map(c => c.id) };
      } else if (userRole === 'LOP_TRUONG' && userId) {
        const monitor = await this.searchRepository.getStudentByUserId(userId);
        if (monitor?.lop_id) {
          studentWhere.lop_id = monitor.lop_id;
        }
      }

      results.students = await this.searchRepository.searchStudents(studentWhere, { take: 5 });
    }

    // 3. SEARCH CLASSES (Admin, Teacher)
    if (userRole === 'ADMIN' || userRole === 'GIANG_VIEN') {
      const classWhere = {
        OR: [
          { ten_lop: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      if (userRole === 'GIANG_VIEN' && userId) {
        classWhere.chu_nhiem = userId;
      }

      results.classes = await this.searchRepository.searchClasses(classWhere, { take: 5 });
    }

    // 4. SEARCH TEACHERS (Admin only)
    if (userRole === 'ADMIN') {
      const teacherWhere = {
        AND: [
          {
            OR: [
              { ho_ten: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { ten_dn: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          {
            vai_tro: { is: { ten_vt: { in: ['GIANG_VIEN', 'GIẢNG_VIÊN', 'giang_vien'] } } }
          }
        ]
      };

      results.teachers = await this.searchRepository.searchTeachers(teacherWhere, { take: 5 });
    }

    // Calculate total results
    results.total = 
      results.activities.length +
      results.students.length +
      results.classes.length +
      results.teachers.length;

    return results;
  }
}

module.exports = GlobalSearchUseCase;

