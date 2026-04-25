import { useQuery } from '@tanstack/react-query';
import { tenantApi } from '@/api/tenants';
import { useTenantStore } from '@/stores/tenant-store';
import { useEffect } from 'react';

export const useMyTenants = () => {
    const { setTenants, setCurrentTenant, currentTenantId } = useTenantStore();

    const query = useQuery({
        queryKey: ['my-tenants'],
        queryFn: tenantApi.fetchMyTenants,
        staleTime: 1000 * 60 * 10,     // 10 minutes
        gcTime: 1000 * 60 * 30,        // 30 minutes
        refetchOnWindowFocus: false,
    });

    // Auto-select tenant when data is loaded
    useEffect(() => {
        if (query.data && query.data.length > 0) {
            setTenants(query.data);

            // Auto select first tenant or restore from localStorage
            const savedTenantId = localStorage.getItem('currentTenantId');
            const validSavedTenant = query.data.find(t => t.id === savedTenantId);

            if (validSavedTenant) {
                setCurrentTenant(validSavedTenant.id);
            } else if (!currentTenantId) {
                setCurrentTenant(query.data[0].id);
            }
        }
    }, [query.data]);

    return query;
};