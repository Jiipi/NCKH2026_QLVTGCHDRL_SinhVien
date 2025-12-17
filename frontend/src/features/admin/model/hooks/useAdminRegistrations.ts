import { useCallback, useEffect, useMemo, useState } from 'react';
import adminRegistrationsApi from '../../services/adminRegistrationsApi';
import { extractActivitiesFromAxiosResponse } from '../../../../shared/lib/apiNormalization';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../../../shared/lib/semester';
import { useAutoRefresh, useDataChangeListener } from '../../../../shared/lib/dataRefresh';

interface Registration {
  id: string;
  sinh_vien?: {
    nguoi_dung?: { ho_ten?: string };
    mssv?: string;
    ma_sv?: string;
  };
  hoat_dong?: {
    ten_hd?: string;
    ma_hd?: string;
  };
  hd_id?: string;
  hoat_dong_id?: string;
  trang_thai_dk?: string;
  ngay_dang_ky?: string;
  [key: string]: unknown;
}

interface Activity {
  id: string;
  ten_hd?: string;
  [key: string]: unknown;
}

interface Class {
  id: string;
  ten_lop?: string;
  name?: string;
}

interface SemesterOption {
  value: string;
  label: string;
}

interface RegistrationCounts {
  cho_duyet: number;
  da_duyet: number;
  tu_choi: number;
  da_tham_gia: number;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  participated: number;
}

interface UseAdminRegistrationsReturn {
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  classes: Class[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  activityFilter: string;
  setActivityFilter: React.Dispatch<React.SetStateAction<string>>;
  viewMode: string;
  setViewMode: React.Dispatch<React.SetStateAction<string>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedActivity: Activity | null;
  setSelectedActivity: React.Dispatch<React.SetStateAction<Activity | null>>;
  showActivityModal: boolean;
  setShowActivityModal: React.Dispatch<React.SetStateAction<boolean>>;
  classId: string;
  setClassId: React.Dispatch<React.SetStateAction<string>>;
  exporting: boolean;
  counts: RegistrationCounts;
  setCounts: React.Dispatch<React.SetStateAction<RegistrationCounts>>;
  semester: string;
  setSemester: React.Dispatch<React.SetStateAction<string>>;
  semesterOptions: SemesterOption[];
  filteredRegistrations: Registration[];
  stats: Stats;
  fetchRegistrations: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchClasses: () => Promise<void>;
  exportExcel: () => Promise<void>;
  approve: (registrationId: string) => Promise<unknown>;
  reject: (registrationId: string, reason?: string) => Promise<unknown>;
  bulkApprove: (ids: string[]) => Promise<unknown>;
}

export default function useAdminRegistrations(): UseAdminRegistrationsReturn {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [viewMode, setViewMode] = useState('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [classId, setClassId] = useState('');
  const [exporting, setExporting] = useState(false);
  const [counts, setCounts] = useState<RegistrationCounts>({ cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 });

  const { options: semesterOptions, currentSemester } = useSemesterData();
  const [semester, setSemester] = useState(() => getCurrentSemesterValue(true));

  // Sync with backend current semester when available
  useEffect(() => {
    if (currentSemester && semesterOptions.length > 0) {
      const inOptions = semesterOptions.some((opt: SemesterOption) => opt.value === currentSemester);
      if (inOptions && semester !== currentSemester) {
        setSemester(currentSemester);
      }
    }
  }, [currentSemester, semesterOptions, semester]);

  const getStatusFromViewMode = (): string | undefined => {
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
      const dataTyped = data as { items?: Registration[]; total?: number | string; counts?: RegistrationCounts };
      setRegistrations(Array.isArray(dataTyped.items) ? dataTyped.items : (Array.isArray(data) ? data as Registration[] : []));
      setTotal(parseInt(String(dataTyped.total || 0)));
      if (dataTyped.counts) setCounts(dataTyped.counts);
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
      const list = extractActivitiesFromAxiosResponse(res) as Activity[];
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

  // Listen for data changes from same tab
  useDataChangeListener(['REGISTRATIONS', 'APPROVALS', 'ACTIVITIES'], fetchRegistrations, { debounceMs: 500 });

  // Auto-refresh for cross-user sync
  useAutoRefresh(fetchRegistrations, { 
    intervalMs: 30000, 
    enabled: !!semester,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

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

  const stats = useMemo((): Stats => ({
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
