import { create } from 'zustand';
import type { TenantProps } from '@/types';

interface TenantState {
    tenants: TenantProps[];
    currentTenantId: string | null;
    isLoading: boolean;

    setTenants: (tenants: TenantProps[]) => void;
    setCurrentTenant: (tenantId: string) => void;
    clear: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
    tenants: [],
    currentTenantId: null,
    isLoading: false,

    setTenants: (tenants) => set({ tenants }),
    setCurrentTenant: (tenantId) => {
        set({ currentTenantId: tenantId });
        // Set header for all future API calls
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentTenantId', tenantId);
        }
    },
    clear: () => set({ tenants: [], currentTenantId: null }),
}));