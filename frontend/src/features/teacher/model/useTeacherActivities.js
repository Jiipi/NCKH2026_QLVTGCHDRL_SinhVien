import { useState, useCallback } from 'react';
import { listActivities, getActivity, approveActivity, rejectActivity } from '../services/teacherActivitiesApi';

// Hook dữ liệu cho trang hoạt động giáo viên (không chứa logic UI)
export default function useTeacherActivities({ initialSemester }) {
  const [semester, setSemester] = useState(initialSemester || '');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async ({ nextPage, nextLimit, nextSemester } = {}) => {
    const p = nextPage || page;
    const l = nextLimit || limit;
    const s = nextSemester !== undefined ? nextSemester : semester;
    try {
      setLoading(true);
      setError(null);
      const { items, total } = await listActivities({ page: p, limit: l, semester: s });
      setActivities(items);
      setTotal(total);
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách hoạt động');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, semester]);

  const refresh = useCallback(() => load({}), [load]);

  const approve = useCallback(async (id) => {
    await approveActivity(id);
    await refresh();
  }, [refresh]);

  const reject = useCallback(async (id, reason) => {
    await rejectActivity(id, reason);
    await refresh();
  }, [refresh]);

  const fetchDetail = useCallback(async (id) => {
    return await getActivity(id);
  }, []);

  return {
    // data
    activities,
    total,
    semester,
    // state
    page,
    limit,
    loading,
    error,
    // setters
    setSemester,
    setPage,
    setLimit,
    // actions
    load,
    refresh,
    approve,
    reject,
    fetchDetail
  };
}
