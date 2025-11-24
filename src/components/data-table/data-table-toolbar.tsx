import { Cross2Icon } from "@radix-ui/react-icons";
import type { DataTableToolbarProps } from "@/types/table-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";



export function DataTableToolbar<TData>({
  table,
  filterColumnKey = "",
  facetedFilters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {filterColumnKey && (
          <Input
            placeholder={`Filter by ${filterColumnKey} column...`}
            value={(table.getColumn(filterColumnKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn(filterColumnKey)?.setFilterValue(event.target.value);
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {facetedFilters.map((filter) =>
          table.getColumn(filter.columnKey) ? (
            <DataTableFacetedFilter
              key={filter.columnKey}
              column={table.getColumn(filter.columnKey)}
              title={filter.title}
              options={filter.options}
            />
          ) : null
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}