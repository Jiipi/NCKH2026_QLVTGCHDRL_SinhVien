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
      if (result.success && 'data' in result) {
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
      if (result.success && 'data' in result) {
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

  const getCertificateActivity = useCallback((cert) => cert?.hoat_dong || cert?.activity || cert || {}, []);

  const getActivityDate = useCallback((cert) => {
    const activity = getCertificateActivity(cert);
    return activity.ngay_bd || activity.ngay_to_chuc || activity.start_date || cert?.ngay_tham_gia || cert?.ngay_duyet;
  }, [getCertificateActivity]);

  const getActivityTypeId = useCallback((cert) => {
    const activity = getCertificateActivity(cert);
    return activity.loai_hd_id ?? activity.loai_hd?.id ?? activity.loai_hd?.ma_loai_hd ?? activity.activity_type_id ?? activity.type_id;
  }, [getCertificateActivity]);

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
    const normalizedSearch = searchText.trim().toLowerCase();

    if (normalizedSearch) {
      filtered = filtered.filter(cert => {
        const activity = getCertificateActivity(cert);
        return [activity.ten_hd, activity.dia_diem, activity.don_vi_to_chuc, activity.loai_hd?.ten_loai_hd]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(normalizedSearch));
      });
    }
    if (filters.semester) {
      filtered = filtered.filter(cert =>
        getSemesterFromDate(getActivityDate(cert)) === filters.semester
      );
    }
    if (filters.year) {
      filtered = filtered.filter(cert =>
        getAcademicYear(getActivityDate(cert)) === filters.year
      );
    }
    if (filters.category) {
      filtered = filtered.filter(cert =>
        String(getActivityTypeId(cert) ?? '') === String(filters.category)
      );
    }
    return filtered;
  }, [certificates, searchText, filters, getCertificateActivity, getActivityDate, getActivityTypeId, getSemesterFromDate, getAcademicYear]);

  // Business logic: Get total points
  const totalPoints = useMemo(() => {
    return certificates.reduce((sum, cert) => 
      sum + (parseFloat(cert.hoat_dong?.diem_rl) || 0), 0
    );
  }, [certificates]);

  // Business logic: Get unique years
  const uniqueYears = useMemo(() => {
    const years = certificates.map(cert => getAcademicYear(getActivityDate(cert)));
    return [...new Set(years)].filter(y => y !== '—').sort().reverse();
  }, [certificates, getActivityDate, getAcademicYear]);

  // Business logic: Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ semester: '', year: '', category: '' });
    setSearchText('');
  }, []);

  const escapeHtml = useCallback((value) => {
    return String(value ?? '—')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }, []);

  // Business logic: Handle download certificate
  const handleDownloadCertificate = useCallback(async (certificate) => {
    const activity = getCertificateActivity(certificate);
    const printWindow = window.open('', '_blank', 'width=960,height=720');
    if (!printWindow) {
      throw new Error('Không thể mở cửa sổ in chứng nhận');
    }

    const title = escapeHtml(activity.ten_hd || 'Hoạt động rèn luyện');
    const category = escapeHtml(activity.loai_hd?.ten_loai_hd || 'Hoạt động');
    const points = escapeHtml(activity.diem_rl || 0);
    const date = escapeHtml(formatDate(activity.ngay_bd));
    const location = escapeHtml(activity.dia_diem || 'Chưa xác định');
    const organizer = escapeHtml(activity.don_vi_to_chuc || 'Trường Đại học Đà Lạt');
    const completedAt = escapeHtml(formatDate(certificate?.ngay_duyet || certificate?.updated_at || activity.ngay_kt || activity.ngay_bd));
    const semester = escapeHtml(getSemesterFromDate(activity.ngay_bd));
    const academicYear = escapeHtml(getAcademicYear(activity.ngay_bd));

    printWindow.document.write(`<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Chứng nhận - ${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; font-family: Inter, Arial, sans-serif; color: #0f172a; background: #eef2ff; }
    .certificate { min-height: calc(100vh - 64px); border: 10px solid #1e3a8a; border-radius: 28px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #ecfeff 100%); padding: 56px; position: relative; overflow: hidden; }
    .certificate:before { content: ''; position: absolute; inset: 24px; border: 2px solid rgba(30, 58, 138, 0.16); border-radius: 20px; pointer-events: none; }
    .eyebrow { text-align: center; text-transform: uppercase; letter-spacing: 0.22em; color: #2563eb; font-weight: 800; font-size: 13px; }
    h1 { text-align: center; margin: 16px 0 8px; font-size: 44px; letter-spacing: -0.04em; color: #172554; }
    .subtitle { text-align: center; color: #64748b; font-weight: 700; }
    .activity { margin: 44px auto 28px; max-width: 760px; border: 1px solid #dbeafe; border-radius: 24px; background: rgba(255,255,255,0.82); padding: 28px; box-shadow: 0 20px 60px rgba(15,23,42,.08); }
    .activity-title { font-size: 28px; font-weight: 900; text-align: center; color: #0f172a; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 28px; }
    .item { border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 16px; }
    .label { color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    .value { margin-top: 4px; color: #0f172a; font-size: 16px; font-weight: 800; }
    .points { color: #1d4ed8; font-size: 22px; }
    .footer { display: flex; justify-content: space-between; gap: 24px; margin-top: 44px; color: #475569; font-weight: 700; }
    .signature { text-align: center; min-width: 220px; }
    .line { height: 1px; background: #94a3b8; margin-top: 56px; }
    @media print { body { background: white; padding: 0; } .certificate { min-height: 100vh; border-radius: 0; } }
  </style>
</head>
<body>
  <main class="certificate">
    <div class="eyebrow">Trường Đại học Đà Lạt</div>
    <h1>Chứng nhận hoàn thành</h1>
    <p class="subtitle">Xác nhận người học đã tham gia và hoàn thành hoạt động rèn luyện</p>
    <section class="activity">
      <div class="activity-title">${title}</div>
      <div class="grid">
        <div class="item"><div class="label">Loại hoạt động</div><div class="value">${category}</div></div>
        <div class="item"><div class="label">Điểm rèn luyện</div><div class="value points">${points} điểm</div></div>
        <div class="item"><div class="label">Thời gian</div><div class="value">${date}</div></div>
        <div class="item"><div class="label">Địa điểm</div><div class="value">${location}</div></div>
        <div class="item"><div class="label">Học kỳ</div><div class="value">${semester}</div></div>
        <div class="item"><div class="label">Năm học</div><div class="value">${academicYear}</div></div>
        <div class="item"><div class="label">Đơn vị tổ chức</div><div class="value">${organizer}</div></div>
        <div class="item"><div class="label">Ngày hoàn thành</div><div class="value">${completedAt}</div></div>
      </div>
    </section>
    <div class="footer">
      <div>Ngày in: ${escapeHtml(formatDate(new Date().toISOString()))}</div>
      <div class="signature">Xác nhận hệ thống<div class="line"></div></div>
    </div>
  </main>
  <script>window.onload = function() { window.focus(); window.print(); };</script>
</body>
</html>`);
    printWindow.document.close();
  }, [escapeHtml, formatDate, getCertificateActivity, getSemesterFromDate, getAcademicYear]);

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

