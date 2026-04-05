import { api } from './index';
import type { TemplateProps } from '../types/index';

export const templateApi = {
    fetchTemplates: async (): Promise<TemplateProps[]> => {
        const templates_list = await api.get<TemplateProps[]>('/templates');
        return templates_list.data;
    },
    fetchTemplateById: async (templateId: string): Promise<TemplateProps> => {
        const template = await api.get<TemplateProps>(`/templates/${templateId}`);
        return template.data;
    },
    createTemplate: async (templateData: Omit<TemplateProps, 'id' | 'createdAt' | 'state' | 'version' | 'parentTemplateId'>): Promise<TemplateProps> => {
        const new_template = await api.post<TemplateProps>('/templates', templateData);
        return new_template.data;
    },
    updateTemplate: async (templateId: string, templateData: Omit<TemplateProps, 'id' | 'createdAt' | 'state' | 'version' | 'parentTemplateId'>): Promise<TemplateProps> => {
        const updated_template = await api.put<TemplateProps>(`/templates/${templateId}`, templateData);
        return updated_template.data;
    },
    rollbackTemplate: async (templateId: string): Promise<void> => {
        await api.post(`/templates/${templateId}/rollback`);
    },
}