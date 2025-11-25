/**
 * Monitor Certificates Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho certificates lớp trưởng
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { monitorCertificatesApi } from '../../services/monitorCertificatesApi';

/**
 * Hook quản lý chứng nhận
 */
export function useMonitorCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ semester: '', year: '', category: '' });
  const [activityTypes, setActivityTypes] = useState([]);

  // Business logic: Load certificates
  const loadCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const result = await monitorCertificatesApi.list();
      if (result.success) {
        setCertificates(result.data || []);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error('Error loading certificates:', err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Business logic: Load activity types
  const loadActivityTypes = useCallback(async () => {
    try {
      const result = await monitorCertificatesApi.getActivityTypes();
      if (result.success) {
        setActivityTypes(result.data || []);
      } else {
        setActivityTypes([]);
      }
    } catch (err) {
      console.error('Error loading activity types:', err);
      setActivityTypes([]);
    }
  }, []);

  // Business logic: Parse date safely
  const parseDateSafe = useCallback((dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }, []);

  // Business logic: Format date
  const formatDate = useCallback((dateStr) => {
    const date = parseDateSafe(dateStr);
    return date ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  }, [parseDateSafe]);

  // Business logic: Get semester from date
  const getSemesterFromDate = useCallback((dateStr) => {
    const date = parseDateSafe(dateStr);
    if (!date) return '—';
    const month = date.getMonth() + 1;
    return month >= 9 ? 'Học kỳ 1' : 'Học kỳ 2';
  }, [parseDateSafe]);

  // Business logic: Get academic year
  const getAcademicYear = useCallback((dateStr) => {
    const date = parseDateSafe(dateStr);
    if (!date) return '—';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }, [parseDateSafe]);

  // Business logic: Filter certificates
  const filteredCertificates = useMemo(() => {
    let filtered = certificates;
    if (searchText) {
      filtered = filtered.filter(cert => 
        cert.hoat_dong?.ten_hd?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filters.semester) {
      filtered = filtered.filter(cert => 
        getSemesterFromDate(cert.hoat_dong?.ngay_bd) === filters.semester
      );
    }
    if (filters.year) {
      filtered = filtered.filter(cert => 
        getAcademicYear(cert.hoat_dong?.ngay_bd) === filters.year
      );
    }
    if (filters.category) {
      filtered = filtered.filter(cert => 
        cert.hoat_dong?.loai_hd_id === filters.category
      );
    }
    return filtered;
  }, [certificates, searchText, filters, getSemesterFromDate, getAcademicYear]);

  // Business logic: Get total points
  const totalPoints = useMemo(() => {
    return certificates.reduce((sum, cert) => 
      sum + (parseFloat(cert.hoat_dong?.diem_rl) || 0), 0
    );
  }, [certificates]);

  // Business logic: Get unique years
  const uniqueYears = useMemo(() => {
    const years = certificates.map(cert => getAcademicYear(cert.hoat_dong?.ngay_bd));
    return [...new Set(years)].filter(y => y !== '—').sort().reverse();
  }, [certificates, getAcademicYear]);

  // Business logic: Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ semester: '', year: '', category: '' });
    setSearchText('');
  }, []);

  // Business logic: Handle download certificate
  const handleDownloadCertificate = useCallback(async (activity) => {
    // Placeholder - chức năng đang phát triển
    return Promise.resolve();
  }, []);

  // Effects
  useEffect(() => {
    loadCertificates();
    loadActivityTypes();
  }, [loadCertificates, loadActivityTypes]);

  return {
    // Data
    certificates: filteredCertificates,
    activityTypes,
    totalPoints,
    uniqueYears,
    
    // State
    loading,
    searchText,
    setSearchText,
    filters,
    setFilters,
    
    // Helpers
    formatDate,
    getSemesterFromDate,
    getAcademicYear,
    clearFilters,
    
    // Actions
    handleDownloadCertificate
  };
}

