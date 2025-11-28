import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react';

export default function TeacherPreferencesPage() {
  const [preferences, setPreferences] = useState({
    // Notification settings
    emailNotifications: true,
    smsNotifications: false,
    systemNotifications: true,
    notifyOnNewActivity: true,
    notifyOnStudentRegistration: true,
    notifyOnApproval: true,

    // Display settings
    theme: 'light',
    language: 'vi',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Ho_Chi_Minh',

    // Privacy settings
    showEmail: true,
    showPhone: false,
    allowStudentMessages: true,

    // Other settings
    autoRefresh: true,
    itemsPerPage: 20
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('ÄĂ£ lÆ°u cĂ i Ä‘áº·t thĂ nh cĂ´ng!');
    } catch (error) {
      alert('KhĂ´ng thá»ƒ lÆ°u cĂ i Ä‘áº·t');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Báº¡n cĂ³ cháº¯c muá»‘n khĂ´i phá»¥c cĂ i Ä‘áº·t máº·c Ä‘á»‹nh?')) {
      setPreferences({
        emailNotifications: true,
        smsNotifications: false,
        systemNotifications: true,
        notifyOnNewActivity: true,
        notifyOnStudentRegistration: true,
        notifyOnApproval: true,
        theme: 'light',
        language: 'vi',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Asia/Ho_Chi_Minh',
        showEmail: true,
        showPhone: false,
        allowStudentMessages: true,
        autoRefresh: true,
        itemsPerPage: 20
      });
    }
  };

  return (
    <div className="p-8 mx-auto" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TĂ¹y chá»n</h1>
        <p className="text-gray-600">Cáº¥u hĂ¬nh vĂ  tĂ¹y chá»‰nh há»‡ thá»‘ng</p>
      </div>

      <div className="max-w-4xl">
        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">CĂ i Ä‘áº·t thĂ´ng bĂ¡o</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">ThĂ´ng bĂ¡o qua Email</div>
                  <div className="text-sm text-gray-600">Nháº­n thĂ´ng bĂ¡o qua Ä‘á»‹a chá»‰ email</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">ThĂ´ng bĂ¡o qua SMS</div>
                  <div className="text-sm text-gray-600">Nháº­n thĂ´ng bĂ¡o qua sá»‘ Ä‘iá»‡n thoáº¡i</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">ThĂ´ng bĂ¡o trong há»‡ thá»‘ng</div>
                  <div className="text-sm text-gray-600">Hiá»ƒn thá»‹ thĂ´ng bĂ¡o trĂªn giao diá»‡n</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.systemNotifications}
                  onChange={(e) => setPreferences({...preferences, systemNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Loáº¡i thĂ´ng bĂ¡o</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.notifyOnNewActivity}
                  onChange={(e) => setPreferences({...preferences, notifyOnNewActivity: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">Hoáº¡t Ä‘á»™ng má»›i Ä‘Æ°á»£c táº¡o</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.notifyOnStudentRegistration}
                  onChange={(e) => setPreferences({...preferences, notifyOnStudentRegistration: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">Sinh viĂªn Ä‘Äƒng kĂ½ hoáº¡t Ä‘á»™ng</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.notifyOnApproval}
                  onChange={(e) => setPreferences({...preferences, notifyOnApproval: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">Hoáº¡t Ä‘á»™ng Ä‘Æ°á»£c duyá»‡t/tá»« chá»‘i</span>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Hiá»ƒn thá»‹</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giao diá»‡n
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="light">SĂ¡ng</option>
                <option value="dark">Tá»‘i</option>
                <option value="auto">Tá»± Ä‘á»™ng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NgĂ´n ngá»¯
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="vi">Tiáº¿ng Viá»‡t</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Äá»‹nh dáº¡ng ngĂ y
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sá»‘ má»¥c má»—i trang
              </label>
              <select
                value={preferences.itemsPerPage}
                onChange={(e) => setPreferences({...preferences, itemsPerPage: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Quyá»n riĂªng tÆ°</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Hiá»ƒn thá»‹ email</div>
                <div className="text-sm text-gray-600">Cho phĂ©p sinh viĂªn xem email cá»§a báº¡n</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.showEmail}
                  onChange={(e) => setPreferences({...preferences, showEmail: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Hiá»ƒn thá»‹ sá»‘ Ä‘iá»‡n thoáº¡i</div>
                <div className="text-sm text-gray-600">Cho phĂ©p sinh viĂªn xem sá»‘ Ä‘iá»‡n thoáº¡i cá»§a báº¡n</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.showPhone}
                  onChange={(e) => setPreferences({...preferences, showPhone: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Cho phĂ©p tin nháº¯n tá»« sinh viĂªn</div>
                <div className="text-sm text-gray-600">Sinh viĂªn cĂ³ thá»ƒ gá»­i tin nháº¯n cho báº¡n</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.allowStudentMessages}
                  onChange={(e) => setPreferences({...preferences, allowStudentMessages: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Äang lÆ°u...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                LÆ°u thay Ä‘á»•i
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            KhĂ´i phá»¥c máº·c Ä‘á»‹nh
          </button>
        </div>
      </div>
    </div>
  );
}
