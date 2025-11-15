import { useCallback, useEffect, useMemo, useState } from 'react';
import http from '../../../shared/api/http';
import useSemesterData from '../../../hooks/useSemesterData';

export default function useStudentScores() {
  const { options: semesterOptions, currentSemester } = useSemesterData();

  const [userSelectedSemester, setUserSelectedSemester] = useState(() => {
    try { return !!sessionStorage.getItem('current_semester'); } catch { return false; }
  });

  const [semester, setSemester] = useState(() => {
    try { return sessionStorage.getItem('current_semester') || ''; } catch { return ''; }
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentSemester && !userSelectedSemester && !semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester, userSelectedSemester, semester]);

  const handleSemesterChange = useCallback((newSemester) => {
    if (newSemester !== semester) {
      setSemester(newSemester);
      setUserSelectedSemester(true);
      setData(null);
      try { sessionStorage.setItem('current_semester', newSemester); } catch {}
    }
  }, [semester]);

  useEffect(() => {
    if (semester && userSelectedSemester) {
      try { sessionStorage.setItem('current_semester', semester); } catch {}
    }
  }, [semester, userSelectedSemester]);

  const loadScores = useCallback(async () => {
    if (!semester) { setData(null); return; }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const response = await http.get('/core/dashboard/scores/detailed', { params: { semester } });
      if (response?.data?.data) {
        const extracted = response.data.data;
        setData(extracted);
      } else {
        setData(response?.data?.data || response?.data || null);
      }
    } catch (err) {
      setError(`Không thể tải dữ liệu điểm cho học kỳ ${semester}. Vui lòng thử lại.`);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => { loadScores(); }, [loadScores]);

  const targetScore = 100;
  const currentScore = data?.summary?.tong_diem || 0;
  const progressPercentage = useMemo(() => {
    if (!data || !data.summary) return 0;
    return Math.min((currentScore / targetScore) * 100, 100);
  }, [data, currentScore]);

  const stats = useMemo(() => {
    if (!data) return { categoryStats: [], totalActivities: 0, averagePoints: 0 };
    const criteriaBreakdown = data.criteria_breakdown || [];
    const categoryStats = criteriaBreakdown.map(criteria => {
      let color = 'yellow';
      if (criteria.key === 'hoc_tap') color = 'blue';
      else if (criteria.key === 'tinh_nguyen') color = 'red';
      else if (criteria.key === 'cong_dan') color = 'purple';
      else if (criteria.key === 'noi_quy') color = 'green';
      return {
        key: criteria.key,
        name: criteria.name,
        color,
        points: criteria.current,
        max: criteria.max,
        percentage: criteria.percentage,
      };
    });
    return {
      categoryStats,
      totalActivities: data.summary?.tong_hoat_dong || 0,
      averagePoints: data.summary?.tong_hoat_dong > 0 ? (data.summary?.tong_diem / data.summary?.tong_hoat_dong) : 0,
    };
  }, [data]);

  return {
    semesterOptions,
    semester,
    handleSemesterChange,
    data,
    loading,
    error,
    stats,
    targetScore,
    currentScore,
    progressPercentage,
  };
}
