import React from 'react';
import { Search, Filter, Users, CheckCircle, XCircle } from 'lucide-react';

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease'
};

export const UserFilters = ({ 
  searchTerm, 
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  setPagination,
  users,
  activeIds,
  activeCodes
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search 
          size={20} 
          style={{ 
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} 
        />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 44px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Status Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => {
            setStatusFilter('');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          style={{
            ...buttonStyle,
            backgroundColor: statusFilter === '' ? '#3b82f6' : '#f3f4f6',
            color: statusFilter === '' ? 'white' : '#374151',
            flex: 1,
            minWidth: '150px'
          }}
        >
          <Users size={18} />
          Tất cả ({users.length})
        </button>
        <button
          onClick={() => {
            setStatusFilter('hoat_dong');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          style={{
            ...buttonStyle,
            backgroundColor: statusFilter === 'hoat_dong' ? '#10b981' : '#f3f4f6',
            color: statusFilter === 'hoat_dong' ? 'white' : '#374151',
            flex: 1,
            minWidth: '150px'
          }}
        >
          <CheckCircle size={18} />
          {(() => { 
            const active = users.filter(u => {
              const locked = u.trang_thai === 'khoa' || u.khoa === true;
              if (locked) return false;
              const sameId = u.id && activeIds.has(String(u.id));
              const sameCode = (u.maso && activeCodes.has(String(u.maso))) || 
                (u.ten_dn && activeCodes.has(String(u.ten_dn))) || 
                (u.sinh_vien?.mssv && activeCodes.has(String(u.sinh_vien.mssv)));
              return sameId || sameCode;
            }).length;
            return `Hoạt động (${active})`;
          })()}
        </button>
        <button
          onClick={() => {
            setStatusFilter('khoa');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          style={{
            ...buttonStyle,
            backgroundColor: statusFilter === 'khoa' ? '#ef4444' : '#f3f4f6',
            color: statusFilter === 'khoa' ? 'white' : '#374151',
            flex: 1,
            minWidth: '150px'
          }}
        >
          <XCircle size={18} />
          {(() => { 
            const locked = users.filter(u => u.trang_thai === 'khoa' || u.khoa === true).length;
            return `Bị khóa (${locked})`;
          })()}
        </button>
      </div>
    </div>
  );
};
