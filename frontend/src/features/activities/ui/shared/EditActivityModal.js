import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import FileUpload from '../../../shared/ui/FileUpload'; // Assuming FileUpload is a shared component
import { formatDateTimeLocal } from '../../../../shared/lib/dateTime';

export default function EditActivityModal({ isOpen, onClose, activity, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [localActivity, setLocalActivity] = useState(activity);

  useEffect(() => {
    // Reset state when a new activity is passed in
    setLocalActivity(activity);
    setEditMode(false); // Default to view mode
  }, [activity]);

  if (!isOpen || !localActivity) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalActivity(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field, urls) => {
    setLocalActivity(prev => ({ ...prev, [field]: urls }));
  };

  const handleSave = () => {
    onSave(localActivity);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold">Chi tiết hoạt động</h2>
          <div className="flex gap-2">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Edit size={16} /> Chỉnh sửa</button>
            ) : (
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={16} /> Lưu</button>
            )}
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Tên hoạt động *</label>
              <input type="text" name="ten_hd" value={localActivity.ten_hd || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa điểm *</label>
              <input type="text" name="dia_diem" value={localActivity.dia_diem || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm rèn luyện *</label>
              <input type="number" name="diem_rl" value={localActivity.diem_rl ?? ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu *</label>
              <input type="datetime-local" name="ngay_bd" value={formatDateTimeLocal(localActivity.ngay_bd)} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày kết thúc *</label>
              <input type="datetime-local" name="ngay_kt" value={formatDateTimeLocal(localActivity.ngay_kt)} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea name="mo_ta" value={localActivity.mo_ta || ''} onChange={handleInputChange} disabled={!editMode} rows={4} className="mt-1 w-full p-2 border rounded-md disabled:bg-gray-100"></textarea>
            </div>
            {editMode && (
                <div className="md:col-span-2">
                    <FileUpload
                        type="image"
                        multiple={true}
                        label="Hình ảnh hoạt động"
                        value={localActivity.hinh_anh || []}
                        onChange={(urls) => handleFileChange('hinh_anh', urls)}
                    />
                </div>
            )}
            {editMode && (
                <div className="md:col-span-2">
                    <FileUpload
                        type="attachment"
                        multiple={true}
                        label="Tệp đính kèm"
                        value={localActivity.tep_dinh_kem || []}
                        onChange={(urls) => handleFileChange('tep_dinh_kem', urls)}
                    />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

