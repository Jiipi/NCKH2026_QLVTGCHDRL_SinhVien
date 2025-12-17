import React from 'react';
import { Search, Activity, Filter } from 'lucide-react';

interface ActivityItem {
  id: string;
  ten_hd: string;
}

interface AdminFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activityFilter: string;
  setActivityFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  activities: ActivityItem[];
}

export default function AdminFilters({
  searchTerm,
  setSearchTerm,
  activityFilter,
  setActivityFilter,
  statusFilter,
  setStatusFilter,
  activities,
}: AdminFiltersProps) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên, hoạt động..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
          />
        </div>
        {/* Activity filter */}
        <div style={{ position: 'relative' }}>
          <Activity size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white' }}
          >
            <option key="all" value="">Tất cả hoạt động</option>
            {(activities || []).map((activity: ActivityItem) => (
              <option key={activity.id} value={activity.id}>{activity.ten_hd}</option>
            ))}
          </select>
        </div>
        {/* Status filter */}
        <div style={{ position: 'relative' }}>
          <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white' }}
          >
            <option key="all-status" value="">Tất cả trạng thái</option>
            <option key="co_mat" value="co_mat">Có mặt</option>
            <option key="vang_mat" value="vang_mat">Vắng mặt</option>
            <option key="tre" value="tre">Đi trễ</option>
            <option key="som" value="som">Về sớm</option>
          </select>
        </div>
      </div>
    </div>
  );
}
