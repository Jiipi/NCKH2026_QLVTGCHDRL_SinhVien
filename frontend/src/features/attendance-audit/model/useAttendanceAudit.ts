import { useCallback, useEffect, useMemo, useState } from 'react';
import attendanceAuditApi from '../services/attendanceAuditApi';

type Scope = 'admin' | 'monitor';

const defaultFilters = {
  page: 1,
  limit: 20,
  action: '',
  result: '',
  reason: '',
  q: '',
  ip: '',
  from: '',
  to: ''
};

export function useAttendanceAudit(scope: Scope) {
  const [filters, setFilters] = useState(defaultFilters);
  const [data, setData] = useState({ items: [], summary: {}, pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(() => {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
  }, [filters]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = scope === 'admin'
        ? await attendanceAuditApi.getAdminAttendanceAudit(params)
        : await attendanceAuditApi.getMonitorAttendanceAudit(params);
      setData({
        items: result.items || [],
        summary: result.summary || {},
        pagination: result.pagination || { page: filters.page, limit: filters.limit, total: 0, totalPages: 1 }
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải lịch sử điểm danh');
    } finally {
      setLoading(false);
    }
  }, [filters.limit, filters.page, params, scope]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilter = useCallback((key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? Number(value) : 1 }));
  }, []);

  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

  return { filters, data, loading, error, updateFilter, clearFilters, reload: load };
}
