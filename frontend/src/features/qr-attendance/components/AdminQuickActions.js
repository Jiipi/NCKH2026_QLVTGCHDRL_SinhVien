import React from 'react';
import { QrCode, Scan, Upload, FileText, Camera } from 'lucide-react';
import { buttonStyle, inputStyle } from './adminStyles';

export default function AdminQuickActions({ activities, onGenerateQRCode, onOpenScanner, onImport }) {
  const h = React.createElement;
  return h(
    'div',
    {
      style: {
        backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }
    },
    h('h3', { style: { fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '16px' } }, 'Thao tác nhanh'),
    h(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' } },
      // Generate QR
      h(
        'div',
        {
          style: { padding: '20px', border: '2px dashed #d1d5db', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
          onMouseEnter: (e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; },
          onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = 'transparent'; }
        },
        h(QrCode, { size: 32, style: { margin: '0 auto 12px', color: '#3b82f6' } }),
        h('h4', { style: { fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' } }, 'Tạo mã QR'),
        h('p', { style: { fontSize: '14px', color: '#6b7280', marginBottom: '12px' } }, 'Tạo mã QR cho hoạt động để sinh viên điểm danh'),
        h(
          'select',
          {
            onChange: (e) => e.target.value && onGenerateQRCode(e.target.value),
            style: { ...inputStyle, backgroundColor: '#f9fafb' }
          },
          h('option', { value: '' }, 'Chọn hoạt động'),
          ...(Array.isArray(activities) ? activities.filter(a => a.trang_thai === 'da_duyet').map(activity => (
            h('option', { key: activity.id, value: activity.id }, activity.ten_hd)
          )) : [])
        )
      ),

      // Scan
      h(
        'div',
        {
          style: { padding: '20px', border: '2px dashed #d1d5db', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
          onMouseEnter: (e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.backgroundColor = '#ecfdf5'; },
          onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = 'transparent'; }
        },
        h(Scan, { size: 32, style: { margin: '0 auto 12px', color: '#10b981' } }),
        h('h4', { style: { fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' } }, 'Quét QR điểm danh'),
        h('p', { style: { fontSize: '14px', color: '#6b7280', marginBottom: '12px' } }, 'Quét mã QR để điểm danh cho sinh viên'),
        h(
          'button',
          { style: { ...buttonStyle, backgroundColor: '#10b981', color: 'white', justifyContent: 'center', width: '100%' }, onClick: onOpenScanner },
          h(Camera, { size: 16 }),
          'Mở camera quét'
        )
      ),

      // Import
      h(
        'div',
        {
          style: { padding: '20px', border: '2px dashed #d1d5db', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
          onMouseEnter: (e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.backgroundColor = '#fffbeb'; },
          onMouseLeave: (e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = 'transparent'; }
        },
        h(Upload, { size: 32, style: { margin: '0 auto 12px', color: '#f59e0b' } }),
        h('h4', { style: { fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' } }, 'Import điểm danh'),
        h('p', { style: { fontSize: '14px', color: '#6b7280', marginBottom: '12px' } }, 'Tải lên file Excel danh sách điểm danh'),
        h('input', { type: 'file', accept: '.xlsx,.xls', style: { display: 'none' }, id: 'admin-import-file', onChange: (e) => { const file = e.target.files?.[0]; if (file) onImport?.(file); } }),
        h(
          'label',
          { htmlFor: 'admin-import-file', style: { ...buttonStyle, backgroundColor: '#f59e0b', color: 'white', justifyContent: 'center', width: '100%', cursor: 'pointer' } },
          h(FileText, { size: 16 }),
          'Chọn file'
        )
      )
    )
  );
}
