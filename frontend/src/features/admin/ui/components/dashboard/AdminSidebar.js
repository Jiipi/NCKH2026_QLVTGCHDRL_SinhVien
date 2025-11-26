import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';

export default function AdminSidebar({
  sidebarTab,
  setSidebarTab,
  classes,
  loadingClasses,
  teachers,
  loadingTeachers,
  onClassClick,
  onTeacherClick
}) {
  const navigate = useNavigate();

  return (
    <aside className="lg:col-span-6 xl:col-span-5">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarTab('classes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                sidebarTab === 'classes'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Danh sách lớp
            </button>
            <button
              onClick={() => setSidebarTab('teachers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                sidebarTab === 'teachers'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4" />
              Danh sách giảng viên
            </button>
          </div>
          {sidebarTab === 'classes' ? (
            <button
              onClick={() => navigate('/admin/classes')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem tất cả →
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/users?role=GIANG_VIEN')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Quản lý →
            </button>
          )}
        </div>

        {sidebarTab === 'classes' ? (
          <ClassesList 
            classes={classes} 
            loading={loadingClasses} 
            onClassClick={onClassClick} 
          />
        ) : (
          <TeachersList 
            teachers={teachers} 
            loading={loadingTeachers} 
            onTeacherClick={onTeacherClick} 
          />
        )}
      </div>
    </aside>
  );
}

function ClassesList({ classes, loading, onClassClick }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <GraduationCap className="h-10 w-10 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Chưa có lớp</p>
      </div>
    );
  }

  return (
    <div className="max-h-[460px] overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 #f3f4f6' }}>
      {classes.map((c, idx) => (
        <div
          key={c.id || c.ma_lop || c.class_id || c._id || idx}
          className="rounded-lg p-3 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
          onClick={() => onClassClick(c)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                {c.name || c.ten_lop || c.class_name || 'Lớp'}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Users className="h-3 w-3" />
                <span>{c.studentCount || c.si_so || c.so_luong_sv || (Array.isArray(c.students) ? c.students.length : undefined) || c._count?.students || 0} sinh viên</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TeachersList({ teachers, loading, onTeacherClick }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
        <div className="text-center py-8 text-gray-500">
        <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="max-h-[460px] overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f1 #f3f4f6' }}>
      {teachers.map((t, idx) => (
        <div
          key={t.id || t.user_id || t._id || idx}
          className="rounded-lg p-3 border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer"
          onClick={() => onTeacherClick(t)}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm">
                {(t.ho_ten || t.fullName || t.full_name || t.name || t.ten_dn || 'G')?.split(' ').pop()?.charAt(0)?.toUpperCase() || 'G'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                {t.ho_ten || t.fullName || t.full_name || t.name || t.ten_dn || 'Giảng viên'}
              </h4>
              <p className="text-xs text-gray-600 truncate">
                {t.email || t.ten_dn || t.username || '—'}
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium flex-shrink-0">
              GV
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
