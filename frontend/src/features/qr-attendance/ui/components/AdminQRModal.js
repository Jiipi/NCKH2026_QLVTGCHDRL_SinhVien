import React from 'react';
import { QrCode, Download } from 'lucide-react';
import { buttonStyle } from './adminStyles';

export default function AdminQRModal({ open, code, activity, onClose, onDownload }) {
  const h = React.createElement;
  if (!open || !code || !activity) return null;
  return h(
    'div',
    { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } },
    h(
      'div',
      { style: { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', textAlign: 'center', padding: '32px' } },
      h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '8px' } }, 'Mã QR Điểm Danh'),
      h('p', { style: { color: '#6b7280', marginBottom: '24px' } }, activity.ten_hd),
      h(
        'div',
        { style: { backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', marginBottom: '24px' } },
        h(
          'div',
          { style: { width: '200px', height: '200px', backgroundColor: 'white', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e7eb', borderRadius: '8px' } },
          h(QrCode, { size: 120, style: { color: '#6b7280' } })
        ),
        h('p', { style: { fontSize: '12px', color: '#6b7280', marginTop: '16px', fontFamily: 'monospace' } }, code)
      ),
      h(
        'div',
        { style: { display: 'flex', gap: '12px', justifyContent: 'center' } },
        h('button', { onClick: onDownload, style: { ...buttonStyle, backgroundColor: '#10b981', color: 'white' } }, h(Download, { size: 16 }), ' ', 'Tải xuống'),
        h('button', { onClick: onClose, style: { ...buttonStyle, backgroundColor: '#6b7280', color: 'white' } }, 'Đóng')
      )
    )
  );
}
