/**
 * useClassManagement Hook
 * Single Responsibility: Manage class data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import classesApi from '../../services/classesApi';

const DEFAULT_STATISTICS = {
  totalStudents: 0,
  totalActivities: 0,
  totalParticipants: 0,
  participationRate: 0,
  averageScore: 0
};

export function useClassManagement() {
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(DEFAULT_STATISTICS);
  const [loading, setLoading] = useState(true);
  const [assigningMonitor, setAssigningMonitor] = useState(false);
  const [selectedMonitorId, setSelectedMonitorId] = useState('');

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const classesData = await classesApi.getTeacherClasses();
      setClasses(classesData);
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0]);
      }
    } catch (err) {
      console.error('Load classes error:', err);
      showError('Không thể tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  }, [showError, selectedClass]);

  const loadClassStudents = useCallback(async (classId) => {
    try {
      const studentsData = await classesApi.getClassStudents(classId);
      setStudents(studentsData);
      
      // Get current monitor
      const currentClass = classes.find(c => c.id === classId);
      if (currentClass?.lop_truong) {
        setSelectedMonitorId(currentClass.lop_truong);
      }
    } catch (err) {
      console.error('Load students error:', err);
    }
  }, [classes]);

  const loadClassStatistics = useCallback(async (classId) => {
    try {
      const stats = await classesApi.getClassStatistics(classId);
      setStatistics({
        totalStudents: stats.totalStudents || 0,
        totalActivities: stats.totalActivities || 0,
        totalParticipants: stats.totalParticipants || 0,
        participationRate: stats.participationRate || 0,
        averageScore: stats.averageScore || 0
      });
    } catch (err) {
      console.error('Load statistics error:', err);
    }
  }, []);

  const handleAssignMonitor = useCallback(async () => {
    if (!selectedMonitorId) {
      showWarning('Vui lòng chọn sinh viên làm lớp trưởng');
      return;
    }

    setAssigningMonitor(true);
    try {
      await classesApi.assignMonitor(selectedClass.id, selectedMonitorId);
      showSuccess('Gán lớp trưởng thành công');
      // Refresh data
      await Promise.all([
        loadClasses(),
        loadClassStudents(selectedClass.id),
        loadClassStatistics(selectedClass.id)
      ]);
    } catch (err) {
      console.error('Assign monitor error:', err);
      showError(err.response?.data?.message || 'Không thể gán lớp trưởng');
    } finally {
      setAssigningMonitor(false);
    }
  }, [selectedMonitorId, selectedClass, showSuccess, showError, showWarning, loadClasses, loadClassStudents, loadClassStatistics]);

  const selectClass = useCallback((cls) => {
    setSelectedClass(cls);
  }, []);

  // Initial load
  useEffect(() => {
    loadClasses();
  }, []);

  // Load students and statistics when class changes
  useEffect(() => {
    if (selectedClass) {
      loadClassStudents(selectedClass.id);
      loadClassStatistics(selectedClass.id);
    }
  }, [selectedClass, loadClassStudents, loadClassStatistics]);

  return {
    // State
    classes,
    selectedClass,
    students,
    statistics,
    loading,
    assigningMonitor,
    selectedMonitorId,
    
    // Actions
    setSelectedMonitorId,
    selectClass,
    handleAssignMonitor,
    refreshClasses: loadClasses
  };
}
