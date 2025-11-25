import React from 'react';
import { Bell, Send, Users, Activity, AlertCircle, Sparkles, CheckCircle, Clock, MessageSquare, Target, Filter, Calendar, TrendingUp, Zap, Shield, Building2, GraduationCap } from 'lucide-react';
import useAdminNotifications from '../model/hooks/useAdminNotifications';

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">Quản lý Thông Báo</h1>
                  <p className="text-orange-100 mt-1">Gửi thông báo broadcast tới toàn hệ thống hoặc nhóm cụ thể</p>
                </div>
              </div>
              <button onClick={toggleHistory} className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-2xl hover:bg-red-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold">
                <Clock className="h-5 w-5" />
                {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><MessageSquare className="h-6 w-6" /></div>
              <Sparkles className="h-5 w-5 opacity-50" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-orange-100 text-sm font-medium">Tổng thông báo</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><Zap className="h-6 w-6" /></div>
              <TrendingUp className="h-5 w-5 opacity-50" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.thisWeek}</div>
            <div className="text-emerald-100 text-sm font-medium">Tuần này</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><Shield className="h-6 w-6" /></div>
              <Target className="h-5 w-5 opacity-50" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.systemScope}</div>
            <div className="text-purple-100 text-sm font-medium">Hệ thống</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><Users className="h-6 w-6" /></div>
              <Filter className="h-5 w-5 opacity-50" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.roleScope}</div>
            <div className="text-indigo-100 text-sm font-medium">Theo vai trò</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><GraduationCap className="h-6 w-6" /></div>
              <Activity className="h-5 w-5 opacity-50" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.classScope}</div>
            <div className="text-amber-100 text-sm font-medium">Theo lớp</div>
          </div>
        </div>
        {feedback.error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-700 shadow-lg">
            <div className="p-2 bg-red-100 rounded-xl mr-3"><AlertCircle className="h-5 w-5" /></div>
            <span className="font-medium">{feedback.error}</span>
          </div>
        )}
        {feedback.success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 flex items-center text-green-700 shadow-lg">
            <div className="p-2 bg-green-100 rounded-xl mr-3"><CheckCircle className="h-5 w-5" /></div>
            <span className="font-medium">{feedback.success}</span>
          </div>
        )}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            Mẫu thông báo nhanh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {templates.map(template => (
              <button key={template.id} onClick={() => fillTemplate(template)} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-100 rounded-xl hover:border-red-300 hover:shadow-lg transition-all text-left group">
                <div className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-red-600 transition-colors">{template.name}</div>
                <div className="text-xs text-gray-600 line-clamp-2">{template.message}</div>
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white shadow-lg p-6 space-y-6">
          <div>
            <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-600" />
              Tiêu đề thông báo
            </label>
            <input value={form.title} onChange={(e) => setFormField('title', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium" placeholder="Nhập tiêu đề ngắn gọn, rõ ràng..." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex text-sm font-bold text-gray-900 items-center gap-2">
                <Bell className="h-4 w-4 text-red-600" />
                Nội dung thông báo
              </label>
              <span className={`text-xs font-medium ${charCount > maxChars ? 'text-red-600' : 'text-gray-500'}`}>{charCount}/{maxChars}</span>
            </div>
            <textarea value={form.message} onChange={(e) => setFormField('message', e.target.value)} rows={6} maxLength={maxChars} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none" placeholder="Nhập nội dung chi tiết thông báo..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                <Target className="h-4 w-4 text-red-600" />
                Phạm vi gửi
              </label>
              <select value={form.scope} onChange={(e) => handleScopeChange(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium">
                <option value="system"> Toàn hệ thống</option>
                <option value="role"> Theo vai trò</option>
                <option value="class"> Theo lớp</option>
                <option value="department"> Theo khoa</option>
                <option value="activity"> Theo hoạt động</option>
              </select>
            </div>
            {form.scope === 'role' && (
              <div>
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                  <Users className="h-4 w-4 text-red-600" />
                  Chọn vai trò
                </label>
                <select value={form.targetRole} onChange={(e) => setFormField('targetRole', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium">
                  <option value="">-- Chọn vai trò --</option>
                  <option value="ADMIN"> Quản trị viên</option>
                  <option value="GIANG_VIEN"> Giảng viên</option>
                  <option value="SINH_VIEN"> Sinh viên</option>
                </select>
              </div>
            )}
            {form.scope === 'class' && (
              <div>
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-red-600" />
                  Chọn lớp
                </label>
                <select value={form.targetClass} onChange={(e) => setFormField('targetClass', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium">
                  <option value="">-- Chọn lớp --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.ten_lop} - {cls.khoa} ({cls.soLuongSinhVien || 0} SV)</option>
                  ))}
                </select>
              </div>
            )}
            {form.scope === 'department' && (
              <div>
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                  <Building2 className="h-4 w-4 text-red-600" />
                  Tên khoa
                </label>
                <input value={form.targetDepartment} onChange={(e) => setFormField('targetDepartment', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium" placeholder="VD: Công nghệ thông tin" />
              </div>
            )}
            {form.scope === 'activity' && (
              <div>
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                  <Activity className="h-4 w-4 text-red-600" />
                  Chọn hoạt động
                </label>
                <select value={form.activityId} onChange={(e) => setFormField('activityId', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium">
                  <option value="">-- Chọn hoạt động --</option>
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>{activity.ten_hd || activity.ten_hoat_dong || `HD ${activity.id}`}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold">Đặt lại</button>
            <button type="submit" disabled={sending} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed font-semibold">
              <Send className="h-5 w-5" />
              {sending ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </form>
        {showHistory && history.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-red-600" />
              Lịch sử gửi thông báo
            </h3>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} onClick={() => openDetail(item)} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:border-red-300">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getScopeColor(item.scope)}`}>{getScopeIcon(item.scope)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                      <span className="text-xs text-gray-600 flex items-center gap-1"><Users className="h-3 w-3" />{item.recipients} người nhận</span>
                      <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-red-100 text-red-700">{getScopeLabel(item.scope)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Đã gửi
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {detailOpen && selectedNotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeDetail}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    Chi tiết thông báo broadcast
                  </h2>
                  <button
                    onClick={closeDetail}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Tiêu đề</label>
                  <p className="text-lg font-bold text-gray-900">{selectedNotification.title}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Nội dung</label>
                  <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Scope Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Phạm vi gửi</label>
                    <div className={`px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 ${
                      selectedNotification.scope === 'system' ? 'bg-purple-100 text-purple-700' :
                      selectedNotification.scope === 'role' ? 'bg-blue-100 text-blue-700' :
                      selectedNotification.scope === 'class' ? 'bg-green-100 text-green-700' :
                      selectedNotification.scope === 'department' ? 'bg-yellow-100 text-yellow-700' :
                      selectedNotification.scope === 'activity' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getScopeIcon(selectedNotification.scope)}
                      {getScopeLabel(selectedNotification.scope)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Ngày gửi</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      {new Date(selectedNotification.date).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Sender Info */}
                {selectedNotification.senderName && (
                  <div className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Người gửi</label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-medium">{selectedNotification.senderName}</p>
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">
                        {selectedNotification.senderRole}
                      </span>
                    </div>
                  </div>
                )}

                {/* Scope Details */}
                {selectedNotification.roles && selectedNotification.roles.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Vai trò nhận</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedNotification.roles.map((role, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNotification.classes && selectedNotification.classes.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Lớp nhận</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedNotification.classes.map((cls, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipients Info */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Người nhận</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Users className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-lg">{selectedNotification.recipients} người</span>
                  </div>
                  {selectedNotification.recipientsList && selectedNotification.recipientsList.length > 0 && (
                    <div className="mt-3 max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="space-y-2">
                        {selectedNotification.recipientsList.map((recipient, idx) => (
                          <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                            {recipient.ho_ten || recipient.email}
                            <span className="text-xs text-gray-500">({recipient.vai_tro})</span>
                            {recipient.lop && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                {recipient.lop}
                              </span>
                            )}
                          </div>
                        ))}
                        {selectedNotification.recipients > selectedNotification.recipientsList.length && (
                          <div className="text-sm text-gray-500 italic pt-2 border-t border-gray-200">
                            ... và {selectedNotification.recipients - selectedNotification.recipientsList.length} người khác
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-2xl">
                <button 
                  onClick={closeDetail} 
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all font-semibold shadow-lg"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
