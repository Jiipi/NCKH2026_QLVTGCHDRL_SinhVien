import React, { useState } from 'react';
 
import { useAdminQRAttendance } from '../hooks/useAdminQRAttendance';
import AdminHeaderActions from '../components/AdminHeaderActions.js';
import AdminFilters from '../components/AdminFilters.js';
import AdminStats from '../components/AdminStats.js';
import AdminAttendanceTable from '../components/AdminAttendanceTable.js';
import AdminQRModal from '../components/AdminQRModal.js';
import AdminDetailModal from '../components/AdminDetailModal.js';
import AdminQuickActions from '../components/AdminQuickActions.js';

const FixedQRAttendanceManagement = () => {
  const {
    attendanceRecords,
    activities,
    loading,
    refreshAttendance,
    refreshActivities,
    fetchAttendanceDetails,
    getQRCodeData,
    updateAttendanceStatus,
  } = useAdminQRAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');

  const generateQRCode = (activityId) => {
    try {
      const { code, activity } = getQRCodeData(activityId);
      setQrCodeData(code);
      setSelectedActivity(activity);
      setShowQRModal(true);
    } catch (error) {
      console.error('Lỗi khi tạo mã QR:', error);
      alert('Không thể tạo mã QR. Vui lòng thử lại.');
    }
  };

  const exportAttendance = async (activityId = null) => {
    // Giữ nguyên hành vi hiện tại (chưa có backend)
    alert('Export attendance chưa được backend hỗ trợ');
  };

  const filteredRecords = Array.isArray(attendanceRecords) ? attendanceRecords.filter(record => {
    const matchesSearch = (record.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.sinh_vien?.ma_sv || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.hoat_dong?.ten_hd || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = !activityFilter || record.hoat_dong_id === activityFilter;
    const matchesStatus = !statusFilter || record.trang_thai === statusFilter;
    return matchesSearch && matchesActivity && matchesStatus;
  }) : [];

  if (loading) {
    return React.createElement(
      'div',
      {
        style: {
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          height: '400px', flexDirection: 'column', gap: '16px'
        }
      },
      React.createElement('div', {
        style: {
          width: '40px', height: '40px', border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }
      }),
      React.createElement('p', null, 'Đang tải dữ liệu điểm danh...')
    );
  }

  const h = React.createElement;
  return h(
    'div',
    { style: { padding: '24px' } },
    h(
      'style',
      null,
      `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
    ),
    h(AdminHeaderActions, { onRefresh: refreshAttendance, onExport: () => exportAttendance() }),
    h(AdminQuickActions, {
      activities,
      onGenerateQRCode: generateQRCode,
      onOpenScanner: () => alert('Tính năng quét QR sẽ được triển khai với camera API'),
      onImport: () => alert('Tính năng import sẽ được triển khai')
    }),
    h(AdminFilters, {
      searchTerm,
      setSearchTerm,
      activityFilter,
      setActivityFilter,
      statusFilter,
      setStatusFilter,
      activities
    }),
    h(AdminStats, { attendanceRecords }),
    h(AdminAttendanceTable, {
      records: filteredRecords,
      onView: (record) => { setSelectedRecord(record); setShowDetailModal(true); },
      onMarkPresent: (record) => updateAttendanceStatus(record.id, 'co_mat'),
      onMarkAbsent: (record) => updateAttendanceStatus(record.id, 'vang_mat')
    }),
    h(AdminQRModal, {
      open: showQRModal,
      code: qrCodeData,
      activity: selectedActivity,
      onDownload: () => alert('Tính năng tải xuống QR sẽ được triển khai'),
      onClose: () => { setShowQRModal(false); setQrCodeData(''); setSelectedActivity(null); }
    }),
    h(AdminDetailModal, {
      open: showDetailModal,
      record: selectedRecord,
      onClose: () => { setShowDetailModal(false); setSelectedRecord(null); }
    })
  );
};

export default FixedQRAttendanceManagement;