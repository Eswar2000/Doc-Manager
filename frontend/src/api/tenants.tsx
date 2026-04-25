import { api } from './index';
import type { AddMemberRequest, CreateTenantRequest, TenantProps, TenantRole, UpdateTenantRequest } from '@/types';

export const tenantApi = {
    fetchMyTenants: async (): Promise<TenantProps[]> => {
        const tenants_list = await api.get<TenantProps[]>('/tenants/my');
        return tenants_list.data;
    },
    fetchTenants: async (): Promise<TenantProps[]> => {
        const tenants_list = await api.get<TenantProps[]>('/tenants');
        return tenants_list.data;
    },
    fetchTenantById: async (tenantId: string): Promise<TenantProps> => {
        const tenant = await api.get<TenantProps>(`/tenants/${tenantId}`);
        return tenant.data;
    },
    createTenant: async (tenantData: CreateTenantRequest): Promise<TenantProps> => {
        const new_tenant = await api.post<TenantProps>('/tenants', tenantData);
        return new_tenant.data;
    },
    updateTenant: async (tenantId: string, tenantData: UpdateTenantRequest): Promise<TenantProps> => {
        const updated_tenant = await api.put<TenantProps>(`/tenants/${tenantId}`, tenantData);
        return updated_tenant.data;
    },
    addMember: async (tenantId: string, memberData: AddMemberRequest): Promise<void> => {
        await api.post(`/tenants/${tenantId}/members`, memberData);
    },
    removeMember: async (tenantId: string, userId: string): Promise<void> => {
        await api.delete(`/tenants/${tenantId}/members/${encodeURIComponent(userId)}`);
    },
    updateMemberRoles: async (tenantId: string, userId: string, roles: TenantRole[]): Promise<void> => {
        await api.put(`/tenants/${tenantId}/members/${encodeURIComponent(userId)}`, roles);
    }
}