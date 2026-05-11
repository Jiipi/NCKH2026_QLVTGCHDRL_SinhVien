import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  FileCheck,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';

const ACTION_TYPE_STYLES = {
  approval: {
    bg: 'bg-emerald-50/70 dark:bg-emerald-400/10',
    border: 'border-emerald-200/70 dark:border-emerald-400/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-400/10',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle
  },
  create: {
    bg: 'bg-orange-50/70 dark:bg-orange-400/10',
    border: 'border-orange-200/70 dark:border-orange-400/20',
    iconBg: 'bg-orange-100 dark:bg-orange-400/10',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300',
    iconColor: 'text-orange-600 dark:text-orange-300',
    icon: Activity
  },
  update: {
    bg: 'bg-sky-50/70 dark:bg-sky-400/10',
    border: 'border-sky-200/70 dark:border-sky-400/20',
    iconBg: 'bg-sky-100 dark:bg-sky-400/10',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
    iconColor: 'text-sky-600 dark:text-sky-300',
    icon: FileCheck
  },
  account: {
    bg: 'bg-indigo-50/70 dark:bg-indigo-400/10',
    border: 'border-indigo-200/70 dark:border-indigo-400/20',
    iconBg: 'bg-indigo-100 dark:bg-indigo-400/10',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300',
    iconColor: 'text-indigo-600 dark:text-indigo-300',
    icon: UserCheck
  },
  incident: {
    bg: 'bg-rose-50/70 dark:bg-rose-400/10',
    border: 'border-rose-200/70 dark:border-rose-400/20',
    iconBg: 'bg-rose-100 dark:bg-rose-400/10',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
    iconColor: 'text-rose-600 dark:text-rose-300',
    icon: AlertCircle
  },
  default: {
    bg: 'bg-slate-50/70 dark:bg-white/5',
    border: 'border-slate-200/70 dark:border-white/10',
    iconBg: 'bg-slate-100 dark:bg-white/10',
    badge: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300',
    iconColor: 'text-slate-600 dark:text-slate-300',
    icon: Bell
  }
};

const formatActionTime = (value) => {
  if (!value) return 'Vừa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa cập nhật';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminTabContent({
  activeTab,
  setActiveTab,
  adminActionFeed,
  semesters,
  loadingSemesters,
  pendingRegistrations,
  pendingRegistrationsCount,
  loadingRegistrations,
  processingId,
  onApprove,
  onReject
}) {
  const navigate = useNavigate();
  const tabs = [
    { key: 'recent', label: 'Hoạt động gần đây', icon: Bell },
    { key: 'semesters', label: 'Danh sách học kỳ', icon: Calendar },
    { key: 'approvals', label: 'Phê duyệt đăng ký', icon: FileCheck }
  ];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="border-b border-white/60 dark:border-white/10">
        <div className="flex flex-wrap gap-2 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'border border-white/60 bg-white/45 text-slate-600 hover:bg-white/75 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div
          className="max-h-[500px] overflow-y-auto pr-2 space-y-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f1 #f3f4f6' }}
        >
          {activeTab === 'recent' && (
            <RecentTabContent adminActionFeed={adminActionFeed} navigate={navigate} />
          )}

          {activeTab === 'semesters' && (
            <SemestersTabContent
              semesters={semesters}
              loadingSemesters={loadingSemesters}
              navigate={navigate}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsTabContent
              pendingRegistrations={pendingRegistrations}
              pendingRegistrationsCount={pendingRegistrationsCount}
              loadingRegistrations={loadingRegistrations}
              processingId={processingId}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RecentTabContent({ adminActionFeed, navigate }) {
  if (!adminActionFeed || adminActionFeed.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">Chưa có ghi nhận thao tác quản trị nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {adminActionFeed.map((action) => {
        const style = ACTION_TYPE_STYLES[action.type] || ACTION_TYPE_STYLES.default;
        const Icon = style.icon;
        return (
          <div
            key={action.key}
            className={`rounded-2xl border ${style.border} ${style.bg} p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.iconBg}`}>
                <Icon className={`h-5 w-5 ${style.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{action.title}</p>
                <p className="text-xs text-gray-600 mb-3">{action.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatActionTime(action.timestamp)}
                  </span>
                  {action.statusLabel && (
                    <span className={`px-2 py-0.5 rounded-full ${style.badge} font-semibold`}>
                      {action.statusLabel}
                    </span>
                  )}
                </div>
              </div>
              {action.actionPath && (
                <button
                  onClick={() => navigate(action.actionPath)}
                  className="whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-700 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  {action.actionLabel || 'Chi tiết'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SemestersTabContent({ semesters, loadingSemesters, navigate }) {
  if (loadingSemesters) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mx-auto mb-3"></div>
        <p className="text-gray-600 text-sm">Đang tải danh sách học kỳ...</p>
      </div>
    );
  }

  if (!semesters || semesters.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">Chưa có học kỳ nào trong hệ thống</p>
        <button
          onClick={() => navigate('/admin/semesters')}
          className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Quản lý học kỳ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {semesters.map((semester, idx) => (
        <div
          key={semester.value || semester.id || idx}
          className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-md ${
            semester.is_active ? 'border-indigo-200/70 bg-indigo-50/70 dark:border-indigo-400/20 dark:bg-indigo-400/10' : 'border-white/60 bg-white/45 dark:border-white/10 dark:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              semester.is_active ? 'bg-purple-600 text-white' : 'bg-gray-400 text-white'
            }`}>
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm mb-1 truncate">
                {semester.label || semester.name || semester.ten_hoc_ky || 'Học kỳ'}
              </p>
              <p className="text-xs text-gray-600">
                {semester.value ? `Mã: ${semester.value}` : 'Chưa có mã học kỳ'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            semester.is_active ? 'bg-green-100 text-green-700' : semester.is_locked ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {semester.is_active ? 'Đang diễn ra' : semester.is_locked ? 'Đã khóa' : 'Đã kết thúc'}
          </span>
        </div>
      ))}
    </div>
  );
}

function ApprovalsTabContent({ pendingRegistrations, pendingRegistrationsCount, loadingRegistrations, processingId, onApprove, onReject }) {
  if (loadingRegistrations) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3"></div>
        <p className="text-gray-600 text-sm">Đang tải danh sách đăng ký...</p>
      </div>
    );
  }

  if (!pendingRegistrations || pendingRegistrations.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">Không có đăng ký nào cần phê duyệt</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRegistrations.map((registration) => (
        <div key={registration.id} className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-400/20 dark:bg-amber-400/10">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {registration.user?.name || registration.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-1 truncate">
                {registration.activity?.name || registration.hoat_dong?.ten_hd || 'N/A'}
              </p>
              <p className="text-xs text-gray-600">
                Đăng ký lúc {registration.created_at ? new Date(registration.created_at).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(registration.id)}
              disabled={processingId === registration.id}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingId === registration.id ? 'Đang xử lý...' : 'Duyệt'}
            </button>
            <button
              onClick={() => onReject(registration.id)}
              disabled={processingId === registration.id}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingId === registration.id ? 'Đang xử lý...' : 'Từ chối'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
