import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useMonitorNotifications } from '../model/hooks/useMonitorNotifications';
import NotificationsHeader from './components/Notifications/NotificationsHeader';
import NotificationTemplates from './components/Notifications/NotificationTemplates';
import NotificationForm from './components/Notifications/NotificationForm';
import NotificationHistory from './components/Notifications/NotificationHistory';
import NotificationDetailModal from './components/Notifications/NotificationDetailModal';

export default function ClassNotificationsPage() {
  const { showSuccess, showError } = useNotification();
  const {
    title,
    setTitle,
    message,
    setMessage,
    scope,
    setScope,
    activityId,
    setActivityId,
    semester,
    setSemester,
    semesterOptions,
    activityOptions,
    activityLoading,
    sending,
    error,
    success,
    setError,
    setSuccess,
    sentHistory,
    showHistory,
    setShowHistory,
    selectedNotification,
    setSelectedNotification,
    showDetailModal,
    setShowDetailModal,
    stats,
    templates,
    applyTemplate,
    handleSend: handleSendNotification,
    handleNotificationClick,
    charCount,
    maxChars
  } = useMonitorNotifications();

  const handleSend = async (e) => {
    e.preventDefault();
    const result = await handleSendNotification();
    if (result.success) {
      showSuccess(result.success === true ? 'Đã gửi thông báo thành công! 🎉' : result.success);
    } else if (result.error) {
      showError(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <NotificationsHeader
        stats={stats}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />

      {error && (<div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-700 shadow-lg"><div className="p-2 bg-red-100 rounded-xl mr-3"><AlertCircle className="h-5 w-5" /></div><span className="font-medium">{error}</span></div>)}
      {success && (<div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 flex items-center text-green-700 shadow-lg"><div className="p-2 bg-green-100 rounded-xl mr-3"><CheckCircle className="h-5 w-5" /></div><span className="font-medium">{success}</span></div>)}

      <NotificationTemplates
        templates={templates}
        onApplyTemplate={applyTemplate}
      />

      <NotificationForm
        title={title}
        setTitle={setTitle}
        message={message}
        setMessage={setMessage}
        scope={scope}
        setScope={setScope}
        activityId={activityId}
        setActivityId={setActivityId}
        semester={semester}
        setSemester={setSemester}
        semesterOptions={semesterOptions}
        activityOptions={activityOptions}
        activityLoading={activityLoading}
        sending={sending}
        charCount={charCount}
        maxChars={maxChars}
        onSubmit={handleSend}
      />

      {showHistory && (
        <NotificationHistory
          sentHistory={sentHistory}
          onNotificationClick={handleNotificationClick}
        />
      )}

      <NotificationDetailModal
        isOpen={showDetailModal}
        notification={selectedNotification}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}
