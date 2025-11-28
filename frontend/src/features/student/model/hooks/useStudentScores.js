/**
 * Student Scores Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho điểm rèn luyện
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { studentScoresApi } from '../../services/studentScoresApi';
import { mapScoresToUI } from '../mappers/student.mappers';
import useSemesterData from '../../../../shared/hooks/useSemesterData';

/**
 * Hook quản lý điểm rèn luyện của sinh viên
 */
export default function useStudentScores() {
  const { options: semesterOptions, currentSemester } = useSemesterData();

  // Semester state
  const [userSelectedSemester, setUserSelectedSemester] = useState(() => {
    try {
      return !!sessionStorage.getItem('current_semester');
    } catch {
      return false;
    }
  });

  const [semester, setSemester] = useState(() => {
    try {
      return sessionStorage.getItem('current_semester') || '';
    } catch {
      return '';
    }
  });

  // Data state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize semester when options are loaded
  useEffect(() => {
    if (semesterOptions.length > 0) {
      const semesterInOptions = semesterOptions.some(opt => opt.value === semester);
      if (!semester || !semesterInOptions) {
        const currentInOptions = currentSemester && semesterOptions.some(opt => opt.value === currentSemester);
        const newSemester = currentInOptions ? currentSemester : semesterOptions[0]?.value;
        if (newSemester && newSemester !== semester) {
          setSemester(newSemester);
        }
      }
    }
  }, [semesterOptions, currentSemester, semester]);

  // Business logic: Handle semester change
  const handleSemesterChange = useCallback((newSemester) => {
    if (newSemester !== semester) {
      setSemester(newSemester);
      setUserSelectedSemester(true);
      setData(null);
      try {
        sessionStorage.setItem('current_semester', newSemester);
      } catch {}
    }
  }, [semester]);

  useEffect(() => {
    if (semester && userSelectedSemester) {
      try {
        sessionStorage.setItem('current_semester', semester);
      } catch {}
    }
  }, [semester, userSelectedSemester]);

  // Business logic: Load scores data
  const loadScores = useCallback(async () => {
    if (!semester) {
      setData(null);
      return;
    }
    
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const result = await studentScoresApi.getDetailedScores(semester);
      
      // Debug: Log API response
      console.log('[useStudentScores] API Response:', {
        semester,
        rawData: result.data,
        summary: result.data?.summary,
        tong_diem: result.data?.summary?.tong_diem
      });
      
      if (result.success) {
        // Map API data to UI format
        const mappedData = mapScoresToUI(result.data);
        
        // Debug: Log mapped data
        console.log('[useStudentScores] Mapped Data:', {
          summary: mappedData.summary,
          tong_diem: mappedData.summary?.tong_diem,
          activities: mappedData.activities?.length || 0
        });
        
        setData(mappedData);
      } else {
        setError(result.error || `Không thể tải dữ liệu điểm cho học kỳ ${semester}. Vui lòng thử lại.`);
        setData(null);
      }
    } catch (err) {
      setError(`Không thể tải dữ liệu điểm cho học kỳ ${semester}. Vui lòng thử lại.`);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  // Business logic: Calculate target and progress
  const targetScore = 100;
  const currentScore = data?.summary?.tong_diem || 0;
  
  const progressPercentage = useMemo(() => {
    if (!data || !data.summary) return 0;
    return Math.min((currentScore / targetScore) * 100, 100);
  }, [data, currentScore]);

  // Business logic: Calculate stats
  const stats = useMemo(() => {
    if (!data) {
      return { categoryStats: [], totalActivities: 0, averagePoints: 0 };
    }
    
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
      averagePoints: data.summary?.tong_hoat_dong > 0 
        ? (data.summary?.tong_diem / data.summary?.tong_hoat_dong) 
        : 0,
    };
  }, [data]);

  return {
    // State
    semesterOptions,
    semester,
    handleSemesterChange,
    data,
    loading,
    error,
    
    // Business logic results
    stats,
    targetScore,
    currentScore,
    progressPercentage
  };
}

