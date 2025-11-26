import { useCallback, useEffect, useMemo, useState } from 'react';
import adminRegistrationsApi from '../../admin/services/adminRegistrationsApi';
import { extractActivitiesFromAxiosResponse } from '../../../shared/lib/apiNormalization';
import useSemesterData from '../../../shared/hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../../shared/lib/semester';

export default function useAdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [activities, setActivities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [viewMode, setViewMode] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [classId, setClassId] = useState('');
  const [exporting, setExporting] = useState(false);
  const [counts, setCounts] = useState({ cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 });

  const { options: semesterOptions } = useSemesterData();
  const [semester, setSemester] = useState(getCurrentSemesterValue());

  const getStatusFromViewMode = () => {
    switch (viewMode) {
      case 'pending': return 'cho_duyet';
      case 'approved': return 'da_duyet';
      case 'rejected': return 'tu_choi';
      case 'participated': return 'da_tham_gia';
      default: return undefined;
    }
  };

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        status: getStatusFromViewMode(),
        activityId: activityFilter || undefined,
        classId: classId || undefined,
        semester: semester || undefined,
        page,
        limit,
      };
      const data = await adminRegistrationsApi.listRegistrations(params);
      setRegistrations(Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []));
      setTotal(parseInt(data.total || 0));
      if (data.counts) setCounts(data.counts);
    } catch (e) {
      setRegistrations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [viewMode, activityFilter, classId, semester, page, limit]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await adminRegistrationsApi.listActivities({ semester });
      const list = extractActivitiesFromAxiosResponse(res);
      setActivities(list);
    } catch (e) {
      setActivities([]);
    }
  }, [semester]);

  const fetchClasses = useCallback(async () => {
    try {
      const list = await adminRegistrationsApi.listClasses();
      setClasses(list);
    } catch (e) {
      setClasses([]);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
    fetchActivities();
    fetchClasses();
  }, [fetchRegistrations, fetchActivities, fetchClasses]);

  const filteredRegistrations = useMemo(() => {
    return Array.isArray(registrations) ? registrations.filter(registration => {
      const matchesSearch = (registration.sinh_vien?.nguoi_dung?.ho_ten || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (registration.sinh_vien?.mssv || registration.sinh_vien?.ma_sv || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (registration.hoat_dong?.ten_hd || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (registration.hoat_dong?.ma_hd || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActivity = !activityFilter || registration.hd_id === activityFilter || registration.hoat_dong_id === activityFilter;
      return matchesSearch && matchesActivity;
    }) : [];
  }, [registrations, searchTerm, activityFilter]);

  const stats = useMemo(() => ({
    total: (counts.cho_duyet || 0) + (counts.da_duyet || 0) + (counts.tu_choi || 0) + (counts.da_tham_gia || 0),
    pending: counts.cho_duyet || 0,
    approved: counts.da_duyet || 0,
    rejected: counts.tu_choi || 0,
    participated: counts.da_tham_gia || 0,
  }), [counts]);

  const exportExcel = async () => {
    try {
      setExporting(true);
      const url = adminRegistrationsApi.getExportUrl({ status: getStatusFromViewMode(), classId, semester });
      window.location.href = url;
    } finally {
      setTimeout(() => setExporting(false), 2000);
    }
  };

  return {
    // state
    registrations, setRegistrations,
    total, setTotal,
    page, setPage,
    limit, setLimit,
    activities, setActivities,
    classes, setClasses,
    loading,
    searchTerm, setSearchTerm,
    activityFilter, setActivityFilter,
    viewMode, setViewMode,
    selectedIds, setSelectedIds,
    selectedActivity, setSelectedActivity,
    showActivityModal, setShowActivityModal,
    classId, setClassId,
    exporting,
    counts, setCounts,
    semester, setSemester,
    semesterOptions,
    // derived
    filteredRegistrations,
    stats,
    // actions
    fetchRegistrations,
    fetchActivities,
    fetchClasses,
    exportExcel,
    approve: adminRegistrationsApi.approve,
    reject: adminRegistrationsApi.reject,
    bulkApprove: adminRegistrationsApi.bulkApprove,
  };
}
