import { useState, useEffect, useCallback } from 'react';
import { listRegistrations, approveRegistration, rejectRegistration, fetchTeacherClasses } from '../services/teacherRegistrationsApi';
import useSemesterData from '../../../hooks/useSemesterData';

export default function useTeacherRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('cho_duyet');
  const [semester, setSemester] = useState('current');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 });
  const [selected, setSelected] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const { isWritable } = useSemesterData(semester);

  const loadClasses = useCallback(async () => {
    const list = await fetchTeacherClasses();
    setClasses(list);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        semester: semester || undefined,
        page,
        limit,
        status: status === 'all' ? undefined : status,
        search: search || undefined,
        classId: classId || undefined
      };
      const { items, total: t, counts: c } = await listRegistrations(params);
      setRegistrations(items);
      setTotal(t);
      setCounts(c);
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải danh sách đăng ký');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [semester, page, limit, status, search, classId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadClasses(); }, [loadClasses]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectAll = () => {
    const filtered = registrations.filter(r => status === 'all' || r.trang_thai_dk === status);
    if (selected.length === filtered.length) setSelected([]); else setSelected(filtered.map(r => r.id));
  };

  const approveSingle = async (id) => {
    setProcessing(true);
    try { await approveRegistration(id); await load(); } finally { setProcessing(false); }
  };
  const rejectSingle = async (id, reason) => {
    setProcessing(true);
    try { await rejectRegistration(id, reason); await load(); } finally { setProcessing(false); }
  };
  const bulkApprove = async () => {
    if (!selected.length) return; setProcessing(true);
    try { for (const id of selected) await approveRegistration(id); await load(); setSelected([]); } finally { setProcessing(false); }
  };
  const bulkReject = async (reason) => {
    if (!selected.length) return; setProcessing(true);
    try { for (const id of selected) await rejectRegistration(id, reason); await load(); setSelected([]); } finally { setProcessing(false); }
  };

  const filtered = registrations.filter(r => {
    const matchesStatus = status === 'all' || r.trang_thai_dk === status;
    const term = search.toLowerCase();
    const matchesSearch = !term || (r.sinh_vien?.nguoi_dung?.ho_ten?.toLowerCase().includes(term) || r.sinh_vien?.mssv?.includes(search) || r.hoat_dong?.ten_hd?.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });
  const effectiveTotal = total || filtered.length;
  const startIdx = (page - 1) * limit;
  const pageItems = filtered.slice(startIdx, startIdx + limit);

  return {
    registrations: pageItems,
    loading,
    error,
    search,
    setSearch: (v) => { setPage(1); setSearch(v); },
    status,
    setStatus: (v) => { setPage(1); setStatus(v); },
    semester,
    setSemester: (v) => { setPage(1); setSemester(v); },
    page,
    setPage,
    limit,
    setLimit: (v) => { setPage(1); setLimit(v); },
    total: effectiveTotal,
    counts,
    selected,
    toggleSelect,
    selectAll,
    processing,
    approveSingle,
    rejectSingle,
    bulkApprove,
    bulkReject,
    classes,
    classId,
    setClassId: (v) => { setPage(1); setClassId(v); },
    isWritable
  };
}
