import React from 'react';

const buttonStyle = {
  padding: '6px 12px',
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

export const RoleFilterButtons = ({ roles, roleFilter, setRoleFilter, setPagination }) => {
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '12px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {roles.map(r => (
          <button
            key={r.id}
            onClick={() => {
              setRoleFilter(r.ten_vt);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            style={{
              ...buttonStyle,
              backgroundColor: roleFilter === r.ten_vt ? '#2563eb' : '#f3f4f6',
              color: roleFilter === r.ten_vt ? '#fff' : '#374151'
            }}
          >
            {r.ten_vt}
          </button>
        ))}
      </div>
    </div>
  );
};
