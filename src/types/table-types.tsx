import type { ColumnDef, Table } from "@tanstack/react-table";

export type AttributeType = "number" | "text" | "date" | "email";

export interface AttributeProps {
  id: number,
  name: string,
  description: string,
  type: AttributeType,
  createdAt: string,
  updatedAt: string
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumnKey?: string;
  facetedFilters?: FacetedFilterConfig[];
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
}

export interface DataTableRowActionsProps {
  row: any;
  onDelete: (row: any) => void;
  onEdit: (row: any) => void;
}