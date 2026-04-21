import { create } from 'zustand';
import type { TenantProps } from '@/types';

interface TenantState {
    tenants: TenantProps[];
    currentTenantId: string | null;
    isLoading: boolean;

    setTenants: (tenants: TenantProps[]) => void;
    setCurrentTenant: (tenantId: string) => void;
    updateTenant: (tenantId: string, updates: Partial<TenantProps>) => void;
    addTenant: (tenant: TenantProps) => void;
    removeTenant: (tenantId: string) => void;

    clear: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
    tenants: [],
    currentTenantId: null,
    isLoading: false,

    setTenants: (tenants) => set({ tenants }),
    setCurrentTenant: (tenantId) => {
        set({ currentTenantId: tenantId });
        // Persist selection across refresh
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentTenantId', tenantId);
        }
    },
    updateTenant: (tenantId, updates) =>
        set((state) => ({
            tenants: state.tenants.map((t) =>
                t.id === tenantId ? { ...t, ...updates } : t
            ),
        })),
    addTenant: (tenant) =>
        set((state) => ({
            tenants: [tenant, ...state.tenants],
        })),
    removeTenant: (tenantId) =>
        set((state) => {
            const updatedTenants = state.tenants.filter((t) => t.id !== tenantId);

            return {
                tenants: updatedTenants,
                currentTenantId:
                    state.currentTenantId === tenantId
                        ? updatedTenants[0]?.id ?? null
                        : state.currentTenantId,
            };
        }),
    clear: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentTenantId');
        }

        set({
            tenants: [],
            currentTenantId: null,
            isLoading: false,
        });
    },
}));