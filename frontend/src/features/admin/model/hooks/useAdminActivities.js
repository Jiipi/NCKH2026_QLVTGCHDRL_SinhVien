import { useEffect, useMemo, useState, useCallback } from 'react';
import adminActivitiesApi from '../../services/adminActivitiesApi';
import { extractActivitiesFromAxiosResponse } from '../../../../shared/lib/apiNormalization';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import { useDataChangeListener, useAutoRefresh } from '../../../../shared/lib/dataRefresh';

export default function useAdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);

  const { options: semesterOptions, currentSemester, loading: semesterLoading } = useSemesterData();
  const [semesterValue, setSemesterValue] = useState(null);

  useEffect(() => {
    if (currentSemester && !semesterValue) {
      setSemesterValue(currentSemester);
    } else if (!currentSemester && !semesterLoading && semesterOptions.length > 0 && !semesterValue) {
      setSemesterValue(semesterOptions[0]?.value || null);
    }
  }, [currentSemester, semesterOptions, semesterLoading, semesterValue]);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminActivitiesApi.getActivityTypes();
        const arr = data.activityTypes || data.items || data || [];
        setTypes(Array.isArray(arr) ? arr : []);
      } catch (e) {
        setTypes([]);
      }
    })();
  }, []);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        typeId: typeFilter || undefined,
        semesterValue: semesterValue || undefined,
      };
      const resp = await adminActivitiesApi.listActivities(params);
      const list = extractActivitiesFromAxiosResponse(resp);
      const envelope = resp?.data;
      const pagination = envelope?.data?.pagination;
      setTotal(pagination?.total ?? (Array.isArray(list) ? list.length : 0));
      setActivities(Array.isArray(list) ? list : []);
    } catch (e) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, typeFilter, semesterValue]);

  useEffect(() => {
    if (semesterValue) {
      loadActivities();
    }
  }, [loadActivities, semesterValue]);

  // Auto-reload when activities data changes from other components (same tab)
  useDataChangeListener(['ACTIVITIES', 'APPROVALS', 'REGISTRATIONS'], loadActivities, { debounceMs: 500 });

  // Auto-refresh for cross-user sync
  useAutoRefresh(loadActivities, { 
    intervalMs: 30000, 
    enabled: !!semesterValue,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (activities || [])
      .filter(a => {
        const matchQ = !q ||
          a.ten_hd?.toLowerCase().includes(q) ||
          a.mo_ta?.toLowerCase().includes(q) ||
          a.dia_diem?.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || a.trang_thai === statusFilter;
        const matchType = !typeFilter || a.loai_hd_id === typeFilter || a.loai_hd?.id === typeFilter;
        return matchQ && matchStatus && matchType;
      })
      .sort((a, b) => new Date(b.ngay_tao || b.ngay_bd || 0) - new Date(a.ngay_tao || a.ngay_bd || 0));
  }, [activities, search, statusFilter, typeFilter]);

  return {
    // state
    activities,
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    types,
    page, setPage,
    limit, setLimit,
    total,
    semesterOptions,
    semesterLoading,
    semesterValue, setSemesterValue,
    // derived
    filtered,
    // actions
    reload: loadActivities,
  };
}
