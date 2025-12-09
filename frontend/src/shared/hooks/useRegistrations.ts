/**
 * useRegistrations Hook
 * Business Layer - Registration operations hook
 */

import { useState, useCallback, useEffect } from 'react';
import { registrationApi, GetRegistrationsParams } from '../api/repositories';
import type { Registration, PaginatedResponse } from '../types';

export interface UseRegistrationsOptions {
    autoFetch?: boolean;
    initialParams?: GetRegistrationsParams;
}

export interface UseRegistrationsReturn {
    registrations: Registration[];
    pagination: PaginatedResponse<Registration>['pagination'] | null;
    loading: boolean;
    error: Error | null;
    fetchRegistrations: (params?: GetRegistrationsParams) => Promise<void>;
    refetch: () => Promise<void>;
    approveRegistration: typeof registrationApi.approveRegistration;
    rejectRegistration: typeof registrationApi.rejectRegistration;
    bulkUpdate: typeof registrationApi.bulkUpdateRegistrations;
}

export function useRegistrations(options: UseRegistrationsOptions = {}): UseRegistrationsReturn {
    const { autoFetch = false, initialParams } = options;

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [pagination, setPagination] = useState<PaginatedResponse<Registration>['pagination'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [currentParams, setCurrentParams] = useState<GetRegistrationsParams | undefined>(initialParams);

    const fetchRegistrations = useCallback(async (params?: GetRegistrationsParams) => {
        setLoading(true);
        setError(null);
        const fetchParams = params || currentParams;
        setCurrentParams(fetchParams);

        try {
            const response = await registrationApi.getRegistrations(fetchParams);
            setRegistrations(response.items || []);
            setPagination(response.pagination || null);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch registrations:', err);
        } finally {
            setLoading(false);
        }
    }, [currentParams]);

    const refetch = useCallback(() => fetchRegistrations(currentParams), [fetchRegistrations, currentParams]);

    useEffect(() => {
        if (autoFetch) {
            fetchRegistrations(initialParams);
        }
    }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        registrations,
        pagination,
        loading,
        error,
        fetchRegistrations,
        refetch,
        approveRegistration: registrationApi.approveRegistration.bind(registrationApi),
        rejectRegistration: registrationApi.rejectRegistration.bind(registrationApi),
        bulkUpdate: registrationApi.bulkUpdateRegistrations.bind(registrationApi),
    };
}

export default useRegistrations;
