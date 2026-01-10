export interface SidebarItemProps {
    icon: any;
    text: string;
    active?: boolean;
    alert?: boolean;
    to: string;
}

export interface SidebarChildrenProps {
    children?: any;
}

export interface SidebarContextType {
    expanded: boolean;
}

import type { ColumnDef, Table } from "@tanstack/react-table";

export type AttributeType = "number" | "text" | "date" | "email";

export type FormFieldType = "text" | "textarea" | "select" | "number";

export type EditorMode = 'template' | 'snippet';

export interface EditorInitialData {
  id: string;
  name: string;
  description?: string;
  htmlContent: string;
  jsonContent?: any;
  attributesConfig: Record<
    string,
    {
      required: boolean;
      hidden: boolean;
      defaultValue: string | null;
    }
  >;
}

export interface EditorProps {
  mode: EditorMode;
  initialData?: EditorInitialData;
}

export interface AttributeProps {
  id: number,
  name: string,
  description: string,
  type: AttributeType,
  createdAt: string,
  updatedAt: string
}

export interface TemplateProps {
  id: string,
  name: string,
  description?: string,
  version: number,
  state: 'archived' | 'active',
  parentTemplateId?: string | null,
  htmlContent: string,
  jsonContent: any,
  createdAt: string,
  attributes: Array<{
    attributeId: string;
    label: string;
    required: boolean;
    hidden: boolean;
    defaultValue: string | null;
    trackerIds: string[];
  }>,
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumnKey?: string;
  facetedFilters?: FacetedFilterConfig[];
  showCreateButton?: boolean;
  onCreate?: () => void;
}

export interface FacetedFilterOption {
  label: string;
  value: string;
}

export interface FacetedFilterConfig {
  columnKey: string;
  title: string;
  options: FacetedFilterOption[];
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterColumnKey?: string;
  facetedFilters?: FacetedFilterConfig[];
  showCreateButton?: boolean;
  onCreate?: () => void;
}

export interface TableAction<T> {
  title: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
  variant?: "default" | "secondary" | "destructive";
}

export interface DataTableRowActionsProps {
  row: any;
  onDelete: (row: any) => void;
  onEdit: (row: any) => void;
}

export interface DynamicField {
  name: string;
  label: string;
  type: FormFieldType;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number; // for text and textarea
  options?: string[]; // for select
}

export interface DynamicDialogProps {
  open: boolean;
  title: string;
  description?: string;
  fields: DynamicField[];
  initialValues?: Record<string, any>;
  submitButtonText?: string;
  cancelButtonText?: string;
  onUpdate: (values: Record<string, any>) => void;
  onCancel: () => void;
}

export type Placeholder = {
  id: string;
  label: string;
};