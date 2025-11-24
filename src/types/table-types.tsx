import type { ColumnDef, Table } from "@tanstack/react-table";

export interface ExpenseProps {
    "label": string,
    "note": string,
    "category": string,
    "type": string,
    "amount": number,
    "date": string
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