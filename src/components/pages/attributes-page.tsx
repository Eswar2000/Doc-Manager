
import { DataTable } from "../data-table/data-table";
import { getColumns } from "../data-table/columns";
import type { AttributeProps } from "../../types/index";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DataTableRowActions } from "../data-table/data-table-row-actions";
import { useState } from "react";
import type { DynamicField } from "../../types/index";
import DynamicDialog from "../dialog-box/dynamic-dialog";

export default function AttributesPage() {
  const [data, setData] = useState<AttributeProps[]>([
    {
      "id": 1,
      "name": "Candidate First Name",
      "description": "First name of the candidate",
      "type": "text",
      "createdAt": "2024-06-25T09:15:00",
      "updatedAt": "2024-06-25T09:15:00"
    },
    {
      id: 2,
      name: "Candidate Last Name",
      description: "Last name of the candidate",
      type: "text",
      createdAt: "2024-06-25T09:16:00",
      updatedAt: "2024-06-25T09:16:00"
    },
    {
      id: 3,
      name: "Job Title",
      description: "Title of the offered position",
      type: "text",
      createdAt: "2024-06-25T09:17:00",
      updatedAt: "2024-06-25T09:17:00"
    },
    {
      id: 4,
      name: "Start Date",
      description: "Employment start date",
      type: "date",
      createdAt: "2024-06-25T09:18:00",
      updatedAt: "2024-06-25T09:18:00"
    },
    {
      id: 5,
      name: "Salary",
      description: "Annual salary offered",
      type: "number",
      createdAt: "2024-06-25T09:19:00",
      updatedAt: "2024-06-25T09:19:00"
    },
    {
      id: 6,
      name: "Candidate Email Address",
      description: "Official email address for the candidate",
      type: "email",
      createdAt: "2024-06-25T09:20:00",
      updatedAt: "2024-06-25T09:20:00"
    },
    {
      id: 7,
      name: "Probation Period (months)",
      description: "Duration of probation in months",
      type: "number",
      createdAt: "2024-06-25T09:21:00",
      updatedAt: "2024-06-25T09:21:00"
    },
    {
      id: 8,
      name: "Notice Period (months)",
      description: "Notice period required for resignation",
      type: "number",
      createdAt: "2024-06-25T09:22:00",
      updatedAt: "2024-06-25T09:22:00"
    },
    {
      id: 9,
      name: "Manager Name",
      description: "Name of the reporting manager",
      type: "text",
      createdAt: "2024-06-25T09:23:00",
      updatedAt: "2024-06-25T09:23:00"
    },
    {
      id: 10,
      name: "Work Location",
      description: "Primary work location for the candidate",
      type: "text",
      createdAt: "2024-06-25T09:24:00",
      updatedAt: "2024-06-25T09:24:00"
    },
    {
      id: 11,
      name: "Relocation Bonus",
      description: "One-time bonus for relocation expenses",
      type: "number",
      createdAt: "2024-06-25T09:25:00",
      updatedAt: "2024-06-25T09:25:00"
    },
    {
      id: 12,
      name: "Candidate Address",
      description: "Residential address of the candidate",
      type: "text",
      createdAt: "2024-06-25T09:26:00",
      updatedAt: "2024-06-25T09:26:00"
    },
    {
      id: 13,
      name: "Company Name",
      description: "Legal name of the employing company",
      type: "text",
      createdAt: "2024-06-25T09:27:00",
      updatedAt: "2024-06-25T09:27:00"
    },
    {
      id: 14,
      name: "Company Address",
      description: "Registered address of the company",
      type: "text",
      createdAt: "2024-06-25T09:28:00",
      updatedAt: "2024-06-25T09:28:00"
    },
    {
      id: 15,
      name: "Reporting Manager Email Address",
      description: "Email address of the reporting manager",
      type: "email",
      createdAt: "2024-06-25T09:29:00",
      updatedAt: "2024-06-25T09:29:00"
    },
    {
      id: 16,
      name: "Contract End Date",
      description: "End date of the employment contract",
      type: "date",
      createdAt: "2024-06-25T09:30:00",
      updatedAt: "2024-06-25T09:30:00"
    },
    {
      id: 17,
      name: "Work Permit Number",
      description: "Official work permit or visa number",
      type: "text",
      createdAt: "2024-06-25T09:31:00",
      updatedAt: "2024-06-25T09:31:00"
    }
  ]);

  const cols = getColumns<AttributeProps>([
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="w-[150px] font-medium capitalize">{row.getValue("name")}</div>
      ),
      filterFn: (row, id, value) => {
        return row.getValue(id).toLowerCase().includes(value.toLowerCase());
      }
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate capitalize">
              {row.getValue("description")}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return row.getValue(id).toLowerCase().includes(value.toLowerCase());
      }
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex w-[100px] items-center">
            <span className="capitalize"> {row.getValue("type")}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        const formattedDate = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div className="flex w-[160px] items-center">
            <span className="capitalize">{formattedDate} {formattedTime}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt"));
        const formattedDate = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div className="flex w-[160px] items-center">
            <span className="capitalize">{formattedDate} {formattedTime}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      accessorKey: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} onDelete={() => setData(prev => prev.filter(item => item.id !== row.original.id))} onEdit={() => openEdit(row.original)} />,
    }
  ])

  const filterConfigs = [
    {
      columnKey: "type",
      title: "Type",
      options: [
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
        { label: "Date", value: "date" },
        { label: "Email", value: "email" },
      ]
    },
  ]

  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const editFormFields: DynamicField[] = [
    { name: "name", label: "Name", type: "text", disabled: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "type", label: "Type", type: "select", options: ["text", "number", "date", "email"], disabled: true },
  ]

  const createFormFields: DynamicField[] = [
    { name: "name", label: "Name", type: "text", required: true, maxLength: 16 },
    { name: "description", label: "Description", type: "textarea", maxLength: 64 },
    { name: "type", label: "Type", type: "select", options: ["text", "number", "date", "email"], required: true },
  ]

  const openEdit = (item: AttributeProps) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const createRow = (newItem: any) => {
    const newAttr: AttributeProps = {
      id: data.length + 1,
      name: newItem.name,
      description: newItem.description,
      type: newItem.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setData(prev => [...prev, newAttr]);
    setCreateDialogOpen(false);
  }

  const updateRow = (updated: any) => {
    setData(prev =>
      // Update the record's description and updated at timestamp. name and type are kept unchanged. created at is also kept unchanged - not shown for edit.
      prev.map(item =>
        item.id === editingItem.id
          ? {
            ...item,
            ...updated,
            updatedAt: new Date().toISOString(),
          }
          : item
      )
    );
    setDialogOpen(false);
  };

  return (
    <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
          <span>Manage Attributes</span>
        </h2>
      </div>
      <DataTable data={data} columns={cols} filterColumnKey="name" facetedFilters={filterConfigs} showCreateButton={true} onCreate={() => setCreateDialogOpen(true)} />

      {editingItem && (
        <DynamicDialog
          key={editingItem.id}
          open={dialogOpen}
          title="Edit Attribute"
          description="Modify the details of the attribute below."
          fields={editFormFields}
          initialValues={editingItem}
          submitButtonText="Update"
          onUpdate={updateRow}
          onCancel={() => setDialogOpen(false)}
        />
      )}

      {createDialogOpen && (
        <DynamicDialog
          key="create-attribute"
          open={createDialogOpen}
          title="Create Attribute"
          description="Enter details for the new attribute."
          fields={createFormFields}
          initialValues={{}}
          submitButtonText="Create"
          onUpdate={createRow}
          onCancel={() => setCreateDialogOpen(false)}
        />
      )}
    </div>
  );
}
