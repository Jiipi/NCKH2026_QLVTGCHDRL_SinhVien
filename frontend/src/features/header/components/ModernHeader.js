import { Link } from 'react-router-dom';
import React from 'react';
import {
  Bell, Search, Sun, Moon, User, Settings, LogOut, Menu, X, ChevronDown, GraduationCap
} from 'lucide-react';
import { useModernHeader } from '../hooks/useModernHeader';
import { getUserAvatar, getAvatarGradient } from '../../../shared/lib/avatar';

const getRoleColor = (context) => {
  if (context.isAdmin) return 'from-red-500 to-orange-500';
  if (context.isTeacher) return 'from-purple-500 to-indigo-500';
  if (context.isMonitor) return 'from-green-500 to-teal-500';
  return 'from-blue-500 to-cyan-500';
};

const getRoleLabel = (context) => {
  if (context.isAdmin) return 'Quản trị viên';
  if (context.isTeacher) return 'Giảng viên';
  if (context.isMonitor) return 'Lớp trưởng';
  return 'Sinh viên';
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'warning': return '⚠️';
    case 'success': return '✅';
    default: return 'ℹ️';
  }
};

export default function ModernHeader({ isMobile, onMenuClick }) {
  const {
    profile, profileOpen, notificationOpen, notifications, searchQuery, theme, detail, unreadCount, isAuthenticated,
    isAdmin, isTeacher, isMonitor,
    dropdownRef, buttonRef, notifRef,
    setProfileOpen, setNotificationOpen, setSearchQuery, setDetail, toggleTheme, handleLogout, loadNotifications,
    markAllAsRead, openDetail, handleSearch
  } = useModernHeader();

  const roleContext = { isAdmin, isTeacher, isMonitor };
  const roleColor = getRoleColor(roleContext);
  const roleLabel = getRoleLabel(roleContext);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {isMobile && onMenuClick && (
            <button onClick={onMenuClick} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Open menu">
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`relative p-2 bg-gradient-to-br ${roleColor} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                <GraduationCap className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Điểm Rèn Luyện</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quản lý chuyên nghiệp</p>
              </div>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-800" />
            </div>
          </form>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
                {theme === 'light' ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-gray-300" />}
              </button>

              <div className="relative" ref={notifRef}>
                <button onClick={() => { setNotificationOpen(!notificationOpen); if (!notificationOpen) loadNotifications(); }} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{unreadCount}</span>}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-700">
                    <div className="p-4 bg-blue-600 text-white"><h3 className="text-lg font-bold">Thông báo</h3></div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center"><p className="text-gray-500">Không có thông báo mới.</p></div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => openDetail(n.id)} className={`p-4 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${n.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{getNotificationIcon(n.type)}</div>
                              <div>
                                <h4 className="font-semibold text-sm">{n.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                                <span className="text-xs text-gray-500 mt-2 block">{n.time}</span>
                              </div>
                              {n.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-slate-700/50 border-t dark:border-slate-700">
                        <button onClick={markAllAsRead} className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400">Đánh dấu tất cả đã đọc</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button ref={buttonRef} onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
                  {(() => {
                    const avatar = getUserAvatar(profile);
                    return avatar.hasValidAvatar ? (
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg"><img src={avatar.src} alt={avatar.alt} className="w-full h-full object-cover" /></div>
                    ) : (
                      <div className={`relative w-9 h-9 bg-gradient-to-br ${getAvatarGradient(profile?.ho_ten || '')} rounded-xl flex items-center justify-center text-white font-bold`}>{avatar.fallback}</div>
                    );
                  })()}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold">{profile?.ho_ten || 'User'}</p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-700">
                    <div className={`p-4 bg-gradient-to-r ${roleColor} text-white`}>
                       {/* ... Profile Header ... */}
                    </div>
                    <div className="py-2">
                      {/* ... Menu Items ... */}
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 w-full hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="h-5 w-5" /><span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700">
              Đăng nhập
            </Link>
          )}
        </div>

        {profile && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-slate-800" />
            </form>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full">
            {/* ... Notification Detail Modal ... */}
          </div>
        </div>
      )}
    </header>
  );
}

