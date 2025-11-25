import React from 'react';
import { X, Edit, Save, Eye } from 'lucide-react';
import FileUpload from '../../../../../shared/ui/FileUpload';

/**
 * ActivityEditModal Component - Modal chỉnh sửa/xem chi tiết hoạt động
 */
export default function ActivityEditModal({
  isOpen,
  activity,
  editMode,
  onClose,
  onEdit,
  onSave,
  onActivityChange
}) {
  if (!isOpen || !activity) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Chi tiết hoạt động
          </h2>
          <div className="flex items-center gap-2">
            {!editMode ? (
              <button 
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </button>
            ) : (
              <button 
                onClick={onSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Lưu
              </button>
            )}
            <button 
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên hoạt động */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên hoạt động *
              </label>
              <input
                type="text"
                value={activity.ten_hd || ''}
                onChange={(e) => editMode && onActivityChange({...activity, ten_hd: e.target.value})}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Địa điểm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm *
              </label>
              <input
                type="text"
                value={activity.dia_diem || ''}
                onChange={(e) => editMode && onActivityChange({...activity, dia_diem: e.target.value})}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Điểm rèn luyện */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điểm rèn luyện *
              </label>
              <input
                type="number"
                step="0.5"
                value={activity.diem_rl ?? ''}
                onChange={(e) => {
                  if (editMode) {
                    onActivityChange({
                      ...activity, 
                      diem_rl: e.target.value
                    });
                  }
                }}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu *
              </label>
              <input
                type="datetime-local"
                value={activity.ngay_bd ? new Date(activity.ngay_bd).toISOString().slice(0, 16) : ''}
                onChange={(e) => editMode && onActivityChange({...activity, ngay_bd: e.target.value})}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc *
              </label>
              <input
                type="datetime-local"
                value={activity.ngay_kt ? new Date(activity.ngay_kt).toISOString().slice(0, 16) : ''}
                onChange={(e) => editMode && onActivityChange({...activity, ngay_kt: e.target.value})}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Hạn đăng ký */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hạn đăng ký
              </label>
              <input
                type="datetime-local"
                value={activity.han_dk ? new Date(activity.han_dk).toISOString().slice(0, 16) : ''}
                onChange={(e) => editMode && onActivityChange({...activity, han_dk: e.target.value})}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Số lượng tối đa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tối đa
              </label>
              <input
                type="number"
                value={activity.sl_toi_da ?? ''}
                onChange={(e) => {
                  if (editMode) {
                    onActivityChange({
                      ...activity, 
                      sl_toi_da: e.target.value
                    });
                  }
                }}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={activity.trang_thai || 'cho_duyet'}
                onChange={(e) => editMode && onActivityChange({...activity, trang_thai: e.target.value})}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              >
                <option value="cho_duyet">Chờ duyệt</option>
                <option value="da_duyet">Đã duyệt</option>
                <option value="tu_choi">Từ chối</option>
                <option value="da_huy">Đã hủy</option>
                <option value="ket_thuc">Kết thúc</option>
              </select>
            </div>

            {/* Mô tả */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={activity.mo_ta || ''}
                onChange={(e) => editMode && onActivityChange({...activity, mo_ta: e.target.value})}
                disabled={!editMode}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 resize-vertical"
              />
            </div>

            {/* Hình ảnh hoạt động - Upload in Edit Mode */}
            {editMode && (
              <div className="md:col-span-2">
                <FileUpload
                  type="image"
                  multiple={true}
                  maxFiles={5}
                  label="Hình ảnh hoạt động (Ảnh đầu tiên là ảnh nền)"
                  value={activity.hinh_anh || []}
                  onChange={(urls) => onActivityChange({...activity, hinh_anh: urls})}
                  disabled={!editMode}
                />
                
                {/* Hiển thị ảnh để chọn làm ảnh nền */}
                {activity.hinh_anh && activity.hinh_anh.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chọn ảnh nền (Click vào ảnh để đặt làm ảnh nền)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {activity.hinh_anh.map((url, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            // Di chuyển ảnh được chọn lên vị trí đầu tiên
                            const newImages = [url, ...activity.hinh_anh.filter(img => img !== url)];
                            onActivityChange({...activity, hinh_anh: newImages});
                          }}
                          className={`relative cursor-pointer group ${idx === 0 ? 'ring-4 ring-indigo-500' : ''}`}
                        >
                          <img 
                            src={url} 
                            alt={`Activity ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-all"
                          />
                          {idx === 0 && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              Ảnh nền
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                            <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              {idx === 0 ? 'Ảnh nền hiện tại' : 'Đặt làm ảnh nền'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Ảnh đầu tiên (có viền xanh) sẽ được hiển thị làm ảnh nền của hoạt động
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hình ảnh hoạt động - Display in View Mode */}
            {!editMode && activity.hinh_anh && activity.hinh_anh.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh hoạt động
                </label>
                
                {/* Ảnh nền chính - Hiển thị lớn */}
                <div className="mb-4">
                  <div className="relative">
                    <img 
                      src={activity.hinh_anh[0]} 
                      alt="Ảnh nền hoạt động"
                      className="w-full h-64 object-cover rounded-xl border-4 border-indigo-200 shadow-lg"
                    />
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-full font-semibold shadow-md">
                      📸 Ảnh nền
                    </div>
                  </div>
                </div>
                
                {/* Các ảnh còn lại - Hiển thị nhỏ */}
                {activity.hinh_anh.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Ảnh chi tiết ({activity.hinh_anh.length - 1} ảnh)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {activity.hinh_anh.slice(1).map((url, idx) => (
                        <img 
                          key={idx}
                          src={url} 
                          alt={`Activity detail ${idx + 2}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tệp đính kèm - Upload in Edit Mode */}
            {editMode && (
              <div className="md:col-span-2">
                <FileUpload
                  type="attachment"
                  multiple={true}
                  maxFiles={3}
                  label="Tệp đính kèm"
                  value={activity.tep_dinh_kem || []}
                  onChange={(urls) => onActivityChange({...activity, tep_dinh_kem: urls})}
                  disabled={!editMode}
                />
              </div>
            )}

            {/* Tệp đính kèm - Display in View Mode */}
            {!editMode && activity.tep_dinh_kem && activity.tep_dinh_kem.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tệp đính kèm
                </label>
                <div className="space-y-2">
                  {activity.tep_dinh_kem.map((url, idx) => {
                    const filename = url.split('/').pop();
                    // ✅ Fix: Prepend backend base URL for attachments
                    const baseURL = (typeof window !== 'undefined' && window.location)
                      ? window.location.origin.replace(/\/$/, '') + '/api'
                      : (process.env.REACT_APP_API_URL || 'http://dacn_backend_dev:3001/api');
                    const backendBase = baseURL.replace('/api', ''); // Remove /api to get base server URL
                    const downloadUrl = url.startsWith('http') ? url : `${backendBase}${url}`;
                    
                    return (
                      <a 
                        key={idx}
                        href={downloadUrl}
                        download={filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-indigo-600 hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium truncate">{filename}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

