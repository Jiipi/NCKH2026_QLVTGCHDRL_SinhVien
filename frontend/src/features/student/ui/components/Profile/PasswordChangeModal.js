import React from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

export default function PasswordChangeModal({
  visible,
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  onClose,
  onSubmit
}) {
  if (!visible) return null;

  const fields = [
    { key: 'old_password', label: 'Mật khẩu hiện tại', toggleKey: 'old' },
    { key: 'new_password', label: 'Mật khẩu mới', toggleKey: 'new' },
    { key: 'confirm_password', label: 'Xác nhận mật khẩu mới', toggleKey: 'confirm' }
  ];

  const handleToggle = (toggleKey) => {
    setShowPasswords((prev) => ({ ...prev, [toggleKey]: !prev?.[toggleKey] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-yellow-600" />
          Đổi mật khẩu
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map(({ key, label, toggleKey }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={showPasswords?.[toggleKey] ? 'text' : 'password'}
                  value={passwordData[key]}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleToggle(toggleKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords?.[toggleKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

