import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  User,
  ChevronRight,
  UserCheck,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react';
import http from '../../../../../shared/api/http';
import { useNotification } from '../../../../../shared/contexts/NotificationContext';

export default function ClassManagementPage() {
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalActivities: 0,
    totalParticipants: 0,
    participationRate: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [assigningMonitor, setAssigningMonitor] = useState(false);
  const [selectedMonitorId, setSelectedMonitorId] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassStudents(selectedClass.id);
      loadClassStatistics(selectedClass.id);
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await http.get('/teacher/classes');
      const classesData = response.data?.data?.classes || [];
      setClasses(classesData);
      if (classesData.length > 0) {
        setSelectedClass(classesData[0]);
      }
    } catch (err) {
      console.error('Load classes error:', err);
  showError('KhĂ´ng thá»ƒ táº£i danh sĂ¡ch lá»›p');
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async (classId) => {
    try {
      const response = await http.get(`/teacher/students`, { params: { classFilter: classId, classId } });
      console.log('[ClassManagement] Students API response:', response.data);
      const studentsData = response.data?.data?.students || [];
      console.log('[ClassManagement] Students data:', studentsData);
      setStudents(studentsData);
      
      // Get current monitor
      const currentClass = classes.find(c => c.id === classId);
      if (currentClass?.lop_truong) {
        setSelectedMonitorId(currentClass.lop_truong);
      }
    } catch (err) {
      console.error('Load students error:', err);
    }
  };

  const loadClassStatistics = async (classId) => {
    try {
      const response = await http.get(`/teacher/classes/${classId}/statistics`);
      const stats = response.data?.data || {};
      setStatistics({
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
      showWarning('Vui lĂ²ng chá»n sinh viĂªn lĂ m lá»›p trÆ°á»Ÿng');
      return;
    }

    setAssigningMonitor(true);
    try {
      await http.patch(`/teacher/classes/${selectedClass.id}/monitor`, {
        sinh_vien_id: selectedMonitorId
      });
      showSuccess('GĂ¡n lá»›p trÆ°á»Ÿng thĂ nh cĂ´ng');
      // Refresh current class and students/statistics without losing selection
      await Promise.all([
        loadClasses(),
        loadClassStudents(selectedClass.id),
        loadClassStatistics(selectedClass.id)
      ]);
    } catch (err) {
      console.error('Assign monitor error:', err);
      showError(err.response?.data?.message || 'KhĂ´ng thá»ƒ gĂ¡n lá»›p trÆ°á»Ÿng');
    } finally {
      setAssigningMonitor(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">KhĂ´ng cĂ³ lá»›p phá»¥ trĂ¡ch</h3>
          <p className="text-gray-400">Báº¡n chÆ°a Ä‘Æ°á»£c gĂ¡n lĂ m chá»§ nhiá»‡m lá»›p nĂ o</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quáº£n lĂ½ lá»›p</h1>
        <p className="text-gray-600">Xem vĂ  quáº£n lĂ½ cĂ¡c lá»›p phá»¥ trĂ¡ch</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Classes Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="font-semibold text-gray-900">Danh sĂ¡ch lá»›p</h3>
              <p className="text-sm text-gray-600">{classes.length} lá»›p phá»¥ trĂ¡ch</p>
            </div>
            <div className="divide-y divide-gray-200">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedClass?.id === cls.id
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{cls.ten_lop}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{cls.so_sinh_vien || 0} sinh viĂªn</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Class Details */}
        <div className="col-span-12 lg:col-span-8">
          {selectedClass && (
            <div className="space-y-6">
              {/* Class Info Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.ten_lop}</h2>
                    <p className="text-gray-600">ThĂ´ng tin chi tiáº¿t lá»›p há»c</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Khoa</label>
                    <p className="text-base font-semibold text-gray-900">{selectedClass.khoa || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">NiĂªn khĂ³a</label>
                    <p className="text-base font-semibold text-gray-900">{selectedClass.nien_khoa || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">NÄƒm nháº­p há»c</label>
                    <p className="text-base text-gray-900">{formatDate(selectedClass.nam_nhap_hoc)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">NÄƒm tá»‘t nghiá»‡p dá»± kiáº¿n</label>
                    <p className="text-base text-gray-900">{formatDate(selectedClass.nam_tot_nghiep)}</p>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tá»•ng SV</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.totalStudents}</p>
                      <p className="text-xs text-gray-500 mt-1">Sinh viĂªn trong lá»›p</p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Hoáº¡t Ä‘á»™ng</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.totalActivities}</p>
                      <p className="text-xs text-gray-500 mt-1">ÄĂ£ tham gia</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tham gia</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.participationRate}%</p>
                      <p className="text-xs text-gray-500 mt-1">{statistics.totalParticipants} lÆ°á»£t tham gia</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Äiá»ƒm TB</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.averageScore}</p>
                      <p className="text-xs text-gray-500 mt-1">Äiá»ƒm rĂ¨n luyá»‡n</p>
                    </div>
                    <Award className="w-8 h-8 text-orange-600 opacity-20" />
                  </div>
                </div>
              </div>

              {/* Assign Monitor */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">GĂ¡n lá»›p trÆ°á»Ÿng</h3>
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedMonitorId}
                    onChange={(e) => setSelectedMonitorId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Chá»n sinh viĂªn lĂ m lá»›p trÆ°á»Ÿng</option>
                    {students.map((student) => (
                      <option key={student.sinh_vien?.id} value={student.sinh_vien?.id}>
                        {student.ho_ten} - {student.sinh_vien?.mssv}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignMonitor}
                    disabled={assigningMonitor}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigningMonitor ? 'Äang xá»­ lĂ½...' : 'GĂ¡n lá»›p trÆ°á»Ÿng'}
                  </button>
                </div>
              </div>

              {/* Students List */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Danh sĂ¡ch sinh viĂªn</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {student.ho_ten?.charAt(0) || 'S'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{student.ho_ten || 'N/A'}</h4>
                            <p className="text-sm text-gray-600">MSSV: {student.sinh_vien?.mssv || 'N/A'}</p>
                          </div>
                          {student.sinh_vien?.id === selectedMonitorId && (
                            <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                              Lá»›p trÆ°á»Ÿng
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      ChÆ°a cĂ³ sinh viĂªn trong lá»›p
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
