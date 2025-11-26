import React from 'react';
import { Search, Activity, Filter } from 'lucide-react';

export default function AdminFilters({
  searchTerm,
  setSearchTerm,
  activityFilter,
  setActivityFilter,
  statusFilter,
  setStatusFilter,
  activities,
}) {
  const h = React.createElement;
  return h(
    'div',
    { style: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' } },
    h(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } },
      // Search
      h(
        'div',
        { style: { position: 'relative' } },
        h(Search, { size: 20, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' } }),
        h('input', {
          type: 'text',
          placeholder: 'Tìm kiếm sinh viên, hoạt động...',
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          style: { width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' },
        })
      ),
      // Activity filter
      h(
        'div',
        { style: { position: 'relative' } },
        h(Activity, { size: 20, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' } }),
        h(
          'select',
          {
            value: activityFilter,
            onChange: (e) => setActivityFilter(e.target.value),
            style: { width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white' },
          },
          h('option', { value: '' }, 'Tất cả hoạt động'),
          ...(activities || []).map((activity) => h('option', { key: activity.id, value: activity.id }, activity.ten_hd))
        )
      ),
      // Status filter
      h(
        'div',
        { style: { position: 'relative' } },
        h(Filter, { size: 20, style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' } }),
        h(
          'select',
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            style: { width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white' },
          },
          h('option', { value: '' }, 'Tất cả trạng thái'),
          h('option', { value: 'co_mat' }, 'Có mặt'),
          h('option', { value: 'vang_mat' }, 'Vắng mặt'),
          h('option', { value: 'tre' }, 'Đi trễ'),
          h('option', { value: 'som' }, 'Về sớm')
        )
      )
    )
  );
}
