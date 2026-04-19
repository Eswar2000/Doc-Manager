import type { ColumnDef, Table, ColumnFiltersState } from "@tanstack/react-table";

export interface SidebarItemProps {
    icon: any;
    text: string;
    active?: boolean;
    alert?: boolean;
    to?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export interface SidebarChildrenProps {
    children?: any;
}

export interface SidebarContextType {
    expanded: boolean;
}

export interface CurrentUser {
    name: string;
    email: string;
    initials: string;
    userId?: string;
}

export interface User {
  name: string;
  email: string;
}

export type AttributeType = "number" | "text" | "date" | "email";

export type FormFieldType = "text" | "textarea" | "select" | "number" | "conditions" | "multiselect";

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

export interface AttributeProps {
  id: number,
  name: string,
  description: string,
  type: AttributeType,
  createdAt: string,
  modifiedAt?: string,
  createdBy: User,
  modifiedBy?: User,
  tenantId?: string
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
  modifiedAt?: string,
  createdBy: User,
  modifiedBy?: User,
  attributes: Array<{
    attributeId: string;
    label: string;
    required: boolean;
    hidden: boolean;
    type: AttributeType;
    defaultValue: string | null;
    trackerIds: string[];
  }>,
  rules: Array<{
    ruleId: string;
    name: string;
    action: 'show' | 'hide';
    condition: {
      join: 'and' | 'or';
      items: Array<{
        fieldKey: string;
        operator: string;
        value?: string;
      }>
    },
    content: any;
  }>,
}

export interface TemplateRollbackProps {
  srcTemplateId: string;
  destTemplateId?: string;
}

export interface DocumentGenerationProps {
  templateId: string;
  attributeValues: Record<string, string>;
}

/* Tenant Props */

export type TenantRole = "can_create" | "can_edit" | "can_delete" | "can_view" | "can_use" | "admin";

export interface TenantMember {
  userId: string;
  roles: TenantRole[];
}

export interface TenantBranding {
  header?: string;
  footer?: string;
  table?: string;
}

export interface TemplateMetadataField {
  name: string;
  type: "Text" | "Single Select" | "Multi Select";
  options?: string[];
}

export interface TenantProps {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
  members: TenantMember[];
  branding?: TenantBranding;
  templateSettings?: {
    metadata: TemplateMetadataField[];
  };
  attributeSettings?: {
    mandatoryAttributes: string[];
  };
}

export interface CreateTenantRequest {
  name: string;
  description?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  description?: string;
}

export interface AddMemberRequest {
  new_member: string;
  roles: TenantRole[];
}

export interface UpdateMemberRolesRequest {
  roles: TenantRole[];
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumnKey?: string;
  facetedFilters?: FacetedFilterConfig[];
  showCreateButton?: boolean;
  onCreate?: () => void;

  // Optional - only needed when you want controlled filters
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
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

  // operatorOptions can be either a global array or a map from attribute name to operator list
  operatorOptions?: string[] | Record<string, string[]>;
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

export interface LoaderProps {
  screenHeader: string,
  screenMessage: string
}

export type OverlayLoaderProps = {
  show: boolean;
  message?: string;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onHome?: () => void;
  homeLabel?: string;
  retryLabel?: string;
}