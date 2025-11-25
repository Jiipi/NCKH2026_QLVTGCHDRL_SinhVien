import React from 'react';
import { MessageSquare, Bell, Target, Calendar, Activity, Send } from 'lucide-react';

/**
 * NotificationForm Component - Form gửi thông báo
 */
export default function NotificationForm({
  title,
  setTitle,
  message,
  setMessage,
  scope,
  setScope,
  activityId,
  setActivityId,
  semester,
  setSemester,
  semesterOptions,
  activityOptions,
  activityLoading,
  sending,
  charCount,
  maxChars,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8 space-y-6">
      <div>
        <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          Tiêu đề thông báo
        </label>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
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
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
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
            value={scope} 
            onChange={(e) => setScope(e.target.value)} 
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="class">🎓 Toàn lớp</option>
            <option value="activity">📋 Theo hoạt động</option>
          </select>
        </div>
        {scope === 'activity' && (
          <>
            <div>
              <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                Học kỳ
              </label>
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              >
                {(semesterOptions || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Hoạt động trong học kỳ
              </label>
              <select 
                value={activityId} 
                onChange={(e) => setActivityId(e.target.value)} 
                disabled={activityLoading || !semester} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">{activityLoading ? 'Đang tải...' : '— Chọn hoạt động —'}</option>
                {activityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <button 
          type="button" 
          onClick={() => { setTitle(''); setMessage(''); setActivityId(''); }} 
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
  );
}

