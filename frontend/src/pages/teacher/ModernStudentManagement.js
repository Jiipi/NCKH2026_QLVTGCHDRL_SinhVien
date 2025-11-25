import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Download,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  X,
  Calendar,
  BookOpen,
  User,
  Home,
  Save,
  ChevronRight,
  UserCheck,
  TrendingUp,
  Award,
  Grid3X3,
  List,
  CheckCircle,
  UserX,
  RefreshCw
} from 'lucide-react';
import http from '../../shared/api/http';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { getStudentAvatar, getAvatarGradient } from '../../shared/lib/avatarUtils';
import Pagination from '../../shared/components/common/Pagination';

export default function ModernStudentManagement() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  
  // View mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('list');
  
  // Multi-select for bulk actions
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Pagination states
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  // Class management states
  const [classStatistics, setClassStatistics] = useState({
    totalStudents: 0,
    totalActivities: 0,
    totalParticipants: 0,
    participationRate: 0,
    averageScore: 0
  });
  const [selectedMonitorId, setSelectedMonitorId] = useState('');
  const [assigningMonitor, setAssigningMonitor] = useState(false);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    loadData();
  }, []);

  // Reload when filters change (debounced) and reset page
  useEffect(() => {
    const t = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadData();
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedClass]);
  const { page, limit, total } = pagination;

  // Helper: collect and show backend validation errors (400) nicely
  const showValidationErrors = (err, fallback = 'Có lỗi xảy ra') => {
    try {
      const data = err?.response?.data;
      const errors = Array.isArray(data?.errors) ? data.errors : [];
      const messages = errors.map(e => e?.message).filter(Boolean);
      const message = messages.length > 0 ? messages.join('\n') : (data?.message || fallback);
      showError(message);
    } catch (_) {
      showError(fallback);
    }
  };

  // Helper: basic client-side validation mirroring backend constraints
  const validateAddForm = () => {
    const msgs = [];
    const f = formData;
    // Required
    if (!f.ho_ten?.trim()) msgs.push('Họ và tên là bắt buộc');
    if (!f.mssv?.trim()) msgs.push('MSSV là bắt buộc');
    if (!f.email?.trim()) msgs.push('Email là bắt buộc');
    if (!f.ten_dn?.trim()) msgs.push('Tên đăng nhập là bắt buộc');
    if (!f.mat_khau?.trim()) msgs.push('Mật khẩu là bắt buộc');
    if (!f.lop_id) msgs.push('Lớp là bắt buộc');

    // Length constraints
    if (f.mssv && String(f.mssv).trim().length > 10) msgs.push('MSSV tối đa 10 ký tự');
    if (f.email && String(f.email).trim().length > 100) msgs.push('Email tối đa 100 ký tự');
    if (f.ho_ten && String(f.ho_ten).trim().length > 50) msgs.push('Họ tên tối đa 50 ký tự');
    if (f.ten_dn && String(f.ten_dn).trim().length > 50) msgs.push('Tên đăng nhập tối đa 50 ký tự');

    // Phone: digits only <= 10
    if (f.sdt) {
      const digits = String(f.sdt).replace(/\D/g, '');
      if (digits.length > 10) msgs.push('Số điện thoại tối đa 10 chữ số');
    }

    // Date format
    if (f.ngay_sinh) {
      const d = new Date(f.ngay_sinh);
      if (isNaN(d.getTime())) msgs.push('Ngày sinh không hợp lệ (YYYY-MM-DD)');
    }

    return msgs;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedClass) { params.classFilter = selectedClass; params.classId = selectedClass; }

      const [studentsRes, classesRes] = await Promise.all([
        http.get('/teacher/students', { params }),
        http.get('/teacher/classes')
      ]);
      
      const rawStudents = studentsRes.data?.data ?? studentsRes.data ?? [];
      const studentsData = Array.isArray(rawStudents)
        ? rawStudents
        : (Array.isArray(rawStudents?.students) ? rawStudents.students : []);
      const rawClasses = classesRes.data?.data ?? classesRes.data ?? [];
      const classesData = Array.isArray(rawClasses)
        ? rawClasses
        : (Array.isArray(rawClasses?.classes) ? rawClasses.classes : []);
      
      // Normalize student data to ensure anh_dai_dien is properly mapped
      const normalizedStudents = (Array.isArray(studentsData) ? studentsData : []).map(s => {
        const user = s.nguoi_dung || {};
        const sv = s.sinh_vien || s; // repo returns SinhVien at root
        return {
          // Keep original fields for safety
          ...s,
          // Flatten for UI consumption
          id: user.id || s.id,
          ho_ten: user.ho_ten || s.ho_ten,
          email: user.email || s.email,
          anh_dai_dien: user.anh_dai_dien || s.anh_dai_dien || s.avatar || s.profile_image || s.image,
          sinh_vien: {
            ...(sv && typeof sv === 'object' ? sv : {}),
            mssv: sv.mssv || s.mssv,
            sdt: sv.sdt || s.sdt,
            lop: {
              ...(sv?.lop || s.lop || {}),
              ten_lop: (sv?.lop?.ten_lop) || (s.lop?.ten_lop) || ''
            }
          }
        };
      });
      
      setStudents(normalizedStudents);
      setPagination(prev => {
        const nextTotal = normalizedStudents.length;
        const maxPage = Math.max(1, Math.ceil(Math.max(nextTotal, 1) / prev.limit));
        return { ...prev, total: nextTotal, page: Math.min(prev.page, maxPage) };
      });
      const normalizedClasses = (Array.isArray(classesData) ? classesData : []).map(c => ({
        ...c,
        so_sinh_vien: c.so_sinh_vien ?? c._count?.sinh_viens ?? 0
      }));
      setClasses(normalizedClasses);
      
      // Auto-select first class if none selected
      if (!selectedClass && classesData.length > 0) {
        setSelectedClass(classesData[0].id);
        return; // Will reload with selected class
      }
      
      setError('');
      
      // Load class statistics if a specific class is selected
      if (selectedClass) {
        loadClassStatistics(selectedClass);
        
        // Sync monitor selection
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
  };
  
  const loadClassStatistics = async (classId) => {
    try {
      // Backend provides ID-based alias at /teachers/classes/:id/statistics via interceptor
      const response = await http.get(`/teacher/classes/${classId}/statistics`);
      const stats = response.data?.data || {};
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
  };
  
  const handleAssignMonitor = async () => {
    if (!selectedMonitorId) {
      showWarning('Vui lòng chọn sinh viên làm lớp trưởng');
      return;
    }
    if (!selectedClass) {
      showWarning('Vui lòng chọn một lớp');
      return;
    }

    setAssigningMonitor(true);
    try {
      await http.patch(`/teacher/classes/${selectedClass}/monitor`, {
        sinh_vien_id: selectedMonitorId
      });
      showSuccess('Gán lớp trưởng thành công');
      await loadData();
    } catch (err) {
      console.error('Assign monitor error:', err);
      showError(err.response?.data?.message || 'Không thể gán lớp trưởng');
    } finally {
      setAssigningMonitor(false);
    }
  };
  
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setActiveTab('basic');
    setViewModalOpen(true);
  };
  
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
  ho_ten: student.ho_ten || '',
  email: student.email || '',
  mssv: student.sinh_vien?.mssv || '',
  ngay_sinh: student.sinh_vien?.ngay_sinh ? new Date(student.sinh_vien.ngay_sinh).toISOString().split('T')[0] : '',
  gt: student.sinh_vien?.gt || 'nam',
  lop_id: student.sinh_vien?.lop_id || '',
  dia_chi: student.sinh_vien?.dia_chi || '',
  sdt: student.sinh_vien?.sdt || '',
    });
    setEditModalOpen(true);
  };

  const handleAddStudent = () => {
    setFormData({
      ho_ten: '',
      email: '',
      mssv: '',
      ngay_sinh: '',
      gt: 'nam',
      lop_id: classes[0]?.id || '',
      dia_chi: '',
      sdt: '',
      ten_dn: '',
      mat_khau: ''
    });
    setAddModalOpen(true);
  };
  
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;
    
    try {
      await http.delete(`/teacher/students/${studentId}`);
      showSuccess('Xóa sinh viên thành công');
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
      showError(err.response?.data?.message || 'Không thể xóa sinh viên');
    }
  };
  
  const handleSaveEdit = async () => {
    try {
      await http.put(`/teacher/students/${selectedStudent.id}`, formData);
      showSuccess('Cập nhật thông tin sinh viên thành công');
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Update error:', err);
      showError(err.response?.data?.message || 'Không thể cập nhật sinh viên');
    }
  };
  
  const handleSaveAdd = async () => {
    // Client-side validation first
    const msgs = validateAddForm();
    if (msgs.length > 0) {
      showError(msgs.join('\n'));
      return;
    }
    try {
      // sanitize sdt to avoid surprising 400s
      const payload = { ...formData };
      if (payload.sdt) payload.sdt = String(payload.sdt).replace(/\D/g, '');

      await http.post('/teacher/students', payload);
      showSuccess('Thêm sinh viên thành công');
      setAddModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Add error:', err);
      showValidationErrors(err, 'Không thể thêm sinh viên');
    }
  };
  
  const handleExport = async (fmt = 'xlsx') => {
    try {
      const params = new URLSearchParams();
      params.set('format', fmt);
      if (searchTerm) params.set('search', searchTerm);
      if (selectedClass && selectedClass !== 'all') { params.set('classFilter', selectedClass); params.set('classId', selectedClass); }

      const url = `/teacher/students/export?${params.toString()}`;
      const res = await http.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: fmt === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const href = window.URL.createObjectURL(blob);
      link.href = href;
      const dateStr = new Date().toISOString().slice(0,10);
      link.download = `danh_sach_sinh_vien_${dateStr}.${fmt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    } catch (err) {
      console.error('Export error:', err);
      showError(err.response?.data?.message || 'Không thể xuất danh sách');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  const formatGender = (gt) => {
    const genderMap = { 'nam': 'Nam', 'nu': 'Nữ', 'khac': 'Khác' };
    return genderMap[gt] || 'N/A';
  };

  // Pagination logic
  const filteredStudents = useMemo(() => students, [students]);
  const startIndex = (page - 1) * limit;
  const paginatedStudents = useMemo(
    () => filteredStudents.slice(startIndex, startIndex + limit),
    [filteredStudents, startIndex, limit]
  );
  const displayFrom = filteredStudents.length ? Math.min(startIndex + 1, filteredStudents.length) : 0;
  const displayTo = Math.min(startIndex + paginatedStudents.length, filteredStudents.length);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ultra Modern Header - Neo-brutalism + Glassmorphism Hybrid */}
      <div className="relative min-h-[220px]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 right-20 w-16 h-16 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-12 h-12 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-10 h-10 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

        {/* Main Content Container with Glassmorphism */}
        <div className="relative z-10 p-6 sm:p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            
            {/* Top Bar with Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-purple-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-purple-400">
                    ✓ QUẢN LÝ
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    {students.length} SINH VIÊN
                  </div>
                </div>
              </div>
            </div>

            {/* Main Title Section */}
            <div className="mb-6">
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Q</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ả</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">L</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ý</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-purple-300 drop-shadow-[0_0_30px_rgba(216,180,254,0.5)]">
                    SINH VIÊN & LỚP
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-purple-300/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed">
                Xem và quản lý danh sách sinh viên, lớp phụ trách
              </p>
            </div>

            {/* Stats Bar with Brutalist Card */}
            <div className="flex gap-4">
              {/* Card - Total Classes */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-purple-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <GraduationCap className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{classes.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">LỚP PHỤ TRÁCH</p>
                </div>
              </div>

              {/* Card - Total Students */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-indigo-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Users className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{students.length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">SINH VIÊN</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>
      </div>

      {/* Bulk Action Bar */}
      {selectedStudents.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Đã chọn {selectedStudents.length} sinh viên</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Bạn có chắc muốn xóa ${selectedStudents.length} sinh viên?`)) {
                  // Handle bulk delete
                  Promise.all(selectedStudents.map(id => http.delete(`/teacher/students/${id}`)))
                    .then(() => {
                      showSuccess(`Đã xóa ${selectedStudents.length} sinh viên`);
                      setSelectedStudents([]);
                      loadData();
                    })
                    .catch(err => showError('Không thể xóa một số sinh viên'));
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa đã chọn
            </button>
            <button
              onClick={() => setSelectedStudents([])}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Class Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500">
              <h3 className="font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Danh sách lớp
              </h3>
              <p className="text-sm text-white/80">{classes.length} lớp phụ trách</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`w-full p-4 text-left transition-all duration-200 ${
                    selectedClass === cls.id
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{cls.ten_lop}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{cls.so_sinh_vien || 0} sinh viên</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedClass === cls.id ? 'text-indigo-600 rotate-90' : 'text-gray-400'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8">
          {/* Class Statistics (only when a specific class is selected) */}
          {/* Assign Monitor (only when a specific class is selected) */}
          {selectedClass && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Gán lớp trưởng</h3>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedMonitorId}
                  onChange={(e) => setSelectedMonitorId(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                >
                  <option value="">Chọn sinh viên làm lớp trưởng</option>
                  {students.map((student) => (
                    <option key={student.sinh_vien?.id || student.id} value={student.sinh_vien?.id}>
                      {student.ho_ten} - {student.sinh_vien?.mssv}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignMonitor}
                  disabled={assigningMonitor}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl"
                >
                  {assigningMonitor ? 'Đang xử lý...' : 'Gán lớp trưởng'}
                </button>
              </div>
            </div>
          )}

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên theo tên, MSSV, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.ten_lop}</option>
              ))}
            </select>
            <button 
              onClick={handleAddStudent}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Thêm sinh viên
            </button>
            <button 
              onClick={() => navigate(`/teacher/students/import?classId=${selectedClass || ''}`)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              <Upload className="w-5 h-5" />
              Import
            </button>
            <button 
              onClick={() => handleExport('xlsx')}
              className="flex items-center gap-2 px-4 py-3 border border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all font-medium"
              title="Xuất Excel"
            >
              <Download className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Danh sách sinh viên
            </h3>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Xem dạng lưới"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Xem dạng danh sách"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              {/* Select All */}
              {paginatedStudents.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(paginatedStudents.map(s => s.id));
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600 font-medium">Chọn tất cả</span>
                </label>
              )}
            </div>
          </div>
        </div>
        
        {paginatedStudents.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedStudents.map(student => {
                const avatar = getStudentAvatar(student);
                const isSelected = selectedStudents.includes(student.id);
                
                return (
                  <div 
                    key={student.id} 
                    className={`relative bg-white border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                      isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => handleViewStudent(student)}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedStudents(prev => 
                            prev.includes(student.id) 
                              ? prev.filter(id => id !== student.id)
                              : [...prev, student.id]
                          );
                        }}
                        className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </div>
                    
                    {/* Avatar & Info */}
                    <div className="flex flex-col items-center text-center">
                      {avatar.hasValidAvatar ? (
                        <img
                          src={avatar.src}
                          alt={avatar.alt}
                          className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-indigo-100 mb-3"
                        />
                      ) : (
                        <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarGradient(student.ho_ten || student.sinh_vien?.mssv)} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-indigo-100 mb-3`}>
                          {avatar.fallback}
                        </div>
                      )}
                      <h4 className="font-bold text-gray-900 text-lg">{student.ho_ten || 'Chưa có tên'}</h4>
                      <p className="text-sm text-indigo-600 font-medium">MSSV: {student.sinh_vien?.mssv || 'N/A'}</p>
                      <p className="text-sm text-gray-500 mt-1">{student.email || 'N/A'}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{student.sinh_vien?.lop?.ten_lop || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleViewStudent(student)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEditStudent(student)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-gray-200">
              {paginatedStudents.map(student => {
                const avatar = getStudentAvatar(student);
                const isSelected = selectedStudents.includes(student.id);
                
                return (
                  <div 
                    key={student.id} 
                    className={`p-6 transition-all duration-200 cursor-pointer ${
                      isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleViewStudent(student)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedStudents(prev => 
                                prev.includes(student.id) 
                                  ? prev.filter(id => id !== student.id)
                                  : [...prev, student.id]
                              );
                            }}
                            className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                        
                        {/* Avatar */}
                        {avatar.hasValidAvatar ? (
                          <img
                            src={avatar.src}
                            alt={avatar.alt}
                            className="w-14 h-14 rounded-xl object-cover shadow-md ring-2 ring-white"
                          />
                        ) : (
                          <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarGradient(student.ho_ten || student.sinh_vien?.mssv)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                            {avatar.fallback}
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{student.ho_ten || 'Chưa có tên'}</h4>
                          <p className="text-sm text-indigo-600 font-medium">MSSV: {student.sinh_vien?.mssv || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="hidden lg:flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{student.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{student.sinh_vien?.sdt || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span className="text-indigo-600 font-medium">{student.sinh_vien?.lop?.ten_lop || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleViewStudent(student)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEditStudent(student)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <UserX className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-500 mb-2">Không có sinh viên nào</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'Không tìm thấy sinh viên phù hợp với bộ lọc' 
                : 'Chưa có sinh viên nào trong lớp này'
              }
            </p>
            <button
              onClick={handleAddStudent}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Thêm sinh viên mới
            </button>
          </div>
        )}
        
        {filteredStudents.length > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t-2 border-gray-200">
            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Hiển thị <span className="font-bold text-indigo-600">{displayFrom} - {displayTo}</span> của <span className="font-bold">{filteredStudents.length}</span> sinh viên
              </div>
              <Pagination
                pagination={{ ...pagination, total: filteredStudents.length }}
                onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))}
                itemLabel="sinh viên"
                showLimitSelector
              />
            </div>
          </div>
        )}
      </div>

      {/* View Student Modal */}
      {viewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              <h2 className="text-2xl font-bold text-white">Thông tin sinh viên</h2>
              <button onClick={() => setViewModalOpen(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6 bg-gray-50">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-6 font-bold transition-all ${
                  activeTab === 'basic'
                    ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px] bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Cơ bản
                </div>
              </button>
              <button
                onClick={() => setActiveTab('academic')}
                className={`py-4 px-6 font-bold transition-all ${
                  activeTab === 'academic'
                    ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px] bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Học tập
                </div>
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-6 font-bold transition-all ${
                  activeTab === 'personal'
                    ? 'text-indigo-600 border-b-4 border-indigo-600 -mb-[2px] bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Cá nhân
                </div>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 pb-6 border-b-2 border-gray-100">
                    {(() => {
                      const avatar = getStudentAvatar(selectedStudent);
                      return avatar.hasValidAvatar ? (
                        <img
                          src={avatar.src}
                          alt={avatar.alt}
                          className="w-24 h-24 rounded-2xl object-cover shadow-xl ring-4 ring-indigo-100"
                        />
                      ) : (
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getAvatarGradient(selectedStudent.ho_ten || selectedStudent.sinh_vien?.mssv)} flex items-center justify-center text-white font-black text-3xl shadow-xl ring-4 ring-indigo-100`}>
                          {avatar.fallback}
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">{selectedStudent.ho_ten || 'N/A'}</h3>
                      <p className="text-indigo-600 font-bold text-lg">MSSV: {selectedStudent.sinh_vien?.mssv || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                      <label className="block text-sm font-bold text-gray-500 mb-1">Họ và tên</label>
                      <p className="text-lg font-bold text-gray-900">{selectedStudent.ho_ten || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                      <label className="block text-sm font-bold text-gray-500 mb-1">MSSV</label>
                      <p className="text-lg font-bold text-gray-900">{selectedStudent.sinh_vien?.mssv || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                      <label className="block text-sm font-bold text-gray-500 mb-1">Email</label>
                      <p className="text-lg text-gray-900">{selectedStudent.email || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                      <label className="block text-sm font-bold text-gray-500 mb-1">Lớp</label>
                      <p className="text-lg text-gray-900">{selectedStudent.sinh_vien?.lop?.ten_lop || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
                      <label className="block text-sm font-bold text-blue-600 mb-1">Lớp</label>
                      <p className="text-lg text-gray-900">{selectedStudent.sinh_vien?.lop?.ten_lop || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                      <label className="block text-sm font-bold text-purple-600 mb-1">Khoa</label>
                      <p className="text-lg text-gray-900">{selectedStudent.sinh_vien?.lop?.khoa || 'N/A'}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border-2 border-green-100">
                      <label className="block text-sm font-bold text-green-600 mb-1">Niên khóa</label>
                      <p className="text-lg text-gray-900">{selectedStudent.sinh_vien?.lop?.nien_khoa || 'N/A'}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-100">
                      <label className="block text-sm font-bold text-orange-600 mb-1">Năm nhập học</label>
                      <p className="text-lg text-gray-900">{formatDate(selectedStudent.sinh_vien?.lop?.nam_nhap_hoc)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-100">
                      <label className="block text-sm font-bold text-pink-600 mb-1">Ngày sinh</label>
                      <p className="text-lg text-gray-900">{formatDate(selectedStudent.sinh_vien?.ngay_sinh)}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-100">
                      <label className="block text-sm font-bold text-indigo-600 mb-1">Giới tính</label>
                      <p className="text-lg text-gray-900">{formatGender(selectedStudent.sinh_vien?.gt)}</p>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-4 border-2 border-teal-100">
                      <label className="block text-sm font-bold text-teal-600 mb-1">Số điện thoại</label>
                      <p className="text-lg text-gray-900">{selectedStudent.sinh_vien?.sdt || 'N/A'}</p>
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                      <label className="block text-sm font-bold text-gray-500 mb-1">Địa chỉ</label>
                      <p className="text-lg text-gray-900">{selectedStudent.sinh_vien?.dia_chi || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-500">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="w-6 h-6" />
                Chỉnh sửa sinh viên
              </h2>
              <button onClick={() => setEditModalOpen(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên *</label>
                    <input
                      type="text"
                      value={formData.ho_ten}
                      onChange={(e) => setFormData({...formData, ho_ten: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">MSSV *</label>
                    <input
                      type="text"
                      value={formData.mssv}
                      onChange={(e) => setFormData({...formData, mssv: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.ngay_sinh}
                      onChange={(e) => setFormData({...formData, ngay_sinh: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giới tính</label>
                    <select
                      value={formData.gt}
                      onChange={(e) => setFormData({...formData, gt: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    >
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lớp</label>
                    <select
                      value={formData.lop_id}
                      onChange={(e) => setFormData({...formData, lop_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    >
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.ten_lop}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.sdt}
                      onChange={(e) => setFormData({...formData, sdt: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ</label>
                    <textarea
                      value={formData.dia_chi}
                      onChange={(e) => setFormData({...formData, dia_chi: e.target.value})}
                      rows="2"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-bold shadow-lg"
              >
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Thêm sinh viên mới
              </h2>
              <button onClick={() => setAddModalOpen(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên *</label>
                    <input
                      type="text"
                      value={formData.ho_ten}
                      onChange={(e) => setFormData({...formData, ho_ten: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">MSSV *</label>
                    <input
                      type="text"
                      value={formData.mssv}
                      onChange={(e) => setFormData({...formData, mssv: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      placeholder="SV001234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên đăng nhập *</label>
                    <input
                      type="text"
                      value={formData.ten_dn}
                      onChange={(e) => setFormData({...formData, ten_dn: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu *</label>
                    <input
                      type="password"
                      value={formData.mat_khau}
                      onChange={(e) => setFormData({...formData, mat_khau: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.ngay_sinh}
                      onChange={(e) => setFormData({...formData, ngay_sinh: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giới tính</label>
                    <select
                      value={formData.gt}
                      onChange={(e) => setFormData({...formData, gt: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                    >
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lớp *</label>
                    <select
                      value={formData.lop_id}
                      onChange={(e) => setFormData({...formData, lop_id: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                    >
                      <option value="">Chọn lớp</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.ten_lop}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.sdt}
                      onChange={(e) => setFormData({...formData, sdt: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      placeholder="0901234567"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ</label>
                    <textarea
                      value={formData.dia_chi}
                      onChange={(e) => setFormData({...formData, dia_chi: e.target.value})}
                      rows="2"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-all"
                      placeholder="Địa chỉ sinh viên..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAdd}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Thêm sinh viên
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
