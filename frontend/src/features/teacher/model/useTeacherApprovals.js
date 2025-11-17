import { useState, useCallback } from 'react';
import { getPending, getHistory, approve, reject } from '../services/teacherApprovalApi';

// Hook quản lý phê duyệt hoạt động (pending & history)
export default function useTeacherApprovals({ initialSemester }) {
  const [semester, setSemester] = useState(initialSemester || '');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // cho history hoặc filter trong pending
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'pending') {
        const { items, stats } = await getPending({ semester, search });
        setActivities(items);
        setStats(stats);
      } else {
        const items = await getHistory({ semester, search, status: statusFilter });
        setActivities(items);
      }
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách hoạt động');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, semester, search, statusFilter]);

  const refresh = useCallback(() => load(), [load]);

  const approveActivity = useCallback(async (id) => {
    await approve(id);
    await refresh();
  }, [refresh]);

  const rejectActivity = useCallback(async (id, reason) => {
    await reject(id, reason);
    await refresh();
  }, [refresh]);

  return {
    semester,
    setSemester,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    activities,
    stats,
    loading,
    error,
    load,
    refresh,
    approveActivity,
    rejectActivity
  };
}
