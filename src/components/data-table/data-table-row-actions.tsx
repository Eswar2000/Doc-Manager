import React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TableAction } from "@/types/index";

interface DataTableRowActionsProps<T> {
  row: { original: T };
  actions: TableAction<T>[];
}

export function DataTableRowActions<T>({ row, actions }: DataTableRowActionsProps<T>) {
  const visibleActions = actions.filter(action => {
    if (action.hidden === undefined) return true;
    return typeof action.hidden === "function" ? !action.hidden(row.original) : !action.hidden;
  });

  if (visibleActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {visibleActions.map((action, index) => (
          <React.Fragment key={index}>
            <DropdownMenuItem
              onClick={() => action.onClick(row.original)}
              disabled={typeof action.disabled === "function" ? action.disabled(row.original) : action.disabled}
              className={
                action.variant === "destructive"
                  ? "text-red-600 focus:text-red-600 focus:bg-red-50"
                  : ""
              }
              key={index}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.title}
            </DropdownMenuItem>
            {index < visibleActions.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}