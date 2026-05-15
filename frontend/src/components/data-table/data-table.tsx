import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";
import { SearchX } from "lucide-react";
import type { DataTableProps } from "@/types/index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumnKey,
  facetedFilters,
  showCreateButton,
  onCreate,
  emptyState,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Internal state for column filters when not controlled by parent
  const [internalFilters, setInternalFilters] = React.useState<ColumnFiltersState>([]);
  
  const columnFilters = controlledColumnFilters !== undefined ? controlledColumnFilters : internalFilters;

  const setColumnFilters = (updater: any) => {
    const newFilters = typeof updater === "function" 
      ? updater(columnFilters) 
      : updater;

    if (controlledColumnFilters !== undefined && onColumnFiltersChange) {
      onColumnFiltersChange(newFilters);
    } else {
      setInternalFilters(newFilters);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} filterColumnKey={filterColumnKey} facetedFilters={facetedFilters} showCreateButton={showCreateButton} onCreate={onCreate} />
      <div className="overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="px-4 py-2"
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-4 py-2 max-w-[225px] truncate whitespace-nowrap overflow-hidden text-ellipsis" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="p-0"
                >
                  {(() => {
                    const totalRows = table.getCoreRowModel().rows.length;
                    const isFiltered = table.getState().columnFilters.length > 0;

                    // Filters are active but no matching rows — offer to reset.
                    if (totalRows > 0 && isFiltered) {
                      return (
                        <Empty className="border-0 py-12">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <SearchX className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyTitle>No matching results</EmptyTitle>
                            <EmptyDescription>
                              Try adjusting your search or filter to find what you're looking for.
                            </EmptyDescription>
                          </EmptyHeader>
                          <EmptyContent>
                            <Button
                              variant="outline"
                              onClick={() => table.resetColumnFilters()}
                            >
                              Reset filters
                            </Button>
                          </EmptyContent>
                        </Empty>
                      );
                    }

                    // No data at all — show CTA empty state when provided.
                    if (totalRows === 0 && emptyState) {
                      const handleAction = emptyState.onAction ?? onCreate;
                      return (
                        <Empty className="border-0 py-12">
                          <EmptyHeader>
                            {emptyState.icon && (
                              <EmptyMedia variant="icon">
                                {emptyState.icon}
                              </EmptyMedia>
                            )}
                            <EmptyTitle>{emptyState.title}</EmptyTitle>
                            {emptyState.description && (
                              <EmptyDescription>
                                {emptyState.description}
                              </EmptyDescription>
                            )}
                          </EmptyHeader>
                          {emptyState.actionLabel && handleAction && (
                            <EmptyContent>
                              <Button
                                onClick={handleAction}
                                className="bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 text-white font-medium shadow-sm"
                              >
                                {emptyState.actionLabel}
                              </Button>
                            </EmptyContent>
                          )}
                        </Empty>
                      );
                    }

                    // Fallback — preserves prior behavior.
                    return (
                      <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                        No results.
                      </div>
                    );
                  })()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}