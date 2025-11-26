/**
 * Monitor Student Management Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho student management lớp trưởng
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { monitorStudentManagementApi } from '../../services/monitorStudentManagementApi';
import useSemesterData from '../../../../shared/hooks/useSemesterData';
import { getCurrentSemesterValue } from '../../../../shared/lib/semester';

/**
 * Hook quản lý sinh viên lớp
 */
export function useMonitorStudentManagement() {
  const [semester, setSemester] = useState(getCurrentSemesterValue());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('points_desc');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [showDetails, setShowDetails] = useState(null);
  const { options: semesterOptions } = useSemesterData();

  // Business logic: Load students
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const result = await monitorStudentManagementApi.list({ semester });
      
      if (result.success) {
        const responseData = result.data || {};
        const raw = responseData.students || responseData.items || responseData || [];
        const total = responseData.total || (Array.isArray(raw) ? raw.length : 0);

        const normalized = (Array.isArray(raw) ? raw : []).map(sv => {
          const nguoiDung = sv.nguoi_dung || {};
          const lop = sv.lop || {};
          
          return {
            id: sv.id,
            mssv: sv.mssv || '',
            ngay_sinh: sv.ngay_sinh,
            gt: sv.gt,
            dia_chi: sv.dia_chi,
            sdt: sv.sdt,
            nguoi_dung: {
              ho_ten: nguoiDung.ho_ten || '',
              email: nguoiDung.email || '',
              anh_dai_dien: nguoiDung.anh_dai_dien || nguoiDung.avatar || nguoiDung.profile_image || nguoiDung.image || sv.anh_dai_dien || sv.avatar || sv.profile_image
            },
            lop: {
              ten_lop: lop.ten_lop || '',
              khoa: lop.khoa || ''
            },
            totalPoints: sv.totalPoints ?? sv.totalPointsRounded ?? sv._count?.diem_danh ?? 0,
            activitiesJoined: sv.activitiesJoined ?? sv._count?.dang_ky_hd ?? 0,
            rank: sv.rank || 0,
            status: sv.status || 'active',
            lastActivityDate: sv.lastActivityDate || new Date().toISOString()
          };
        });

        setStudents(normalized);
        setPagination(prev => ({ ...prev, total }));
        setError('');
      } else {
        setError(result.error || 'Không thể tải danh sách sinh viên');
        setStudents([]);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err?.message || 'Không thể tải danh sách sinh viên');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [semester]);

  // Business logic: Normalize text for search
  const normalizeText = useCallback((text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }, []);

  // Business logic: Sort students
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      switch (sortBy) {
        case 'points_desc': return b.totalPoints - a.totalPoints;
        case 'points_asc': return a.totalPoints - b.totalPoints;
        case 'name_asc': return a.nguoi_dung.ho_ten.localeCompare(b.nguoi_dung.ho_ten);
        case 'name_desc': return b.nguoi_dung.ho_ten.localeCompare(a.nguoi_dung.ho_ten);
        case 'activities_desc': return b.activitiesJoined - a.activitiesJoined;
        default: return 0;
      }
    });
  }, [students, sortBy]);

  // Business logic: Filter students
  const filteredStudents = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') return sortedStudents;
    
    const searchNormalized = normalizeText(searchTerm);
    return sortedStudents.filter(student => {
      const nameNormalized = normalizeText(student.nguoi_dung.ho_ten);
      const mssvNormalized = normalizeText(student.mssv);
      const emailNormalized = normalizeText(student.nguoi_dung.email);
      
      return nameNormalized.includes(searchNormalized) ||
        mssvNormalized.includes(searchNormalized) ||
        emailNormalized.includes(searchNormalized);
    });
  }, [sortedStudents, searchTerm, normalizeText]);

  // Business logic: Paginate filtered results
  const pageItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, pagination.page, pagination.limit]);

  // Business logic: Calculate stats
  const stats = useMemo(() => {
    return {
      total: students.length,
      avgPoints: students.length > 0 
        ? Math.round((students.reduce((sum, s) => sum + s.totalPoints, 0) / students.length) * 10) / 10 
        : 0,
      topPerformers: students.filter(s => s.totalPoints >= 90).length
    };
  }, [students]);

  // Helper functions for UI
  const getRankIcon = useCallback((rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  }, []);

  const getRankBadgeClass = useCallback((rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700';
  }, []);

  const getPointsColor = useCallback((points) => {
    if (points >= 80) return 'text-emerald-600';
    if (points >= 50) return 'text-blue-600';
    if (points >= 30) return 'text-amber-600';
    return 'text-rose-600';
  }, []);

  const getProgressColor = useCallback((points) => {
    if (points >= 80) return 'from-emerald-500 to-teal-500';
    if (points >= 50) return 'from-blue-500 to-cyan-500';
    if (points >= 30) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  }, []);

  // Business logic: Export data
  const handleExportData = useCallback(() => {
    const headers = ['MSSV', 'Họ tên', 'Email', 'Điểm RL', 'Số hoạt động', 'Xếp hạng'];
    const csvData = filteredStudents.map(student => [
      student.mssv,
      student.nguoi_dung.ho_ten,
      student.nguoi_dung.email,
      student.totalPoints,
      student.activitiesJoined,
      student.rank
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_sinh_vien_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredStudents]);

  // Effects
  useEffect(() => {
    loadStudents();
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [semester, loadStudents]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, sortBy]);

  return {
    // Data
    students: pageItems,
    filteredStudents,
    stats,
    
    // State
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    semester,
    setSemester,
    semesterOptions,
    pagination,
    setPagination,
    showDetails,
    setShowDetails,
    
    // Helpers
    getRankIcon,
    getRankBadgeClass,
    getPointsColor,
    getProgressColor,
    
    // Actions
    loadStudents,
    handleExportData,
    filteredTotal: filteredStudents.length
  };
}
