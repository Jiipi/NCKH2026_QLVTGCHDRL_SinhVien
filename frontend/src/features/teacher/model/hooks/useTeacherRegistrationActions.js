import { useCallback } from 'react';
import { teacherRegistrationsApi } from '../../services/teacherRegistrationsApi';

export default function useTeacherRegistrationActions() {
  const approveRegistration = useCallback(async (id) => {
    if (!id) return { success: false, error: 'id là bắt buộc' };
    return teacherRegistrationsApi.approveRegistration(id);
  }, []);

  const rejectRegistration = useCallback(async (id, reason) => {
    if (!id) return { success: false, error: 'id là bắt buộc' };
    if (!reason) return { success: false, error: 'Lý do từ chối là bắt buộc' };
    return teacherRegistrationsApi.rejectRegistration(id, reason);
  }, []);

  return { approveRegistration, rejectRegistration };
}


