import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { buttonStyle } from './adminStyles';

function getStatusInfo(status) {
  switch (status) {
    case 'co_mat':
      return { bg: '#dcfce7', color: '#15803d', text: 'Có mặt', icon: React.createElement(CheckCircle, { size: 16 }) };
    case 'vang_mat':
      return { bg: '#fef2f2', color: '#dc2626', text: 'Vắng mặt', icon: React.createElement(XCircle, { size: 16 }) };
    case 'tre':
      return { bg: '#fef3c7', color: '#92400e', text: 'Đi trễ', icon: React.createElement(Clock, { size: 16 }) };
    case 'som':
      return { bg: '#e0e7ff', color: '#3730a3', text: 'Về sớm', icon: React.createElement(Clock, { size: 16 }) };
    default:
      return { bg: '#f3f4f6', color: '#374151', text: 'Chưa xác định', icon: React.createElement(AlertCircle, { size: 16 }) };
  }
}

export default function AdminDetailModal({ open, record, onClose }) {
  const h = React.createElement;
  if (!open || !record) return null;
  const statusInfo = getStatusInfo(record.trang_thai);

  return h(
    'div',
    {
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }
    },
    h(
      'div',
      {
        style: {
          backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90%', overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }
      },
      h(
        'div',
        { style: { padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        h('h2', { style: { fontSize: '1.5rem', fontWeight: 600, color: '#111827' } }, 'Chi tiết điểm danh'),
        h('button', { onClick: onClose, style: { ...buttonStyle, backgroundColor: '#6b7280', color: 'white' } }, 'Đóng')
      ),
      h(
        'div',
        { style: { padding: '24px' } },
        h(
          'div',
          { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' } },
          h(
            'div',
            null,
            h('h3', { style: { fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '16px' } }, 'Thông tin sinh viên'),
            h(
              'div',
              null,
              h('div', { style: { marginBottom: '12px' } },
                h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Họ tên'),
                h('div', { style: { fontSize: '16px', color: '#111827' } }, record.sinh_vien?.nguoi_dung?.ho_ten || 'N/A')
              ),
              h('div', { style: { marginBottom: '12px' } },
                h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Mã sinh viên'),
                h('div', { style: { fontSize: '16px', color: '#111827', fontFamily: 'monospace' } }, record.sinh_vien?.ma_sv || 'N/A')
              ),
              h('div', { style: { marginBottom: '12px' } },
                h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Lớp'),
                h('div', { style: { fontSize: '16px', color: '#111827' } }, 
                  typeof record.sinh_vien?.lop === 'object' 
                    ? (record.sinh_vien?.lop?.ten_lop || 'N/A')
                    : (record.sinh_vien?.lop || 'N/A')
                )
              )
            )
          ),
          h(
            'div',
            null,
            h('h3', { style: { fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '16px' } }, 'Thông tin hoạt động'),
            h(
              'div',
              null,
              h('div', { style: { marginBottom: '12px' } },
                h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Tên hoạt động'),
                h('div', { style: { fontSize: '16px', color: '#111827' } }, record.hoat_dong?.ten_hd || 'N/A')
              ),
              h('div', { style: { marginBottom: '12px' } },
                h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Địa điểm'),
                h('div', { style: { fontSize: '16px', color: '#111827' } }, record.hoat_dong?.dia_diem || 'N/A')
              ),
              h('div', { style: { marginBottom: '12px' } },
                h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Thời gian hoạt động'),
                h('div', { style: { fontSize: '16px', color: '#111827' } }, record.hoat_dong?.ngay_bd ? new Date(record.hoat_dong.ngay_bd).toLocaleDateString('vi-VN') : 'N/A')
              )
            )
          )
        ),
        h(
          'div',
          { style: { marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' } },
          h('h3', { style: { fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '16px' } }, 'Chi tiết điểm danh'),
          h(
            'div',
            { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } },
            h('div', null,
              h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Thời gian điểm danh'),
              h('div', { style: { fontSize: '16px', color: '#111827' } }, record.thoi_gian_diem_danh ? new Date(record.thoi_gian_diem_danh).toLocaleString('vi-VN') : 'N/A')
            ),
            h('div', null,
              h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Trạng thái'),
              h(
                'span',
                { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 500, backgroundColor: statusInfo.bg, color: statusInfo.color } },
                statusInfo.icon,
                statusInfo.text
              )
            )
          ),
          record.ghi_chu ? h(
            'div',
            { style: { marginTop: '16px' } },
            h('label', { style: { fontSize: '14px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' } }, 'Ghi chú'),
            h('div', { style: { fontSize: '16px', color: '#111827', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' } }, record.ghi_chu)
          ) : null
        )
      )
    )
  );
}
