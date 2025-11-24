
import { DataTable } from "../data-table/data-table";
import { getColumns } from "../data-table/columns";
import type { ExpenseProps } from "../../types/table-types";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DataTableRowActions } from "../data-table/data-table-row-actions";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

export default function AttributesPage() {
  const [data, setData] = useState<ExpenseProps[]>([
    {
      "id": 1,
      "label": "salary",
      "note": "monthly salary",
      "category": "income",
      "type": "income",
      "amount": 5000,
      "date": "2024-06-25"
    },
    {
      "id": 2,
      "label": "groceries",
      "note": "weekly grocery shopping",
      "category": "food",
      "type": "expense",
      "amount": 150,
      "date": "2024-06-24"
    },
    {
      "id": 3,
      "label": "electricity bill",
      "note": "monthly electricity bill",
      "category": "utilities",
      "type": "expense",
      "amount": 100,
      "date": "2024-06-23"
    },
    {
      "id": 4,
      "label": "freelance work",
      "note": "payment for freelance project",
      "category": "income",
      "type": "income",
      "amount": 800,
      "date": "2024-06-22"
    },
    {
      "id": 5,
      "label": "rent",
      "note": "monthly rent payment",
      "category": "housing",
      "type": "expense",
      "amount": 1200,
      "date": "2024-06-21"
    },
    {
      "id": 6,
      "label": "gym membership",
      "note": "monthly gym fee",
      "category": "health",
      "type": "expense",
      "amount": 50,
      "date": "2024-06-20"
    },
    {
      "id": 7,
      "label": "restaurant",
      "note": "dinner at a restaurant",
      "category": "food",
      "type": "expense",
      "amount": 75,
      "date": "2024-06-19"
    },
    {
      "id": 8,
      "label": "internet bill",
      "note": "monthly internet bill",
      "category": "utilities",
      "type": "expense",
      "amount": 60,
      "date": "2024-06-18"
    },
    {
      "id": 9,
      "label": "transport",
      "note": "public transport pass",
      "category": "transport",
      "type": "expense",
      "amount": 40,
      "date": "2024-06-17"
    },
    {
      "id": 10,
      "label": "office supplies",
      "note": "stationery items for office",
      "category": "work",
      "type": "expense",
      "amount": 30,
      "date": "2024-06-16"
    },
    {
      "id": 11,
      "label": "concert tickets",
      "note": "tickets for a concert",
      "category": "entertainment",
      "type": "expense",
      "amount": 100,
      "date": "2024-06-15"
    },
    {
      "id": 12,
      "label": "car maintenance",
      "note": "annual car servicing",
      "category": "transport",
      "type": "expense",
      "amount": 200,
      "date": "2024-06-14"
    },
    {
      "id": 13,
      "label": "book purchase",
      "note": "buying a new book",
      "category": "education",
      "type": "expense",
      "amount": 25,
      "date": "2024-06-13"
    },
    {
      "id": 14,
      "label": "movie night",
      "note": "tickets for a movie",
      "category": "entertainment",
      "type": "expense",
      "amount": 30,
      "date": "2024-06-12"
    },
    {
      "id": 15,
      "label": "gift",
      "note": "birthday gift for a friend",
      "category": "gifts",
      "type": "expense",
      "amount": 50,
      "date": "2024-06-11"
    }
  ]);

  const cols = getColumns<ExpenseProps>([
    {
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Label" />
      ),
      cell: ({ row }) => (
        <div className="w-[150px] capitalize">{row.getValue("label")}</div>
      ),
    },
    {
      accessorKey: "note",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Note" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium capitalize">
              {row.getValue("note")}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return row.getValue(id).toLowerCase().includes(value.toLowerCase());
      }
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex w-[100px] items-center">
            <span className="capitalize"> {row.getValue("category")}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type");
        return (
          <div className="flex w-[100px] items-center">
            {type === "income" ? (
              <TrendingUp size={20} className="mr-2 text-green-500" />
            ) : (
              <TrendingDown size={20} className="mr-2 text-red-500" />
            )}
            <span className="capitalize"> {row.getValue("type")}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type");
        return (
          <div className="flex w-[100px] items-center">
            <span
              className={cn(
                "capitalize",
                type === "income" ? "text-green-500" : "text-red-500",
              )}
            >
              {" "}
              {row.getValue("amount")}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        const formattedDate = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return (
          <div className="flex w-[100px] items-center">
            <span className="capitalize">{formattedDate}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const rowDate = new Date(row.getValue(id));
        const [startDate, endDate] = value;
        return rowDate >= startDate && rowDate <= endDate;
      },
    },
    {
      id: "actions",
      accessorKey: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} onDelete={() => setData(prev => prev.filter(item => item.id !== row.original.id))} onEdit={() => console.log("You just clicked the edit button")}/>,
    }
  ])

  const filterConfigs = [
    {
      columnKey: "type",
      title: "Type",
      options: [
        { label: "Income", value: "income" },
        { label: "Expense", value: "expense" }
      ]
    },
    {
      columnKey: "category",
      title: "Category",
      options: [
        { label: "Food", value: "food" },
        { label: "Transport", value: "transport" },
        { label: "Utilities", value: "utilities" },
        { label: "Entertainment", value: "entertainment" },
        { label: "Health", value: "health" },
        { label: "Housing", value: "housing" },
        { label: "Work", value: "work" },
        { label: "Education", value: "education" },
        { label: "Gifts", value: "gifts" }
      ]
    }
  ]
  return (
    <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
          <span>Monthly Expenses</span>
        </h2>
      </div>
      <DataTable data={data} columns={cols} filterColumnKey="note" facetedFilters={filterConfigs} />
    </div>
  );
}
