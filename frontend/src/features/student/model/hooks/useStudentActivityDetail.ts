/**
 * Student Activity Detail Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho chi tiết hoạt động
 */

import { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../../../../shared/api/repositories';

/**
 * Hook quản lý chi tiết hoạt động
 */
export default function useStudentActivityDetail(id: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await activityApi.getActivityById(id);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Không tải được hoạt động');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch function để refresh data
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error: error || null, refetch };
}
