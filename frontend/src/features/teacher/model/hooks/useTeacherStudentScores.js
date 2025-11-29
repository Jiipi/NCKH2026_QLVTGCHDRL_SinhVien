/**
 * Teacher Student Scores Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho điểm rèn luyện sinh viên của giáo viên
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherStudentScoresApi } from '../../services/teacherStudentScoresApi';
import { mapStudentScoreToUI } from '../mappers/teacher.mappers';
import { useDataChangeListener, useAutoRefresh } from '../../../../shared/lib/dataRefresh';

/**
 * Hook quản lý điểm rèn luyện sinh viên của giáo viên
 */
export function useTeacherStudentScores() {
  const [scoresData, setScoresData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business logic: Load scores
  const load = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherStudentScoresApi.list(params);
      
      if (result.success) {
        setScoresData(result.data.items || []);
        setTotal(result.data.total || 0);
      } else {
        console.error('[useTeacherStudentScores] Load error:', result.error);
        setError(result.error || 'Không thể tải danh sách điểm rèn luyện');
        setScoresData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('[useTeacherStudentScores] Load error:', err);
      setError(err?.message || 'Không thể tải danh sách điểm rèn luyện');
      setScoresData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Business logic: Refresh
  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-reload when scores or attendance data changes from other components (same tab)
  useDataChangeListener(['SCORES', 'ATTENDANCE', 'ACTIVITIES'], refresh, { debounceMs: 500 });

  // Auto-refresh for cross-user sync
  useAutoRefresh(refresh, { 
    intervalMs: 30000, 
    enabled: true,
    refreshOnFocus: true,
    refreshOnVisible: true 
  });

  // Business logic: Transform scores
  const scores = useMemo(() => {
    if (!scoresData || scoresData.length === 0) {
      return [];
    }
    return scoresData.map(mapStudentScoreToUI);
  }, [scoresData]);

  // Business logic: Get student score detail
  const getStudentScore = useCallback(async (studentId, semester) => {
    try {
      const result = await teacherStudentScoresApi.getStudentScore(studentId, semester);
      if (result.success) {
        return mapStudentScoreToUI(result.data);
      } else {
        console.error('[useTeacherStudentScores] Get score error:', result.error);
        return null;
      }
    } catch (err) {
      console.error('[useTeacherStudentScores] Get score error:', err);
      return null;
    }
  }, []);

  return {
    // Data
    scores,
    total,
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    load,
    getStudentScore
  };
}

