/**
 * Student Activity Detail Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho chi tiết hoạt động
 */

import { useState, useEffect } from 'react';
import activitiesApi from '../../../activities/services/activitiesApi';

/**
 * Hook quản lý chi tiết hoạt động
 */
export default function useStudentActivityDetail(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError('');

    activitiesApi.getActivityDetails(id)
      .then((result) => {
        if (!mounted) return;
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Không tải được hoạt động');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Không tải được hoạt động');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { data, loading, error: error || null };
}

