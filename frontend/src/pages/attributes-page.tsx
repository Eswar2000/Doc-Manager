import { useState } from "react";
import {
  Pencil,
  Trash2
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "@/components/data-table/columns";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { DynamicDialog } from "@/components/dynamic-dialog";
import { Loader } from "@/components/loader";
import { ErrorState } from "@/components/error-state";
import { toast } from "sonner";
import { attributeApi } from "@/api/attributes";
import { formatDateTime } from "@/lib/date";
import type {
  AttributeProps,
  DynamicField
} from "@/types";

export default function AttributesPage() {
  const queryClient = useQueryClient();

  const {
    data: data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['attributes'], // unique cache key
    queryFn: attributeApi.fetchAttributes,
    staleTime: 1000 * 60, // 1 minute stale time

    // Disable automatic refetching on failures
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  const cols = getColumns<AttributeProps>([
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="w-[150px] font-medium">{row.getValue("name")}</div>
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
            <span className="max-w-[500px] truncate">
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
        return (
          <div className="flex w-[160px] items-center">
            <span>{formatDateTime(row.getValue("createdAt"))}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "modifiedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Modified At" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex w-[160px] items-center">
            <span>{formatDateTime(row.getValue("modifiedAt"))}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      accessorKey: "actions",
      cell: ({ row }) => <DataTableRowActions row={row}
        actions={
          [
            {
              title: "Edit",
              icon: <Pencil className="h-4 w-4 text-indigo-500" />,
              variant: "secondary",
              onClick: () => openEdit(row.original),
            },
            {
              title: "Delete",
              icon: <Trash2 className="h-4 w-4 text-destructive" />,
              variant: "destructive",
              onClick: async () => deleteRow(row.original),
            }
          ]
        } />,
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
    { name: "name", label: "Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "type", label: "Type", type: "select", options: ["text", "number", "date", "email"], disabled: true },
    { name: "tenantId", label: "Tenant ID", type: "text" }
  ]

  const createFormFields: DynamicField[] = [
    { name: "name", label: "Name", type: "text", required: true, maxLength: 16 },
    { name: "description", label: "Description", type: "textarea", maxLength: 64 },
    { name: "type", label: "Type", type: "select", options: ["text", "number", "date", "email"], required: true },
    { name: "tenantId", label: "Tenant ID", type: "text", required: false }
  ]

  const openEdit = (item: AttributeProps) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const createRow = async (newItem: any) => {
    const newAttr = {
      name: newItem.name,
      description: newItem.description,
      type: newItem.type
    };
    try {
      await attributeApi.createAttribute(newAttr);
      queryClient.invalidateQueries({ queryKey: ['attributes'] });

      toast.success("Successfully created", {
        description: "The attribute has been created successfully.",
        duration: 2000,
        closeButton: false,
      });

      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create attribute:", error);

      toast.error("Failed to create attribute", {
        description: error instanceof Error
          ? error.message
          : "Something went wrong. Please check and try again.",
        duration: 3000,
        closeButton: false,
      });
    }
  }

  const updateRow = async (updated: any) => {
    const updatedAttr = {
      name: updated.name,
      description: updated.description,
      tenantId: updated.tenantId
    };

    try {
      await attributeApi.updateAttribute(editingItem.id, updatedAttr);
      queryClient.invalidateQueries({ queryKey: ['attributes'] });

      toast.success("Successfully updated", {
        description: "The attribute has been updated successfully.",
        duration: 2000,
        closeButton: false,
      });

      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to update attribute:", error);

      toast.error("Failed to update attribute", {
        description: error instanceof Error
          ? error.message
          : "Something went wrong. Please check and try again.",
        duration: 3000,
        closeButton: false,
      });
    }
  };

  const deleteRow = async (deleted: any) => {
    try {
      await attributeApi.deleteAttribute(deleted.id);
      queryClient.invalidateQueries({ queryKey: ['attributes'] });

      toast.success("Successfully deleted", {
        description: "The attribute has been deleted successfully.",
        duration: 2000,
        closeButton: false,
      });
    } catch (error) {
      console.error("Failed to delete attribute:", error);

      toast.error("Failed to delete attribute", {
        description: error instanceof Error
          ? error.message
          : "Something went wrong. Please check and try again.",
        duration: 3000,
        closeButton: false,
      });
    }
  };

  return (
    <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
          <span>Manage Attributes</span>
        </h2>
      </div>
      {!isLoading && !isError && <DataTable data={data} columns={cols} filterColumnKey="name" facetedFilters={filterConfigs} showCreateButton={true} onCreate={() => setCreateDialogOpen(true)} />}
      {isLoading && <Loader screenHeader="Loading your attributes" screenMessage="Please wait till we fetch your attributes" />}
      {isError && <ErrorState title="Failed to load attributes" description={error?.message || "We couldn't load the attributes right now."} onRetry={() => refetch()} />}

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
