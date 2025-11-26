import React from 'react';
import { Bell, Send, Users, Activity, AlertCircle, Sparkles, CheckCircle, Clock, MessageSquare, Target, Filter, Calendar, TrendingUp, Zap, Shield, Building2, GraduationCap, RefreshCcw } from 'lucide-react';
import useAdminNotifications from '../model/hooks/useAdminNotifications';

// ——————————————————————————————————————————————————————————————————————————
// Neo-brutalism StatCard Component
// ——————————————————————————————————————————————————————————————————————————
function NeoStatCard({ icon: Icon, label, value, className }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl" />
      <div className={`relative ${className} border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}>
        <Icon className="h-6 w-6 text-black mb-2" />
        <p className="text-3xl font-black text-black">{value}</p>
        <p className="text-xs font-black text-black/70 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function AdminNotifications() {
  const {
    form,
    setFormField,
    handleScopeChange,
    resetForm,
    sending,
    feedback,
    stats,
    classes,
    activities,
    history,
    showHistory,
    toggleHistory,
    selectedNotification,
    detailOpen,
    openDetail,
    closeDetail,
    applyTemplate: fillTemplate,
    submit,
    charCount,
    maxChars,
  } = useAdminNotifications();
  
  const templates = [
    { id: 1, name: 'Thông báo hệ thống', title: 'Thông báo bảo trì hệ thống', message: 'Hệ thống sẽ bảo trì từ [Thời gian]. Vui lòng lưu công việc và đăng xuất trước đó.' },
    { id: 2, name: 'Thông báo sinh viên', title: 'Thông báo quan trọng tới sinh viên', message: 'Tất cả sinh viên vui lòng chú ý: [Nội dung]' },
    { id: 3, name: 'Thông báo giảng viên', title: 'Hướng dẫn cho giảng viên', message: 'Kính gửi quý thầy cô, [Nội dung hướng dẫn]' },
    { id: 4, name: 'Thông báo khẩn cấp', title: ' THÔNG BÁO KHẨN CẤP', message: 'Có tình huống khẩn cấp cần xử lý ngay. Vui lòng liên hệ phòng quản lý.' }
  ];

  const getScopeIcon = (scopeType) => {
    switch (scopeType) {
      case 'system': return <Shield className="h-6 w-6 text-white" />;
      case 'role': return <Users className="h-6 w-6 text-white" />;
      case 'class': return <GraduationCap className="h-6 w-6 text-white" />;
      case 'department': return <Building2 className="h-6 w-6 text-white" />;
      case 'activity': return <Activity className="h-6 w-6 text-white" />;
      default: return <Bell className="h-6 w-6 text-white" />;
    }
  };

  const getScopeLabel = (scopeType) => {
    switch (scopeType) {
      case 'system': return ' Toàn hệ thống';
      case 'role': return ' Theo vai trò';
      case 'class': return ' Theo lớp';
      case 'department': return ' Theo khoa';
      case 'activity': return ' Theo hoạt động';
      default: return 'Cá nhân';
    }
  };

  const getScopeColor = (scopeType) => {
    switch (scopeType) {
      case 'system': return 'from-red-500 to-orange-500';
      case 'role': return 'from-indigo-500 to-purple-500';
      case 'class': return 'from-emerald-500 to-teal-500';
      case 'department': return 'from-blue-500 to-cyan-500';
      case 'activity': return 'from-amber-500 to-yellow-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 pb-10">
      {/* ======================== NEO-BRUTALISM HERO SECTION ======================== */}
      <div className="relative mb-6 rounded-3xl overflow-hidden mx-4 mt-4">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Geometric decorations */}
        <div className="absolute top-8 right-12 w-20 h-20 border-4 border-white/20 transform rotate-45 animate-bounce-slow" />
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-12 h-12 border-4 border-orange-300/30 rounded-full animate-spin-slow" />
        <div className="absolute top-20 left-1/3 w-8 h-8 bg-pink-400/30 transform rotate-12" />

        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12">
          <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Top badge and toggle history */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-400 blur-lg opacity-50" />
                  <div className="relative bg-black text-orange-300 px-4 py-2 font-black text-xs sm:text-sm tracking-wider transform -rotate-2 border-2 border-orange-300 shadow-lg">
                    📢 QUẢN LÝ THÔNG BÁO
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40" />
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                    {stats.total} THÔNG BÁO
                  </div>
                </div>
              </div>
              <button
                onClick={toggleHistory}
                className="group relative"
              >
                <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-xl" />
                <div className="relative bg-white/20 backdrop-blur border-2 border-white/40 hover:bg-white/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="hidden sm:inline text-white font-bold">{showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}</span>
                </div>
              </button>
            </div>

            {/* Main title */}
            <div className="mb-8">
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Q</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ả</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">L</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ý</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-orange-300 drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]">
                    THÔNG BÁO
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-orange-400/30 blur-sm" />
                </span>
              </h1>

              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Gửi thông báo broadcast tới toàn hệ thống hoặc nhóm cụ thể
              </p>
            </div>

            {/* Neo-brutalism Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <NeoStatCard icon={MessageSquare} label="TỔNG SỐ" value={stats.total} className="bg-cyan-400" />
              <NeoStatCard icon={Zap} label="TUẦN NÀY" value={stats.thisWeek} className="bg-green-400" />
              <NeoStatCard icon={Shield} label="HỆ THỐNG" value={stats.systemScope} className="bg-purple-400" />
              <NeoStatCard icon={Users} label="VAI TRÒ" value={stats.roleScope} className="bg-blue-400" />
              <NeoStatCard icon={GraduationCap} label="LỚP" value={stats.classScope} className="bg-yellow-400" />
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes grid-move {
              0% { transform: translateY(0); }
              100% { transform: translateY(50px); }
            }
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0) rotate(45deg); }
              50% { transform: translateY(-20px) rotate(45deg); }
            }
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
          `}
        </style>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Feedback messages */}
        {feedback.error && (
          <div className="group relative">
            <div className="absolute inset-0 bg-red-800 transform translate-x-2 translate-y-2 rounded-xl" />
            <div className="relative bg-red-100 border-4 border-red-800 rounded-xl p-4 flex items-center transform transition-all group-hover:-translate-x-1 group-hover:-translate-y-1">
              <div className="p-2 bg-red-200 rounded-xl mr-3 border-2 border-red-800"><AlertCircle className="h-5 w-5 text-red-800" /></div>
              <span className="font-black text-red-800">{feedback.error}</span>
            </div>
          </div>
        )}
        {feedback.success && (
          <div className="group relative">
            <div className="absolute inset-0 bg-green-800 transform translate-x-2 translate-y-2 rounded-xl" />
            <div className="relative bg-green-100 border-4 border-green-800 rounded-xl p-4 flex items-center transform transition-all group-hover:-translate-x-1 group-hover:-translate-y-1">
              <div className="p-2 bg-green-200 rounded-xl mr-3 border-2 border-green-800"><CheckCircle className="h-5 w-5 text-green-800" /></div>
              <span className="font-black text-green-800">{feedback.success}</span>
            </div>
          </div>
        )}

        {/* Templates Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Mẫu thông báo nhanh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => fillTemplate(template)}
                className="text-left p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition"
              >
                <div className="text-sm font-semibold text-gray-900 mb-1">{template.name}</div>
                <div className="text-xs text-gray-600 line-clamp-2">{template.message}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div>
              <label className="flex text-sm font-semibold text-gray-800 mb-2 items-center gap-2">
                <MessageSquare className="h-4 w-4 text-red-600" />
                Tiêu đề thông báo
              </label>
              <input 
                value={form.title} 
                onChange={(e) => setFormField('title', e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white" 
                placeholder="Nhập tiêu đề ngắn gọn, rõ ràng..." 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex text-sm font-semibold text-gray-800 items-center gap-2">
                  <Bell className="h-4 w-4 text-red-600" />
                  Nội dung thông báo
                </label>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${charCount > maxChars ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {charCount}/{maxChars}
                </span>
              </div>
              <textarea 
                value={form.message} 
                onChange={(e) => setFormField('message', e.target.value)} 
                rows={6} 
                maxLength={maxChars} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition resize-none bg-white" 
                placeholder="Nhập nội dung chi tiết thông báo..." 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex text-sm font-semibold text-gray-800 mb-2 items-center gap-2">
                  <Target className="h-4 w-4 text-red-600" />
                  Phạm vi gửi
                </label>
                <select 
                  value={form.scope} 
                  onChange={(e) => handleScopeChange(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white"
                >
                  <option value="system"> Toàn hệ thống</option>
                  <option value="role"> Theo vai trò</option>
                  <option value="class"> Theo lớp</option>
                  <option value="department"> Theo khoa</option>
                  <option value="activity"> Theo hoạt động</option>
                </select>
              </div>
              {form.scope === 'role' && (
                <div>
                  <label className="flex text-sm font-semibold text-gray-800 mb-2 items-center gap-2">
                    <Users className="h-4 w-4 text-red-600" />
                    Chọn vai trò
                  </label>
                  <select 
                    value={form.targetRole} 
                    onChange={(e) => setFormField('targetRole', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white"
                  >
                    <option value="">-- Chọn vai trò --</option>
                    <option value="ADMIN"> Quản trị viên</option>
                    <option value="GIANG_VIEN"> Giảng viên</option>
                    <option value="SINH_VIEN"> Sinh viên</option>
                  </select>
                </div>
              )}
              {form.scope === 'class' && (
                <div>
                  <label className="flex text-sm font-semibold text-gray-800 mb-2 items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-red-600" />
                    Chọn lớp
                  </label>
                  <select 
                    value={form.targetClass} 
                    onChange={(e) => setFormField('targetClass', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white"
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.ten_lop} - {cls.khoa} ({cls.soLuongSinhVien || 0} SV)</option>
                    ))}
                  </select>
                </div>
              )}
              {form.scope === 'department' && (
                <div>
                  <label className="flex text-sm font-semibold text-gray-800 mb-2 items-center gap-2">
                    <Building2 className="h-4 w-4 text-red-600" />
                    Tên khoa
                  </label>
                  <input 
                    value={form.targetDepartment} 
                    onChange={(e) => setFormField('targetDepartment', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white" 
                    placeholder="VD: Công nghệ thông tin" 
                  />
                </div>
              )}
              {form.scope === 'activity' && (
                <div>
                  <label className="flex text-sm font-semibold text-gray-800 mb-2 items-center gap-2">
                    <Activity className="h-4 w-4 text-red-600" />
                    Chọn hoạt động
                  </label>
                  <select 
                    value={form.activityId} 
                    onChange={(e) => setFormField('activityId', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white"
                  >
                    <option value="">-- Chọn hoạt động --</option>
                    {activities.map(activity => (
                      <option key={activity.id} value={activity.id}>{activity.ten_hd || activity.ten_hoat_dong || `HD ${activity.id}`}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={resetForm} 
                className="group/btn relative"
              >
                <div className="absolute inset-0 bg-gray-600 transform translate-x-1 translate-y-1 rounded-xl" />
                <div className="relative px-6 py-3 bg-gray-200 text-gray-800 border-3 border-gray-600 rounded-xl hover:bg-gray-300 transition-all font-black transform group-hover/btn:-translate-x-0.5 group-hover/btn:-translate-y-0.5">
                  Đặt lại
                </div>
              </button>
              <button 
                type="submit" 
                disabled={sending}
                className="group/btn relative"
              >
                <div className="absolute inset-0 bg-red-800 transform translate-x-1 translate-y-1 rounded-xl" />
                <div className="relative flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white border-3 border-red-800 rounded-xl hover:from-red-600 hover:to-orange-600 transition-all.disabled:opacity-60 disabled:cursor-not-allowed font-black transform group-hover/btn:-translate-x-0.5 group-hover/btn:-translate-y-0.5">
                  <Send className="h-5 w-5" />
                  {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                </div>
              </button>
            </div>
        </form>
        {/* History Section */}
        {showHistory && history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Lịch sử gửi thông báo
            </h3>
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => openDetail(item)} 
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-all">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getScopeColor(item.scope)}`}>
                        {getScopeIcon(item.scope)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.date).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {item.recipients} người nhận
                          </span>
                          <span className="text-xs px-2 py-1 rounded-lg font-medium bg-orange-100 text-orange-700">
                            {getScopeLabel(item.scope)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Đã gửi
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
        {/* Neo-brutalism Modal */}
        {detailOpen && selectedNotification && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeDetail}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="absolute inset-0 bg-black transform translate-x-4 translate-y-4 rounded-2xl" />
              <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-black">
                {/* Modal header */}
                <div className="sticky top-0 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 text-white p-6 border-b-4 border-black">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-wide">
                      <MessageSquare className="h-6 w-6" />
                      Chi tiết thông báo
                    </h2>
                    <button
                      onClick={closeDetail}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-xl" />
                      <div className="relative p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all border-2 border-white/40 transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                        <span className="text-2xl font-black">×</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gray-300 transform translate-x-1 translate-y-1 rounded-xl" />
                    <div className="relative bg-gray-50 border-3 border-black p-4 rounded-xl">
                      <label className="text-xs font-black text-gray-600 mb-2 block uppercase tracking-wide">Tiêu đề</label>
                      <p className="text-lg font-black text-black">{selectedNotification.title}</p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute inset-0 bg-orange-300 transform translate-x-1 translate-y-1 rounded-xl" />
                    <div className="relative bg-orange-50 border-3 border-black p-4 rounded-xl">
                      <label className="text-xs font-black text-orange-800 mb-2 block uppercase tracking-wide">Nội dung</label>
                      <p className="text-gray-800 whitespace-pre-wrap font-medium">
                        {selectedNotification.message}
                      </p>
                    </div>
                  </div>

                  {/* Scope Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-purple-300 transform translate-x-1 translate-y-1 rounded-xl" />
                      <div className="relative bg-purple-50 border-3 border-black p-4 rounded-xl">
                        <label className="text-xs font-black text-purple-800 mb-2 block uppercase tracking-wide">Phạm vi gửi</label>
                        <div className={`px-4 py-2 rounded-xl font-black inline-flex items-center gap-2 border-2 border-black ${
                          selectedNotification.scope === 'system' ? 'bg-purple-200 text-purple-800' :
                          selectedNotification.scope === 'role' ? 'bg-blue-200 text-blue-800' :
                          selectedNotification.scope === 'class' ? 'bg-green-200 text-green-800' :
                          selectedNotification.scope === 'department' ? 'bg-yellow-200 text-yellow-800' :
                          selectedNotification.scope === 'activity' ? 'bg-pink-200 text-pink-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {getScopeIcon(selectedNotification.scope)}
                          {getScopeLabel(selectedNotification.scope)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="group relative">
                      <div className="absolute inset-0 bg-cyan-300 transform translate-x-1 translate-y-1 rounded-xl" />
                      <div className="relative bg-cyan-50 border-3 border-black p-4 rounded-xl">
                        <label className="text-xs font-black text-cyan-800 mb-2 block uppercase tracking-wide">Ngày gửi</label>
                        <p className="text-black flex items-center gap-2 font-bold">
                          <Calendar className="h-4 w-4 text-cyan-600" />
                          {new Date(selectedNotification.date).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sender Info */}
                  {selectedNotification.senderName && (
                    <div className="group relative">
                      <div className="absolute inset-0 bg-indigo-300 transform translate-x-1 translate-y-1 rounded-xl" />
                      <div className="relative bg-indigo-50 border-3 border-black p-4 rounded-xl">
                        <label className="text-xs font-black text-indigo-800 mb-2 block uppercase tracking-wide">Người gửi</label>
                        <div className="flex items-center gap-2">
                          <p className="text-black font-bold">{selectedNotification.senderName}</p>
                          <span className="text-xs px-2 py-1 bg-indigo-200 text-indigo-800 rounded-lg font-black border-2 border-indigo-800">
                            {selectedNotification.senderRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scope Details */}
                  {selectedNotification.roles && selectedNotification.roles.length > 0 && (
                    <div className="group relative">
                      <div className="absolute inset-0 bg-blue-300 transform translate-x-1 translate-y-1 rounded-xl" />
                      <div className="relative bg-blue-50 border-3 border-black p-4 rounded-xl">
                        <label className="text-xs font-black text-blue-800 mb-2 block uppercase tracking-wide">Vai trò nhận</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedNotification.roles.map((role, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-lg text-sm font-black border-2 border-blue-800">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNotification.classes && selectedNotification.classes.length > 0 && (
                    <div className="group relative">
                      <div className="absolute inset-0 bg-green-300 transform translate-x-1 translate-y-1 rounded-xl" />
                      <div className="relative bg-green-50 border-3 border-black p-4 rounded-xl">
                        <label className="text-xs font-black text-green-800 mb-2 block uppercase tracking-wide">Lớp nhận</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedNotification.classes.map((cls, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-200 text-green-800 rounded-lg text-sm font-black border-2 border-green-800">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recipients Info */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-red-300 transform translate-x-1 translate-y-1 rounded-xl" />
                    <div className="relative bg-red-50 border-3 border-black p-4 rounded-xl">
                      <label className="text-xs font-black text-red-800 mb-2 block uppercase tracking-wide">Người nhận</label>
                      <div className="flex items-center gap-2 text-black">
                        <Users className="h-5 w-5 text-red-600" />
                        <span className="font-black text-lg">{selectedNotification.recipients} người</span>
                      </div>
                      {selectedNotification.recipientsList && selectedNotification.recipientsList.length > 0 && (
                        <div className="mt-3 max-h-40 overflow-y-auto bg-white rounded-xl p-4 border-3 border-black">
                          <div className="space-y-2">
                            {selectedNotification.recipientsList.map((recipient, idx) => (
                              <div key={idx} className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                {recipient.ho_ten || recipient.email}
                                <span className="text-xs text-gray-500 font-bold">({recipient.vai_tro})</span>
                                {recipient.lop && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded border border-black font-bold">
                                    {recipient.lop}
                                  </span>
                                )}
                              </div>
                            ))}
                            {selectedNotification.recipients > selectedNotification.recipientsList.length && (
                              <div className="text-sm text-gray-500 italic pt-2 border-t-2 border-black font-bold">
                                ... và {selectedNotification.recipients - selectedNotification.recipientsList.length} người khác
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t-4 border-black flex justify-end bg-gray-100">
                  <button 
                    onClick={closeDetail} 
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-red-800 transform translate-x-1 translate-y-1 rounded-xl" />
                    <div className="relative px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all font-black border-3 border-red-800 transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                      Đóng
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
