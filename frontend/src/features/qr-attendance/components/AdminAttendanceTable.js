import React from 'react';
import { MapPin, Clock, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { buttonStyle } from './adminStyles';

function getStatusColor(status) {
  switch (status) {
    case 'co_mat': return { bg: '#dcfce7', color: '#15803d', text: 'Có mặt', icon: React.createElement(CheckCircle, { size: 16 }) };
    case 'vang_mat': return { bg: '#fef2f2', color: '#dc2626', text: 'Vắng mặt', icon: React.createElement(XCircle, { size: 16 }) };
    case 'tre': return { bg: '#fef3c7', color: '#92400e', text: 'Đi trễ', icon: React.createElement(Clock, { size: 16 }) };
    case 'som': return { bg: '#e0e7ff', color: '#3730a3', text: 'Về sớm', icon: React.createElement(Clock, { size: 16 }) };
    default: return { bg: '#f3f4f6', color: '#374151', text: 'Chưa xác định', icon: React.createElement(AlertCircle, { size: 16 }) };
  }
}

export default function AdminAttendanceTable({ records, onView, onMarkPresent, onMarkAbsent }) {
  const h = React.createElement;

  if (!records || records.length === 0) {
    return h(
      'div',
      { style: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' } },
      h(
        'div',
        { style: { textAlign: 'center', padding: '60px 24px' } },
        h(AlertCircle, { size: 48, style: { margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' } }),
        h('p', { style: { fontSize: '16px', fontWeight: '500', color: '#6b7280' } }, 'Không tìm thấy bản ghi điểm danh nào')
      )
    );
  }

  return h(
    'div',
    { style: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' } },
    h(
      'div',
      { style: { overflow: 'auto' } },
      h(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse' } },
        h(
          'thead',
          { style: { backgroundColor: '#f9fafb' } },
          h('tr', null,
            h('th', { style: thStyle }, 'Sinh viên'),
            h('th', { style: thStyle }, 'Hoạt động'),
            h('th', { style: thStyle }, 'Thời gian điểm danh'),
            h('th', { style: thStyle }, 'Trạng thái'),
            h('th', { style: thStyle }, 'Thao tác')
          )
        ),
        h(
          'tbody',
          null,
          records.map((record, index) => {
            const statusInfo = getStatusColor(record.trang_thai);
            return h(
              'tr',
              {
                key: record.id,
                style: { borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }
              },
              // Student
              h(
                'td',
                { style: tdStyle },
                h('div', null,
                  h('div', { style: { fontWeight: '500', color: '#111827' } }, record.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'),
                  h('div', { style: { fontSize: '14px', color: '#6b7280' } }, record.sinh_vien?.ma_sv || 'N/A'),
                  h('div', { style: { fontSize: '12px', color: '#9ca3af' } }, record.sinh_vien?.lop || 'N/A')
                )
              ),
              // Activity
              h(
                'td',
                { style: tdStyle },
                h('div', null,
                  h('div', { style: { fontWeight: '500', color: '#111827' } }, record.hoat_dong?.ten_hd || 'N/A'),
                  h('div', { style: { fontSize: '14px', color: '#6b7280' } }, record.hoat_dong?.ma_hd || 'N/A'),
                  h(
                    'div',
                    { style: { fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' } },
                    h(MapPin, { size: 12 }),
                    record.hoat_dong?.dia_diem || 'N/A'
                  )
                )
              ),
              // Time
              h(
                'td',
                { style: tdStyle },
                h(
                  'div',
                  { style: { fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' } },
                  h(Clock, { size: 14 }),
                  record.thoi_gian_diem_danh ? new Date(record.thoi_gian_diem_danh).toLocaleDateString('vi-VN') : 'N/A'
                ),
                record.thoi_gian_diem_danh
                  ? h('div', { style: { fontSize: '12px', color: '#6b7280', marginTop: '2px' } }, new Date(record.thoi_gian_diem_danh).toLocaleTimeString('vi-VN'))
                  : null
              ),
              // Status
              h(
                'td',
                { style: tdStyle },
                h(
                  'span',
                  {
                    style: {
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '16px',
                      fontSize: '12px', fontWeight: '500', backgroundColor: statusInfo.bg, color: statusInfo.color, width: 'fit-content'
                    }
                  },
                  statusInfo.icon,
                  statusInfo.text
                )
              ),
              // Actions
              h(
                'td',
                { style: tdStyle },
                h(
                  'div',
                  { style: { display: 'flex', gap: '8px' } },
                  h(
                    'button',
                    {
                      onClick: () => onView && onView(record),
                      style: { ...buttonStyle, backgroundColor: '#3b82f6', color: 'white', padding: '6px 12px' },
                      title: 'Xem chi tiết'
                    },
                    h(Eye, { size: 14 })
                  ),
                  h(
                    'button',
                    {
                      onClick: () => onMarkPresent && onMarkPresent(record),
                      style: { ...buttonStyle, backgroundColor: '#10b981', color: 'white', padding: '6px 12px' },
                      title: 'Đánh dấu có mặt'
                    },
                    h(CheckCircle, { size: 14 })
                  ),
                  h(
                    'button',
                    {
                      onClick: () => onMarkAbsent && onMarkAbsent(record),
                      style: { ...buttonStyle, backgroundColor: '#ef4444', color: 'white', padding: '6px 12px' },
                      title: 'Đánh dấu vắng mặt'
                    },
                    h(XCircle, { size: 14 })
                  )
                )
              )
            );
          })
        )
      )
    )
  );
}

const thStyle = { padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' };
const tdStyle = { padding: '16px' };
