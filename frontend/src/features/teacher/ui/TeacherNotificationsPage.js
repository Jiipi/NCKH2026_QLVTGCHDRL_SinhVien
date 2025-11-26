import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, Activity, AlertCircle, Sparkles, CheckCircle, Clock, MessageSquare, Target, Calendar } from 'lucide-react';
import http from '../../../shared/api/http';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import { useSemesterData } from '../../../shared/hooks';

export default function TeacherNotificationsPage() {
  const { showSuccess, showError } = useNotification();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scope, setScope] = useState('class');
  const [activityId, setActivityId] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sentHistory, setSentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [semester, setSemester] = useState(() => { try { return sessionStorage.getItem('current_semester') || ''; } catch (_) { return ''; } });
  const { options: semesterOptions, currentSemester } = useSemesterData(semester);
  const [activityOptions, setActivityOptions] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, classScope: 0, activityScope: 0 });

  const templates = [
    { id: 1, name: 'Thông báo hoạt động mới', title: 'Hoạt động mới: [Tên hoạt động]', message: 'Có hoạt động mới. Mời các bạn đăng ký tham gia trước ngày [Hạn].' },
    { id: 2, name: 'Nhắc nhở đăng ký', title: 'Nhắc nhở: Sắp hết hạn đăng ký', message: 'Các hoạt động sau sắp hết hạn đăng ký. Vui lòng đăng ký sớm để không bỏ lỡ.' },
    { id: 3, name: 'Thông báo kết quả', title: 'Thông báo kết quả tham gia', message: 'Kết quả tham gia hoạt động [Tên] đã được công bố. Vui lòng kiểm tra.' },
    { id: 4, name: 'Thông báo quan trọng', title: 'Thông báo quan trọng từ giảng viên', message: 'Có thông báo quan trọng. Vui lòng đọc kỹ và thực hiện đầy đủ.' }
  ];

  useEffect(() => { loadSentHistory(); }, []);
  // Initialize semester when options are loaded
  useEffect(() => {
    if (semesterOptions.length > 0) {
      const semesterInOptions = semesterOptions.some(opt => opt.value === semester);
      if (!semester || !semesterInOptions) {
        const currentInOptions = currentSemester && semesterOptions.some(opt => opt.value === currentSemester);
        const newSemester = currentInOptions ? currentSemester : semesterOptions[0]?.value;
        if (newSemester && newSemester !== semester) {
          setSemester(newSemester);
        }
      }
    }
  }, [semesterOptions, currentSemester, semester]);
  useEffect(() => { if (semester) { try { sessionStorage.setItem('current_semester', semester); } catch (_) {} } }, [semester]);
  useEffect(() => { if (scope === 'activity' && semester) { loadActivitiesForSemester(semester); } }, [scope, semester]);

  const loadSentHistory = async () => {
    try {
      const response = await http.get('/core/notifications/sent');
      const data = response.data?.data || response.data;
      if (data.history && Array.isArray(data.history)) {
        setSentHistory(data.history);
        const classCount = data.history.filter(item => item.scope === 'class').length;
        const activityCount = data.history.filter(item => item.scope === 'activity').length;
        setStats({ total: data.history.length, classScope: classCount, activityScope: activityCount });
      }
    } catch (err) { console.error('Error loading sent history:', err); }
  };

  const loadActivitiesForSemester = async (semesterValue) => {
    try {
      setActivityLoading(true);
      const params = { semester: semesterValue };
      const response = await http.get('/core/activities', { params });
      const payload = response.data?.data || response.data || {};
      const items = payload.items || payload.data || (Array.isArray(payload) ? payload : []);
      const list = Array.isArray(items) ? items : [];
      const options = list.map(a => ({ value: a.id, label: a.ten_hd }));
      setActivityOptions(options);
    } catch (err) { console.error('Error loading activities for semester:', err); setActivityOptions([]); }
    finally { setActivityLoading(false); }
  };

  const handleNotificationClick = async (notification) => {
    try {
      const response = await http.get(`/core/notifications/sent/${notification.id}`);
      const data = response.data?.data || response.data;
      setSelectedNotification(data);
      setShowDetailModal(true);
    } catch (err) { showError('Không thể tải chi tiết thông báo'); }
  };

  const handleSend = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!title || !message) { setError('Vui lòng nhập tiêu đề và nội dung'); return; }
    if (scope === 'activity' && !semester) { setError('Vui lòng chọn học kỳ khi gửi theo hoạt động'); return; }
    if (scope === 'activity' && !activityId) { setError('Vui lòng chọn hoạt động trong học kỳ đã chọn'); return; }
    try {
      setSending(true);
      let currentUserId = '2de13832-342f-4a60-9996-04fe512d2549';
      try { const t = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null; if (t && t.split('.').length === 3) { const payloadPart = JSON.parse(atob(t.split('.')[1])); if (payloadPart?.sub) currentUserId = payloadPart.sub; } } catch (_) {}
      const payload = { tieu_de: title, noi_dung: message, nguoi_nhan_id: currentUserId, scope, activityId: scope === 'activity' ? activityId : undefined, muc_do_uu_tien: 'trung_binh', phuong_thuc_gui: 'trong_he_thong' };
      await http.post('/core/notifications', payload);
      showSuccess('Đã gửi thông báo thành công! 🎉');
      setTitle(''); setMessage(''); setActivityId('');
      loadSentHistory();
    } catch (err) { const apiMsg = err?.response?.data?.message; showError(apiMsg ? String(apiMsg) : 'Không thể gửi thông báo'); }
    finally { setSending(false); }
  };

  const applyTemplate = (template) => { setTitle(template.title); setMessage(template.message); };
  const charCount = message.length; const maxChars = 500;

  return (
    <div className="space-y-6">
      <div className="relative min-h-[280px]">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '50px 50px', animation: 'grid-move 20s linear infinite' }}></div>
        </div>
        <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>
        <div className="relative z-10 p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative"><div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div><div className="relative bg-black text-yellow-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-yellow-400">🔔 THÔNG BÁO</div></div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>{stats.total} ĐÃ GỬI</div></div>
              </div>
              <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"><Clock className="h-4 w-4" />{showHistory ? 'Ẩn lịch sử' : 'Lịch sử'}</button>
            </div>
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">G</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ử</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">I</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ô</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">G</span>
                <br />
                <span className="relative inline-block mt-2"><span className="relative z-10 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">BÁO</span><div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div></span>
              </h1>
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">Gửi thông báo và cập nhật quan trọng đến sinh viên trong các lớp chủ nhiệm</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="group relative"><div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div><div className="relative bg-gradient-to-br from-cyan-400 to-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"><MessageSquare className="h-6 w-6 text-black mb-2" /><p className="text-3xl font-black text-black">{stats.total}</p><p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG</p></div></div>
              <div className="group relative"><div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div><div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"><Users className="h-6 w-6 text-black mb-2" /><p className="text-3xl font-black text-black">{stats.classScope}</p><p className="text-xs font-black text-black/70 uppercase tracking-wider">TOÀN LỚP</p></div></div>
              <div className="group relative"><div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div><div className="relative bg-pink-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"><Activity className="h-6 w-6 text-black mb-2" /><p className="text-3xl font-black text-black">{stats.activityScope}</p><p className="text-xs font-black text-black/70 uppercase tracking-wider">HOẠT ĐỘNG</p></div></div>
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `@keyframes grid-move {0%{transform:translateY(0);}100%{transform:translateY(50px);}}@keyframes bounce-slow{0%,100%{transform:translateY(0) rotate(45deg);}50%{transform:translateY(-20px) rotate(45deg);}}@keyframes spin-slow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}.animate-bounce-slow{animation:bounce-slow 3s ease-in-out infinite;}.animate-spin-slow{animation:spin-slow 8s linear infinite;}`}} />
      </div>

      {error && (<div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-700 shadow-lg"><div className="p-2 bg-red-100 rounded-xl mr-3"><AlertCircle className="h-5 w-5" /></div><span className="font-medium">{error}</span></div>)}
      {success && (<div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 flex items-center text-green-700 shadow-lg"><div className="p-2 bg-green-100 rounded-xl mr-3"><CheckCircle className="h-5 w-5" /></div><span className="font-medium">{success}</span></div>)}

      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
        <div className="flex items-center gap-2 mb-5"><Sparkles className="h-5 w-5 text-purple-600" /><h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Mẫu thông báo nhanh</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {templates.map(template => (
            <button key={template.id} onClick={() => applyTemplate(template)} className="group relative p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all text-left">
              <div className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{template.name}</div>
              <div className="text-xs text-gray-600 line-clamp-2">{template.message}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8 space-y-6">
        <div>
          <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2"><MessageSquare className="h-4 w-4 text-indigo-600" />Tiêu đề thông báo</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" placeholder="Nhập tiêu đề ngắn gọn, rõ ràng..." />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2"><label className="flex text-sm font-bold text-gray-900 items-center gap-2"><Bell className="h-4 w-4 text-indigo-600" />Nội dung thông báo</label><span className={`text-xs font-medium ${charCount > maxChars ? 'text-red-600' : 'text-gray-500'}`}>{charCount}/{maxChars}</span></div>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={maxChars} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none" placeholder="Nhập nội dung chi tiết thông báo..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2"><Target className="h-4 w-4 text-indigo-600" />Phạm vi gửi</label>
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium">
              <option value="class">🎓 Toàn lớp</option>
              <option value="activity">📋 Theo hoạt động</option>
            </select>
          </div>
          {scope === 'activity' && (
            <>
              <div>
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2"><Calendar className="h-4 w-4 text-indigo-600" />Học kỳ</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium">
                  {(semesterOptions || []).map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2"><Activity className="h-4 w-4 text-indigo-600" />Hoạt động trong học kỳ</label>
                <select value={activityId} onChange={(e) => setActivityId(e.target.value)} disabled={activityLoading || !semester} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium disabled:bg-gray-100 disabled:text-gray-500">
                  <option value="">{activityLoading ? 'Đang tải...' : '— Chọn hoạt động —'}</option>
                  {activityOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => { setTitle(''); setMessage(''); setActivityId(''); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold">Đặt lại</button>
          <button type="submit" disabled={sending} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed font-semibold"><Send className="h-5 w-5" />{sending ? 'Đang gửi...' : 'Gửi thông báo'}</button>
        </div>
      </form>

      {showHistory && sentHistory.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6"><Clock className="h-6 w-6 text-indigo-600" /><h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide">Lịch sử gửi</h3></div>
          <div className="space-y-4">
            {sentHistory.map((item) => (
              <div key={item.id} onClick={() => handleNotificationClick(item)} className="group relative cursor-pointer">
                <div className={`absolute inset-0 transform translate-x-2 translate-y-2 rounded-xl ${item.scope === 'class' ? 'bg-indigo-400' : 'bg-green-400'}`}></div>
                <div className={`relative flex items-center gap-4 p-5 rounded-xl border-4 border-black transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 ${item.scope === 'class' ? 'bg-gradient-to-r from-indigo-100 to-purple-100' : 'bg-gradient-to-r from-green-100 to-emerald-100'}`}>
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center border-4 border-black ${item.scope === 'class' ? 'bg-indigo-400' : 'bg-green-400'}`}>
                    {item.scope === 'class' ? (<Users className="h-6 w-6 text-black" />) : (<Activity className="h-6 w-6 text-black" />)}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-base mb-2">{item.title}</p>
                    <div className="flex items-center flex-wrap gap-3">
                      <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                      <span className="text-xs font-bold text-gray-600 flex items-center gap-1"><Users className="h-3 w-3" />{item.recipients} người</span>
                      <span className={`text-xs px-2 py-1 rounded-lg font-black border-2 ${item.scope === 'class' ? 'bg-indigo-200 text-indigo-900 border-indigo-400' : 'bg-green-200 text-green-900 border-green-400'}`}>{item.scope === 'class' ? '🎓 TOÀN LỚP' : '📋 HOẠT ĐỘNG'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-400 text-black rounded-lg text-xs font-black border-2 border-black"><CheckCircle className="h-4 w-4" />ĐÃ GỬI</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6" />Chi tiết thông báo</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><span className="text-2xl">×</span></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div><label className="text-sm font-semibold text-gray-600 mb-2 block">Tiêu đề</label><p className="text-lg font-bold text-gray-900">{selectedNotification.title}</p></div>
              <div><label className="text-sm font-semibold text-gray-600 mb-2 block">Nội dung</label><p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-200">{selectedNotification.message?.split('[Phạm vi:')[0]?.trim()}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Phạm vi gửi</label>
                  <div className={`px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 ${selectedNotification.scope === 'class' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedNotification.scope === 'class' ? (<><Users className="h-4 w-4" />Toàn lớp</>) : (<><Activity className="h-4 w-4" />Theo hoạt động</>)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Ngày gửi</label>
                  <p className="text-gray-900 flex items-center gap-2"><Calendar className="h-4 w-4 text-indigo-600" />{new Date(selectedNotification.date).toLocaleString('vi-VN')}</p>
                </div>
              </div>
              {selectedNotification.activity && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-600" />Thông tin hoạt động</h3>
                  <div className="space-y-3">
                    <div><label className="text-sm font-semibold text-gray-600">Tên hoạt động</label><p className="text-gray-900 font-medium">{selectedNotification.activity.ten_hd}</p></div>
                    {selectedNotification.activity.ma_hd && (<div><label className="text-sm font-semibold text-gray-600">Mã hoạt động</label><p className="text-gray-900 font-mono">{selectedNotification.activity.ma_hd}</p></div>)}
                    {selectedNotification.activity.dia_diem && (<div><label className="text-sm font-semibold text-gray-600">Địa điểm</label><p className="text-gray-900">{selectedNotification.activity.dia_diem}</p></div>)}
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-semibold text-gray-600">Ngày bắt đầu</label><p className="text-gray-900">{new Date(selectedNotification.activity.ngay_bd).toLocaleDateString('vi-VN')}</p></div>
                      <div><label className="text-sm font-semibold text-gray-600">Ngày kết thúc</label><p className="text-gray-900">{new Date(selectedNotification.activity.ngay_kt).toLocaleDateString('vi-VN')}</p></div>
                    </div>
                    {selectedNotification.activity.diem_rl && (<div><label className="text-sm font-semibold text-gray-600">Điểm rèn luyện</label><p className="font-bold text-lg text-indigo-600">{selectedNotification.activity.diem_rl} điểm</p></div>)}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Người nhận</label>
                <div className="flex items-center gap-2 text-gray-900"><Users className="h-5 w-5 text-indigo-600" /><span className="font-bold text-lg">{selectedNotification.recipients} người</span></div>
                {selectedNotification.recipientsList && selectedNotification.recipientsList.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="space-y-2">
                      {selectedNotification.recipientsList.slice(0, 10).map((recipient, idx) => (<div key={idx} className="text-sm text-gray-700">• {recipient.ho_ten || recipient.email}</div>))}
                      {selectedNotification.recipientsList.length > 10 && (<div className="text-sm text-gray-500 italic">... và {selectedNotification.recipientsList.length - 10} người khác</div>)}
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
