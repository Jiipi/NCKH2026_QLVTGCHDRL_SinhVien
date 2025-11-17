import React from 'react';
import { useMonitorClassManagement } from '../model/useMonitorClassManagement';

export default function MonitorClassManagementPage() {
  const { state } = useMonitorClassManagement();
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Quản lý lớp (Monitor)</h1>
      <p>Scaffold: danh sách lớp, bộ lọc, hành động giám sát.</p>
      <pre style={{fontSize:'12px'}}>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
