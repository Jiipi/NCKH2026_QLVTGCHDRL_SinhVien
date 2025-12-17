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
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    badge: 'bg-green-100 text-green-700',
    iconColor: 'text-green-700',
    icon: CheckCircle
  },
  create: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    iconColor: 'text-orange-600',
    icon: Activity
  },
  update: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
    icon: FileCheck
  },
  account: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
    icon: UserCheck
  },
  incident: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    badge: 'bg-red-100 text-red-700',
    iconColor: 'text-red-600',
    icon: AlertCircle
  },
  default: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    iconBg: 'bg-gray-100',
    badge: 'bg-gray-200 text-gray-700',
    iconColor: 'text-gray-600',
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
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-2 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
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
      <div className="text-center py-12 text-gray-500">
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
            className={`p-4 rounded-xl border ${style.border} ${style.bg} hover:shadow-md transition-all`}
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
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
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
      <div className="text-center py-12 text-gray-500">
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
          className={`flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-all ${
            semester.is_active ? 'bg-purple-50 border border-purple-300' : 'bg-gray-50 border border-gray-200'
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
      <div className="text-center py-12 text-gray-500">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">Không có đăng ký nào cần phê duyệt</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRegistrations.map((registration) => (
        <div key={registration.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all">
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
