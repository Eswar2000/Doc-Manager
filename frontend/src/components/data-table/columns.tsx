import type { ColumnDef } from "@tanstack/react-table";

export function getColumns<T>(fields: Array<{
  accessorKey: keyof T | string;
  header?: ( column: any) => React.ReactNode;
  cell?: (row: any) => React.ReactNode;
  filterFn?: (row: any, id: string, value: any) => boolean;
  id?: string;
}>): ColumnDef<T>[] {
  return fields.map((field) => ({
    accessorKey: field.accessorKey,
    header: field.header,
    cell: field.cell,
    filterFn: field.filterFn,
    id: field.id
  }));
}