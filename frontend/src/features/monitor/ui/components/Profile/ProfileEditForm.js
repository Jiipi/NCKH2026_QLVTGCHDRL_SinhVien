import React from 'react';
import { Save, X } from 'lucide-react';
import AvatarUpload from '../../../../../entities/user/ui/Avatar';

/**
 * ProfileEditForm Component - Form chỉnh sửa profile
 */
export default function ProfileEditForm({ 
  formData, 
  setFormData, 
  profile, 
  handleUpdateProfile, 
  setEditing 
}) {
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
        <input 
          type="text" 
          value={formData.ho_ten} 
          onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input 
          type="email" 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh đại diện</label>
        <AvatarUpload 
          value={formData.anh_dai_dien} 
          onChange={(url) => setFormData({ ...formData, anh_dai_dien: url })} 
          size={200} 
        />
      </div>
      <div className="flex gap-3">
        <button 
          type="submit" 
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
        >
          <Save className="h-4 w-4" />Lưu
        </button>
        <button 
          type="button" 
          onClick={() => { 
            setEditing(false); 
            setFormData({ 
              ho_ten: profile?.ho_ten || '', 
              email: profile?.email || '', 
              anh_dai_dien: profile?.anh_dai_dien || '' 
            }); 
          }} 
          className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
        >
          <X className="h-4 w-4" />Hủy
        </button>
      </div>
    </form>
  );
}

