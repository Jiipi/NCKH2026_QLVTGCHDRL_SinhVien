import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { buttonStyle } from './adminStyles';

export default function AdminHeaderActions({ onRefresh, onExport }) {
  const h = React.createElement;
  return h(
    'div',
    { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
    h(
      'div',
      null,
      h('h1', { style: { fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px' } }, 'Quản Lý QR Điểm Danh'),
      h('p', { style: { color: '#6b7280' } }, 'Quản lý điểm danh bằng QR code theo schema DiemDanh')
    ),
    h(
      'div',
      { style: { display: 'flex', gap: '12px' } },
      h(
        'button',
        { onClick: onRefresh, style: { ...buttonStyle, backgroundColor: '#6b7280', color: 'white' } },
        h(RefreshCw, { size: 20 }),
        ' ',
        'Làm mới'
      ),
      h(
        'button',
        { onClick: onExport, style: { ...buttonStyle, backgroundColor: '#10b981', color: 'white' } },
        h(Download, { size: 20 }),
        ' ',
        'Xuất báo cáo'
      )
    )
  );
}
