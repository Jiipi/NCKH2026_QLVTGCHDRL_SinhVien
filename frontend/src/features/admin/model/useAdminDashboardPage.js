/**
 * Admin Dashboard Page Hook (Tier 2: Business Logic Layer)
 * =========================================================
 * Single Responsibility: Dashboard page state and logic
 * 
 * @module features/admin/model/useAdminDashboardPage
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import http from '../../../shared/api/http';
import API_ENDPOINTS from '../../../shared/api/endpoints';
import useAdminDashboard from './useAdminDashboard';

export default function useAdminDashboardPage() {
  const { stats, loading: statsLoading } = useAdminDashboard();
  
  const [activeTab, setActiveTab] = useState('recent');
  
  // States for classes
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingClassDetail, setLoadingClassDetail] = useState(false);
  const [classDetailError, setClassDetailError] = useState(null);
  
  // States for semesters
  const [semesters, setSemesters] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  
  // States for registrations
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // States for teachers
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherDetail, setShowTeacherDetail] = useState(false);
  const [loadingTeacherDetail, setLoadingTeacherDetail] = useState(false);
  const [teacherDetailError, setTeacherDetailError] = useState(null);

  // Sidebar tab
  const [sidebarTab, setSidebarTab] = useState('classes');

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const response = await http.get('/semesters/classes');
      const data = response.data;
      const payload = data?.data || data;
      const classList = Array.isArray(payload)
        ? payload
        : (payload?.items || payload?.classes || payload?.rows || []);
      setClasses(Array.isArray(classList) ? classList : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const response = await http.get('/core/users?role=GIANG_VIEN&limit=10');
      const data = response.data;
      const payload = data?.data || data;
      const list = Array.isArray(payload) ? payload : (payload?.items || payload?.data || payload?.users || payload?.rows || []);
      setTeachers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Fetch semesters
  const fetchSemesters = useCallback(async () => {
    setLoadingSemesters(true);
    try {
      const response = await http.get('/semesters/list');
      const data = response.data;
      const payload = data?.data || data;
      const semesterList = Array.isArray(payload) ? payload : (payload?.items || payload?.semesters || payload?.rows || []);
      setSemesters(Array.isArray(semesterList) ? semesterList : []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    } finally {
      setLoadingSemesters(false);
    }
  }, []);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    setLoadingRegistrations(true);
    try {
      const statusFilter = activeTab === 'recent' ? '' : 'status=cho_duyet&';
      const response = await http.get(`${API_ENDPOINTS.registrations.list}?${statusFilter}limit=100`);
      const data = response.data;
      const payload = data?.data || data;
      const registrationsList = payload?.items || (Array.isArray(payload) ? payload : []);
      setRegistrations(Array.isArray(registrationsList) ? registrationsList : []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  }, [activeTab]);

  // Initial fetch
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, [fetchClasses, fetchTeachers]);

  // Fetch semesters when tab changes
  useEffect(() => {
    if (activeTab === 'semesters') {
      fetchSemesters();
    }
  }, [activeTab, fetchSemesters]);

  // Fetch registrations when tab changes
  useEffect(() => {
    if (activeTab === 'approvals' || activeTab === 'recent') {
      fetchRegistrations();
    }
  }, [activeTab, fetchRegistrations]);

  // Helper functions
  const extractClassId = (classItem) => (
    classItem?.id ||
    classItem?.class_id ||
    classItem?.classId ||
    classItem?.ma_lop ||
    classItem?.value ||
    classItem?.code
  );

  const normalizeStudents = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (raw?.items) return raw.items;
    if (raw?.data) return raw.data;
    if (raw?.students) return raw.students;
    if (raw?._count?.students && Array.isArray(raw?.students?.items)) return raw.students.items;
    return [];
  };

  // Handle class detail
  const handleClassDetail = useCallback(async (classItem) => {
    const classId = extractClassId(classItem);
    let hasStudents = Array.isArray(classItem?.students) && classItem.students.length > 0;

    setSelectedClass(prev => ({
      ...classItem,
      id: classId || classItem?.id
    }));
    setClassStudents(Array.isArray(classItem?.students) ? classItem.students : []);
    setClassDetailError(null);
    setShowClassDetail(true);

    if (!classId) {
      setClassDetailError('Không xác định được mã lớp để tải chi tiết.');
      return;
    }

    setLoadingClassDetail(true);
    try {
      const detailEndpoint = API_ENDPOINTS.classes.detail(classId);
      const studentsEndpoint = API_ENDPOINTS.classes.students(classId);
      const [detailRes, studentsRes] = await Promise.allSettled([
        http.get(detailEndpoint),
        http.get(studentsEndpoint)
      ]);

      if (detailRes.status === 'fulfilled') {
        const detailPayload = detailRes.value.data?.data || detailRes.value.data;
        setSelectedClass(prev => ({
          ...prev,
          ...detailPayload,
          id: classId
        }));
        const embeddedStudents = normalizeStudents(
          detailPayload?.students ||
          detailPayload?.danh_sach_sinh_vien ||
          detailPayload?.sinhVien
        );
        if (embeddedStudents.length > 0) {
          setClassStudents(embeddedStudents);
          hasStudents = true;
        }
      }

      if (studentsRes.status === 'fulfilled') {
        const studentPayload = studentsRes.value.data?.data || studentsRes.value.data;
        const studentsList = normalizeStudents(studentPayload);
        if (studentsList.length > 0) {
          setClassStudents(studentsList);
          hasStudents = true;
        }
      }

      if (
        (detailRes.status === 'rejected' && studentsRes.status === 'rejected') ||
        !hasStudents
      ) {
        setClassDetailError('Không thể tải danh sách sinh viên. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error loading class detail:', error);
      setClassDetailError('Có lỗi xảy ra khi tải chi tiết lớp.');
    } finally {
      setLoadingClassDetail(false);
    }
  }, []);

  // Handle teacher detail
  const handleTeacherDetail = useCallback(async (teacherItem) => {
    const teacherId = teacherItem?.id || teacherItem?.user_id || teacherItem?.nguoi_dung_id;
    setSelectedTeacher(prev => ({
      ...teacherItem,
      id: teacherId || teacherItem?.id
    }));
    setTeacherDetailError(null);
    setShowTeacherDetail(true);

    if (!teacherId) {
      setTeacherDetailError('Không xác định được mã giảng viên.');
      return;
    }

    setLoadingTeacherDetail(true);
    try {
      const response = await http.get(API_ENDPOINTS.users.detail(teacherId));
      const payload = response.data?.data || response.data;
      if (payload) {
        setSelectedTeacher(prev => ({
          ...prev,
          ...payload
        }));
      } else {
        setTeacherDetailError('Không tìm thấy dữ liệu chi tiết.');
      }
    } catch (error) {
      console.error('Error loading teacher detail:', error);
      setTeacherDetailError(error?.response?.data?.message || 'Có lỗi xảy ra khi tải chi tiết giảng viên.');
    } finally {
      setLoadingTeacherDetail(false);
    }
  }, []);

  // Handle approve registration
  const handleApproveRegistration = useCallback(async (registrationId) => {
    setProcessingId(registrationId);
    try {
      await http.put(API_ENDPOINTS.registrations.approve(registrationId));
      await fetchRegistrations();
      return { success: true, message: 'Đã phê duyệt đăng ký thành công!' };
    } catch (error) {
      console.error('Error approving registration:', error);
      return { success: false, message: 'Có lỗi xảy ra khi phê duyệt đăng ký!' };
    } finally {
      setProcessingId(null);
    }
  }, [fetchRegistrations]);

  // Handle reject registration
  const handleRejectRegistration = useCallback(async (registrationId) => {
    setProcessingId(registrationId);
    try {
      await http.put(API_ENDPOINTS.registrations.reject(registrationId));
      await fetchRegistrations();
      return { success: true, message: 'Đã từ chối đăng ký thành công!' };
    } catch (error) {
      console.error('Error rejecting registration:', error);
      return { success: false, message: 'Có lỗi xảy ra khi từ chối đăng ký!' };
    } finally {
      setProcessingId(null);
    }
  }, [fetchRegistrations]);

  // Close modals
  const closeClassDetail = useCallback(() => {
    setShowClassDetail(false);
    setSelectedClass(null);
    setClassStudents([]);
    setClassDetailError(null);
  }, []);

  const closeTeacherDetail = useCallback(() => {
    setShowTeacherDetail(false);
    setSelectedTeacher(null);
    setTeacherDetailError(null);
  }, []);

  // Admin action feed
  const adminActionFeed = useMemo(() => {
    const timeline = [];

    if (Array.isArray(registrations) && registrations.length > 0) {
      registrations.slice(0, 5).forEach((reg, idx) => {
        const status = (reg.trang_thai_dk || reg.status || '').toString().toLowerCase();
        const isPending = status === 'cho_duyet' || status === 'pending' || status === 'pending_approval';
        const statusLabel = status === 'da_duyet' ? 'Đã phê duyệt'
          : status === 'da_tham_gia' ? 'Đã tham gia'
          : status === 'tu_choi' ? 'Từ chối'
          : 'Chờ xử lý';

        timeline.push({
          key: `registration-${reg.id || idx}`,
          type: 'approval',
          title: `${reg.hoat_dong?.ten_hd || 'Hoạt động'} - ${reg.sinh_vien?.nguoi_dung?.ho_ten || 'Sinh viên'}`,
          description: isPending
            ? 'Đăng ký cần bạn phê duyệt'
            : `Bạn đã ${status === 'tu_choi' ? 'từ chối' : 'xử lý'} đăng ký này`,
          timestamp: reg.ngay_dang_ky,
          statusLabel,
          actionLabel: 'Xử lý ngay',
          actionPath: '/admin/approvals'
        });
      });
    }

    if (Array.isArray(classes) && classes.length > 0) {
      classes.slice(0, 2).forEach((classItem, idx) => {
        timeline.push({
          key: `class-${classItem.id || idx}`,
          type: 'update',
          title: `Cập nhật lớp ${classItem.name || classItem.ten_lop || 'Chưa đặt tên'}`,
          description: classItem.teacher
            ? `Điều chỉnh giảng viên: ${classItem.teacher.name || classItem.teacher.full_name}`
            : 'Điều chỉnh thông tin lớp và sinh viên',
          timestamp: classItem.updated_at || classItem.updatedAt || classItem.created_at || classItem.createdAt,
          statusLabel: 'Cập nhật lớp',
          actionLabel: 'Xem lớp',
          actionPath: `/admin/classes/${classItem.id || ''}`
        });
      });
    }

    if (Array.isArray(teachers) && teachers.length > 0) {
      teachers.slice(0, 2).forEach((teacher, idx) => {
        timeline.push({
          key: `teacher-${teacher.id || idx}`,
          type: 'account',
          title: `Quản lý tài khoản ${teacher.ho_ten || teacher.full_name || teacher.name || 'Giảng viên'}`,
          description: teacher.email ? `Email: ${teacher.email}` : 'Cập nhật thông tin tài khoản giảng viên',
          timestamp: teacher.updated_at || teacher.created_at,
          statusLabel: 'Tài khoản GV',
          actionLabel: 'Quản lý',
          actionPath: `/admin/users/${teacher.id || teacher.user_id || ''}`
        });
      });
    }

    if (timeline.length === 0) {
      timeline.push(
        {
          key: 'default-create-activity',
          type: 'create',
          title: 'Tạo hoạt động mới',
          description: 'Khởi tạo hoạt động và chia sẻ cho sinh viên.',
          timestamp: new Date().toISOString(),
          statusLabel: 'Tạo hoạt động',
          actionLabel: 'Quản lý hoạt động',
          actionPath: '/admin/activities'
        },
        {
          key: 'default-manage-roles',
          type: 'account',
          title: 'Phân quyền tài khoản',
          description: 'Thiết lập role cho giảng viên hoặc cán bộ.',
          timestamp: new Date().toISOString(),
          statusLabel: 'Quản lý role',
          actionLabel: 'Thiết lập role',
          actionPath: '/admin/roles'
        }
      );
    }

    return timeline.slice(0, 8);
  }, [registrations, classes, teachers]);

  // Pending registrations count
  const pendingRegistrationsCount = useMemo(() => {
    if (!Array.isArray(registrations)) return 0;
    return registrations.filter(r => {
      const s = (r.status || r.trang_thai_dk || '').toString().toLowerCase();
      return s === 'pending' || s === 'cho_duyet' || s === 'chờ duyệt' || s === 'pending_approval';
    }).length;
  }, [registrations]);

  // Pending registrations list
  const pendingRegistrations = useMemo(() => {
    if (!Array.isArray(registrations)) return [];
    return registrations.filter(r => {
      const s = (r.status || r.trang_thai_dk || '').toString().toLowerCase();
      return s === 'pending' || s === 'cho_duyet' || s === 'chờ duyệt' || s === 'pending_approval';
    });
  }, [registrations]);

  return {
    // Stats
    stats,
    loading: statsLoading,

    // Tab state
    activeTab,
    setActiveTab,
    sidebarTab,
    setSidebarTab,

    // Classes
    classes,
    loadingClasses,
    selectedClass,
    showClassDetail,
    classStudents,
    loadingClassDetail,
    classDetailError,
    handleClassDetail,
    closeClassDetail,

    // Semesters
    semesters,
    loadingSemesters,

    // Registrations
    registrations,
    loadingRegistrations,
    processingId,
    pendingRegistrationsCount,
    pendingRegistrations,
    handleApproveRegistration,
    handleRejectRegistration,

    // Teachers
    teachers,
    loadingTeachers,
    selectedTeacher,
    showTeacherDetail,
    loadingTeacherDetail,
    teacherDetailError,
    handleTeacherDetail,
    closeTeacherDetail,

    // Action feed
    adminActionFeed
  };
}

