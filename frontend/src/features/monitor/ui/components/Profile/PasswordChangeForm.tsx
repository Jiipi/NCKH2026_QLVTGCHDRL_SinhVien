import React from 'react';
import { Save, X, Eye, EyeOff, Key } from 'lucide-react';

/**
 * PasswordChangeForm Component - Form đổi mật khẩu
 */
export default function PasswordChangeForm({ 
  passwordData, 
  setPasswordData, 
  showPasswords, 
  setShowPasswords, 
  handleChangePassword, 
  setChangingPassword 
}) {
  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại *</label>
        <div className="relative">
          <input 
            type={showPasswords.old ? 'text' : 'password'} 
            value={passwordData.old_password} 
            onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })} 
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />
          <button 
            type="button" 
            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới *</label>
        <div className="relative">
          <input 
            type={showPasswords.new ? 'text' : 'password'} 
            value={passwordData.new_password} 
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} 
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            minLength={6} 
          />
          <button 
            type="button" 
            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới *</label>
        <div className="relative">
          <input 
            type={showPasswords.confirm ? 'text' : 'password'} 
            value={passwordData.confirm_password} 
            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} 
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            minLength={6} 
          />
          <button 
            type="button" 
            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <button 
          type="submit" 
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
        >
          <Save className="h-4 w-4" />Đổi mật khẩu
        </button>
        <button 
          type="button" 
          onClick={() => { 
            setChangingPassword(false); 
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' }); 
            setShowPasswords({ old: false, new: false, confirm: false }); 
          }} 
          className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
        >
          <X className="h-4 w-4" />Hủy
        </button>
      </div>
    </form>
  );
}

