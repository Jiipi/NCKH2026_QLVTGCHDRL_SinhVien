import React from 'react';

export default function AdminStats({ attendanceRecords }) {
  const h = React.createElement;
  const stats = [
    { label: 'Tổng điểm danh', value: attendanceRecords.length, color: '#3b82f6' },
    { label: 'Có mặt', value: attendanceRecords.filter(r => r.trang_thai === 'co_mat').length, color: '#10b981' },
    { label: 'Vắng mặt', value: attendanceRecords.filter(r => r.trang_thai === 'vang_mat').length, color: '#ef4444' },
    { label: 'Đi trễ', value: attendanceRecords.filter(r => r.trang_thai === 'tre').length, color: '#f59e0b' },
  ];
  return h(
    'div',
    { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' } },
    ...stats.map((stat, index) =>
      h(
        'div',
        { key: index, style: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderLeft: `4px solid ${stat.color}` } },
        h('div', { style: { fontSize: '2rem', fontWeight: 'bold', color: stat.color } }, String(stat.value)),
        h('div', { style: { fontSize: '14px', color: '#6b7280', marginTop: '4px' } }, stat.label)
      )
    )
  );
}
