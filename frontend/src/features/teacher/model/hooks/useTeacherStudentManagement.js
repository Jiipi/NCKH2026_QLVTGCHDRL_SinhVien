/**
 * useTeacherStudentManagement Hook
 * =================================
 * Tier 2 - Business Logic Layer (SOLID: Single Responsibility)
 * 
 * Responsibilities:
 * - State management for student management page
 * - Business logic for CRUD operations
 * - Data transformations and validations
 * - Error handling and loading states
 * 
 * @module features/teacher/model/hooks/useTeacherStudentManagement
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../contexts/NotificationContext';
import { teacherStudentsApi, teacherClassesApi } from '../../services/teacherStudentsApi';

/**
 * Initial form state for add/edit student
 */
const INITIAL_FORM_STATE = {
  ho_ten: '',
  email: '',
  mssv: '',
  ngay_sinh: '',
  gt: 'nam',
  lop_id: '',
  dia_chi: '',
  sdt: '',
  ten_dn: '',
  mat_khau: ''
};

/**
 * Initial class statistics state
 */
const INITIAL_STATS = {
  totalStudents: 0,
  totalActivities: 0,
  totalParticipants: 0,
  participationRate: 0,
  averageScore: 0
};

/**
 * Normalize student data for UI consumption
 * @param {Object} student - Raw student data from API
 * @returns {Object} Normalized student object
 */
const normalizeStudent = (student) => {
  const user = student.nguoi_dung || {};
  const sv = student.sinh_vien || student;
  
  return {
    ...student,
    id: user.id || student.id,
    ho_ten: user.ho_ten || student.ho_ten,
    email: user.email || student.email,
    anh_dai_dien: user.anh_dai_dien || student.anh_dai_dien || student.avatar || student.profile_image || student.image,
    sinh_vien: {
      ...(sv && typeof sv === 'object' ? sv : {}),
      mssv: sv.mssv || student.mssv,
      sdt: sv.sdt || student.sdt,
      lop: {
        ...(sv?.lop || student.lop || {}),
        ten_lop: (sv?.lop?.ten_lop) || (student.lop?.ten_lop) || ''
      }
    }
  };
};

/**
 * Normalize class data
 * @param {Object} cls - Raw class data
 * @returns {Object} Normalized class object
 */
const normalizeClass = (cls) => ({
  ...cls,
  so_sinh_vien: cls.so_sinh_vien ?? cls._count?.sinh_viens ?? 0
});

/**
 * Validate add student form
 * @param {Object} formData - Form data to validate
 * @returns {string[]} Array of validation error messages
 */
const validateAddForm = (formData) => {
  const messages = [];
  const f = formData;

  // Required fields
  if (!f.ho_ten?.trim()) messages.push('Họ và tên là bắt buộc');
  if (!f.mssv?.trim()) messages.push('MSSV là bắt buộc');
  if (!f.email?.trim()) messages.push('Email là bắt buộc');
  if (!f.ten_dn?.trim()) messages.push('Tên đăng nhập là bắt buộc');
  if (!f.mat_khau?.trim()) messages.push('Mật khẩu là bắt buộc');
  if (!f.lop_id) messages.push('Lớp là bắt buộc');

  // Length constraints
  if (f.mssv && String(f.mssv).trim().length > 10) messages.push('MSSV tối đa 10 ký tự');
  if (f.email && String(f.email).trim().length > 100) messages.push('Email tối đa 100 ký tự');
  if (f.ho_ten && String(f.ho_ten).trim().length > 50) messages.push('Họ tên tối đa 50 ký tự');
  if (f.ten_dn && String(f.ten_dn).trim().length > 50) messages.push('Tên đăng nhập tối đa 50 ký tự');

  // Phone: digits only <= 10
  if (f.sdt) {
    const digits = String(f.sdt).replace(/\D/g, '');
    if (digits.length > 10) messages.push('Số điện thoại tối đa 10 chữ số');
  }

  // Date format
  if (f.ngay_sinh) {
    const d = new Date(f.ngay_sinh);
    if (isNaN(d.getTime())) messages.push('Ngày sinh không hợp lệ (YYYY-MM-DD)');
  }

  return messages;
};

/**
 * Extract backend validation errors
 * @param {Error} err - Error object from API
 * @param {string} fallback - Fallback message
 * @returns {string} Error message
 */
const extractApiErrors = (err, fallback = 'Có lỗi xảy ra') => {
  try {
    const data = err?.response?.data;
    const errors = Array.isArray(data?.errors) ? data.errors : [];
    const messages = errors.map(e => e?.message).filter(Boolean);
    return messages.length > 0 ? messages.join('\n') : (data?.message || fallback);
  } catch (_) {
    return fallback;
  }
};

/**
 * Custom hook for teacher student management
 * @returns {Object} Hook state and actions
 */
export function useTeacherStudentManagement() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  // Data states
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classStatistics, setClassStatistics] = useState(INITIAL_STATS);
  
  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  
  // View states
  const [viewMode, setViewMode] = useState('list'); // 'grid' | 'list'
  
  // Selection states
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Pagination
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  // Monitor assignment
  const [selectedMonitorId, setSelectedMonitorId] = useState('');
  const [assigningMonitor, setAssigningMonitor] = useState(false);
  
  // Modal states
  const [modals, setModals] = useState({
    view: false,
    edit: false,
    add: false
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // ============= DATA LOADING =============

  /**
   * Load students and classes data
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedClass) {
        params.classFilter = selectedClass;
        params.classId = selectedClass;
      }

      const [studentsResponse, classesResponse] = await Promise.all([
        teacherStudentsApi.getStudents(params),
        teacherClassesApi.getClasses()
      ]);

      // Process students
      const rawStudents = studentsResponse?.data ?? studentsResponse ?? [];
      const studentsData = Array.isArray(rawStudents)
        ? rawStudents
        : (Array.isArray(rawStudents?.students) ? rawStudents.students : []);
      
      const normalizedStudents = studentsData.map(normalizeStudent);

      // Process classes
      const rawClasses = classesResponse?.data ?? classesResponse ?? [];
      const classesData = Array.isArray(rawClasses)
        ? rawClasses
        : (Array.isArray(rawClasses?.classes) ? rawClasses.classes : []);
      
      const normalizedClasses = classesData.map(normalizeClass);

      setStudents(normalizedStudents);
      setClasses(normalizedClasses);
      
      // Update pagination
      setPagination(prev => {
        const nextTotal = normalizedStudents.length;
        const maxPage = Math.max(1, Math.ceil(Math.max(nextTotal, 1) / prev.limit));
        return { ...prev, total: nextTotal, page: Math.min(prev.page, maxPage) };
      });

      // Auto-select first class if none selected
      if (!selectedClass && classesData.length > 0) {
        setSelectedClass(classesData[0].id);
        return;
      }

      setError('');

      // Load class statistics if class selected
      if (selectedClass) {
        await loadClassStatistics(selectedClass);
        
        const currentClass = classesData.find(c => c.id === selectedClass);
        if (currentClass?.lop_truong) {
          setSelectedMonitorId(currentClass.lop_truong);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Không thể tải dữ liệu sinh viên');
      showError('Lỗi khi tải dữ liệu sinh viên');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedClass, showError]);

  /**
   * Load class statistics
   */
  const loadClassStatistics = useCallback(async (classId) => {
    try {
      const response = await teacherClassesApi.getClassStatistics(classId);
      const stats = response?.data || {};
      setClassStatistics({
        totalStudents: stats.totalStudents || 0,
        totalActivities: stats.totalActivities || 0,
        totalParticipants: stats.totalParticipants || 0,
        participationRate: stats.participationRate || 0,
        averageScore: stats.averageScore || 0
      });
    } catch (err) {
      console.error('Load statistics error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Reload on filter changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadData();
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedClass]);

  // ============= CRUD OPERATIONS =============

  /**
   * Add new student
   */
  const handleAddStudent = useCallback(async () => {
    const validationMessages = validateAddForm(formData);
    if (validationMessages.length > 0) {
      showError(validationMessages.join('\n'));
      return false;
    }

    try {
      const payload = { ...formData };
      if (payload.sdt) payload.sdt = String(payload.sdt).replace(/\D/g, '');

      await teacherStudentsApi.addStudent(payload);
      showSuccess('Thêm sinh viên thành công');
      setModals(prev => ({ ...prev, add: false }));
      loadData();
      return true;
    } catch (err) {
      console.error('Add error:', err);
      showError(extractApiErrors(err, 'Không thể thêm sinh viên'));
      return false;
    }
  }, [formData, showSuccess, showError, loadData]);

  /**
   * Update student
   */
  const handleUpdateStudent = useCallback(async () => {
    if (!selectedStudent) return false;

    try {
      await teacherStudentsApi.updateStudent(selectedStudent.id, formData);
      showSuccess('Cập nhật thông tin sinh viên thành công');
      setModals(prev => ({ ...prev, edit: false }));
      loadData();
      return true;
    } catch (err) {
      console.error('Update error:', err);
      showError(err.response?.data?.message || 'Không thể cập nhật sinh viên');
      return false;
    }
  }, [selectedStudent, formData, showSuccess, showError, loadData]);

  /**
   * Delete student
   */
  const handleDeleteStudent = useCallback(async (studentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return false;

    try {
      await teacherStudentsApi.deleteStudent(studentId);
      showSuccess('Xóa sinh viên thành công');
      loadData();
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      showError(err.response?.data?.message || 'Không thể xóa sinh viên');
      return false;
    }
  }, [showSuccess, showError, loadData]);

  /**
   * Bulk delete students
   */
  const handleBulkDelete = useCallback(async () => {
    if (selectedStudents.length === 0) return false;
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedStudents.length} sinh viên?`)) return false;

    try {
      await teacherStudentsApi.deleteStudents(selectedStudents);
      showSuccess(`Đã xóa ${selectedStudents.length} sinh viên`);
      setSelectedStudents([]);
      loadData();
      return true;
    } catch (err) {
      showError('Không thể xóa một số sinh viên');
      return false;
    }
  }, [selectedStudents, showSuccess, showError, loadData]);

  /**
   * Assign class monitor
   */
  const handleAssignMonitor = useCallback(async () => {
    if (!selectedMonitorId) {
      showWarning('Vui lòng chọn sinh viên làm lớp trưởng');
      return false;
    }
    if (!selectedClass) {
      showWarning('Vui lòng chọn một lớp');
      return false;
    }

    setAssigningMonitor(true);
    try {
      await teacherClassesApi.assignMonitor(selectedClass, selectedMonitorId);
      showSuccess('Gán lớp trưởng thành công');
      await loadData();
      return true;
    } catch (err) {
      console.error('Assign monitor error:', err);
      showError(err.response?.data?.message || 'Không thể gán lớp trưởng');
      return false;
    } finally {
      setAssigningMonitor(false);
    }
  }, [selectedMonitorId, selectedClass, showSuccess, showError, showWarning, loadData]);

  /**
   * Export students
   */
  const handleExport = useCallback(async (format = 'xlsx') => {
    try {
      const blob = await teacherStudentsApi.exportStudents({
        format,
        search: searchTerm,
        classFilter: selectedClass !== 'all' ? selectedClass : undefined,
        classId: selectedClass !== 'all' ? selectedClass : undefined
      });

      const mimeType = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;';
      
      const fileBlob = new Blob([blob], { type: mimeType });
      const link = document.createElement('a');
      const href = window.URL.createObjectURL(fileBlob);
      link.href = href;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `danh_sach_sinh_vien_${dateStr}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
      
      return true;
    } catch (err) {
      console.error('Export error:', err);
      showError(err.response?.data?.message || 'Không thể xuất danh sách');
      return false;
    }
  }, [searchTerm, selectedClass, showError]);

  // ============= MODAL HANDLERS =============

  /**
   * Open view modal
   */
  const openViewModal = useCallback((student) => {
    setSelectedStudent(student);
    setActiveTab('basic');
    setModals(prev => ({ ...prev, view: true }));
  }, []);

  /**
   * Open edit modal
   */
  const openEditModal = useCallback((student) => {
    setSelectedStudent(student);
    setFormData({
      ho_ten: student.ho_ten || '',
      email: student.email || '',
      mssv: student.sinh_vien?.mssv || '',
      ngay_sinh: student.sinh_vien?.ngay_sinh 
        ? new Date(student.sinh_vien.ngay_sinh).toISOString().split('T')[0] 
        : '',
      gt: student.sinh_vien?.gt || 'nam',
      lop_id: student.sinh_vien?.lop_id || '',
      dia_chi: student.sinh_vien?.dia_chi || '',
      sdt: student.sinh_vien?.sdt || '',
    });
    setModals(prev => ({ ...prev, edit: true }));
  }, []);

  /**
   * Open add modal
   */
  const openAddModal = useCallback(() => {
    setFormData({
      ...INITIAL_FORM_STATE,
      lop_id: classes[0]?.id || ''
    });
    setModals(prev => ({ ...prev, add: true }));
  }, [classes]);

  /**
   * Close all modals
   */
  const closeModals = useCallback(() => {
    setModals({ view: false, edit: false, add: false });
    setSelectedStudent(null);
  }, []);

  /**
   * Close specific modal
   */
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === 'view' || modalName === 'edit') {
      setSelectedStudent(null);
    }
  }, []);

  // ============= SELECTION HANDLERS =============

  /**
   * Toggle student selection
   */
  const toggleStudentSelection = useCallback((studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  }, []);

  /**
   * Toggle select all visible students
   */
  const toggleSelectAll = useCallback((paginatedStudents) => {
    const allIds = paginatedStudents.map(s => s.id);
    const allSelected = allIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allIds);
    }
  }, [selectedStudents]);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedStudents([]);
  }, []);

  // ============= PAGINATION =============

  // Pagination computed values
  const { page, limit, total } = pagination;
  const filteredStudents = useMemo(() => students, [students]);
  const startIndex = (page - 1) * limit;
  
  const paginatedStudents = useMemo(
    () => filteredStudents.slice(startIndex, startIndex + limit),
    [filteredStudents, startIndex, limit]
  );
  
  const displayFrom = filteredStudents.length ? Math.min(startIndex + 1, filteredStudents.length) : 0;
  const displayTo = Math.min(startIndex + paginatedStudents.length, filteredStudents.length);

  /**
   * Change page
   */
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Change page limit
   */
  const handleLimitChange = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // ============= NAVIGATION =============

  /**
   * Navigate to import page
   */
  const goToImport = useCallback(() => {
    navigate(`/teacher/students/import?classId=${selectedClass || ''}`);
  }, [navigate, selectedClass]);

  // ============= RETURN =============

  return {
    // Data
    students,
    classes,
    classStatistics,
    paginatedStudents,
    filteredStudents,
    
    // Loading & Error
    loading,
    error,
    
    // Filters
    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    
    // View
    viewMode,
    setViewMode,
    
    // Selection
    selectedStudents,
    toggleStudentSelection,
    toggleSelectAll,
    clearSelection,
    
    // Pagination
    pagination: { ...pagination, total: filteredStudents.length },
    displayFrom,
    displayTo,
    handlePageChange,
    handleLimitChange,
    
    // Monitor
    selectedMonitorId,
    setSelectedMonitorId,
    assigningMonitor,
    handleAssignMonitor,
    
    // Modals
    modals,
    selectedStudent,
    activeTab,
    setActiveTab,
    openViewModal,
    openEditModal,
    openAddModal,
    closeModals,
    closeModal,
    
    // Form
    formData,
    setFormData,
    
    // Actions
    loadData,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleBulkDelete,
    handleExport,
    goToImport,
  };
}

export default useTeacherStudentManagement;
