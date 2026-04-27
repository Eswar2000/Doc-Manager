import { api } from './index';
import type { AttributeProps } from '../types/index';

export const attributeApi = {
    fetchAttributes: async (): Promise<AttributeProps[]> => {
        const attributes_list = await api.get<AttributeProps[]>('/attributes');
        return attributes_list.data;
    },
    fetchAttributeById: async (attributeId: string): Promise<AttributeProps> => {
        const attribute = await api.get<AttributeProps>(`/attributes/${attributeId}`);
        return attribute.data;
    },
    createAttribute: async (attributeData: Omit<AttributeProps, 'id' | 'createdAt' | 'modifiedAt' | 'createdBy' | 'modifiedBy' | 'tenantId'>): Promise<AttributeProps> => {
        const new_attribute = await api.post<AttributeProps>('/attributes', attributeData);
        return new_attribute.data;
    },
    deleteAttribute: async (attributeId: string): Promise<void> => {
        await api.delete(`/attributes/${attributeId}`);
    },
    updateAttribute: async (attributeId: string, attributeData: Partial<Omit<AttributeProps, 'id' | 'createdAt' | 'modifiedAt' | 'createdBy' | 'modifiedBy' | 'type'>>): Promise<AttributeProps> => {
        const updated_attribute = await api.put<AttributeProps>(`/attributes/${attributeId}`, attributeData);
        return updated_attribute.data;
    }
}