import React from 'react';
import { Bell, Send, Users, Activity, AlertCircle, Sparkles, CheckCircle, Clock, MessageSquare, Target, Calendar, Zap } from 'lucide-react';
import useNotificationBroadcast from '../model/hooks/useNotificationBroadcast';
import { StudentPageHero } from '../../../shared/components/student';

export default function ClassNotifications() {
  const {
    form,
    setFormField,
    resetForm,
    sending,
    feedback,
    stats,
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
  } = useNotificationBroadcast({ defaultScope: 'class', maxChars: 500 });

  // Simulated notification templates
  const templates = [
    { id: 1, name: 'Thông báo hoạt động mới', title: 'Hoạt động mới: [Tên hoạt động]', message: 'Lớp có hoạt động mới. Mời các bạn đăng ký tham gia trước ngày [Hạn].' },
    { id: 2, name: 'Nhắc nhở đăng ký', title: 'Nhắc nhở: Sắp hết hạn đăng ký', message: 'Các hoạt động sau sắp hết hạn đăng ký. Vui lòng đăng ký sớm để không bỏ lỡ.' },
    { id: 3, name: 'Thông báo kết quả', title: 'Thông báo kết quả tham gia', message: 'Kết quả tham gia hoạt động [Tên] đã được công bố. Vui lòng kiểm tra.' },
    { id: 4, name: 'Thông báo quan trọng', title: 'Thông báo quan trọng từ lớp trưởng', message: 'Lớp có thông báo quan trọng. Vui lòng đọc kỹ và thực hiện đầy đủ.' }
  ];

  return (
    <div className="space-y-6">
      <StudentPageHero
        eyebrow="Không gian lớp trưởng"
        title="Gửi thông báo"
        description="Gửi thông báo và cập nhật quan trọng đến sinh viên trong lớp."
        heroIcon={Bell}
        metrics={[
          { icon: MessageSquare, label: 'Tổng', value: stats.total, tone: 'text-indigo-600 dark:text-indigo-300' },
          { icon: Zap, label: 'Tuần này', value: stats.thisWeek, tone: 'text-emerald-600 dark:text-emerald-300' },
          { icon: Users, label: 'Toàn lớp', value: stats.classScope, tone: 'text-cyan-600 dark:text-cyan-300' },
          { icon: Activity, label: 'Hoạt động', value: stats.activityScope, tone: 'text-amber-600 dark:text-amber-300' },
        ]}
        actions={(
          <button
            onClick={toggleHistory}
            className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-indigo-300"
          >
            <Clock className="h-4 w-4" />
            {showHistory ? 'Ẩn lịch sử' : 'Lịch sử'}
          </button>
        )}
      />

      {/* Alert Messages */}
      {feedback.error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-700 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-red-100 rounded-xl mr-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          <span className="font-medium">{feedback.error}</span>
        </div>
      )}
      {feedback.success && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 flex items-center text-green-700 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-green-100 rounded-xl mr-3">
            <CheckCircle className="h-5 w-5" />
          </div>
          <span className="font-medium">{feedback.success}</span>
        </div>
      )}

      {/* Templates */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mẫu thông báo nhanh</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => fillTemplate(template)}
              className="group relative p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all text-left"
            >
              <div className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                {template.name}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {template.message}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={submit} className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8 space-y-6">
        <div>
          <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            Tiêu đề thông báo
          </label>
          <input
            value={form.title}
            onChange={(e) => setFormField('title', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            placeholder="Nhập tiêu đề ngắn gọn, rõ ràng..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex text-sm font-bold text-gray-900 items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-600" />
              Nội dung thông báo
            </label>
            <span className={`text-xs font-medium ${charCount > maxChars ? 'text-red-600' : 'text-gray-500'}`}>
              {charCount}/{maxChars}
            </span>
          </div>
          <textarea
            value={form.message}
            onChange={(e) => setFormField('message', e.target.value)}
            rows={6}
            maxLength={maxChars}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            placeholder="Nhập nội dung chi tiết thông báo..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              Phạm vi gửi
            </label>
            <select
            value={form.scope}
            onChange={(e) => setFormField('scope', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="class">🎓 Toàn lớp</option>
              <option value="activity">📋 Theo hoạt động</option>
            </select>
          </div>
        {form.scope === 'activity' && (
            <div className="md:col-span-2">
              <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                ID hoạt động
              </label>
              <input
              value={form.activityId}
              onChange={(e) => setFormField('activityId', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                placeholder="Nhập ID hoạt động cần gửi thông báo..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
          onClick={resetForm}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
          >
            <Send className="h-5 w-5" />
            {sending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </div>
      </form>

      {/* History Section */}
      {showHistory && history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Lịch sử gửi</h3>
          </div>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icon badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${item.scope === 'class'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-green-100 text-green-600'
                    }`}>
                    {item.scope === 'class' ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <Activity className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-base mb-2 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center flex-wrap gap-3">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.date).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {item.recipients} người nhận
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${item.scope === 'class'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        {item.scope === 'class' ? 'Toàn lớp' : 'Hoạt động'}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Đã gửi
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeDetail}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Chi tiết thông báo
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
                  {selectedNotification.message?.split('[Phạm vi:')[0]?.trim()}
                </p>
              </div>

              {/* Scope Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Phạm vi gửi</label>
                  <div className={`px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 ${selectedNotification.scope === 'class'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {selectedNotification.scope === 'class' ? (
                      <>
                        <Users className="h-4 w-4" />
                        Toàn lớp
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4" />
                        Theo hoạt động
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Ngày gửi</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    {new Date(selectedNotification.date).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Activity Info if available */}
              {selectedNotification.activity && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Thông tin hoạt động
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Tên hoạt động</label>
                      <p className="text-gray-900 font-medium">{selectedNotification.activity.ten_hd}</p>
                    </div>
                    {selectedNotification.activity.ma_hd && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Mã hoạt động</label>
                        <p className="text-gray-900 font-mono">{selectedNotification.activity.ma_hd}</p>
                      </div>
                    )}
                    {selectedNotification.activity.dia_diem && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Địa điểm</label>
                        <p className="text-gray-900">{selectedNotification.activity.dia_diem}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Ngày bắt đầu</label>
                        <p className="text-gray-900">{new Date(selectedNotification.activity.ngay_bd).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Ngày kết thúc</label>
                        <p className="text-gray-900">{new Date(selectedNotification.activity.ngay_kt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    {selectedNotification.activity.diem_rl && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Điểm rèn luyện</label>
                        <p className="font-bold text-lg text-indigo-600">{selectedNotification.activity.diem_rl} điểm</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recipients Info */}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Người nhận</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span className="font-bold text-lg">{selectedNotification.recipients} người</span>
                </div>
                {selectedNotification.recipientsList && selectedNotification.recipientsList.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="space-y-2">
                      {selectedNotification.recipientsList.slice(0, 10).map((recipient, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          • {recipient.ho_ten || recipient.email}
                        </div>
                      ))}
                      {selectedNotification.recipientsList.length > 10 && (
                        <div className="text-sm text-gray-500 italic">
                          ... và {selectedNotification.recipientsList.length - 10} người khác
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
