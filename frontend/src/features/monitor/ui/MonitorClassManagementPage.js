import React from 'react';
import { useMonitorClassManagement } from '../model/hooks/useMonitorClassManagement';

export default function MonitorClassManagementPage() {
  const { classes, loading, error, refresh } = useMonitorClassManagement();
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Quản lý lớp (Monitor)</h1>
      <p>Scaffold: danh sách lớp, bộ lọc, hành động giám sát.</p>
      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}
      <pre style={{fontSize:'12px'}}>{JSON.stringify({ classes, loading, error }, null, 2)}</pre>
    </div>
  );
}
