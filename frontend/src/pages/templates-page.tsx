import { useTenantStore } from "@/stores/tenant-store";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "@/components/data-table/columns";
import type { TemplateProps, TableAction, EditorInitialData } from "@/types/index";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Pencil, Eye, FileStack } from "lucide-react";
import { templateApi } from "@/api/templates";
import { Loader } from "@/components/loader";
import { OverlayLoader } from "@/components/overlay-loader";
import { ErrorState } from "@/components/error-state";
import type { ColumnFiltersState } from "@tanstack/table-core";
import { formatDateTime } from "@/lib/date";
import { toast } from "sonner";

export default function TemplatesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { currentTenantId } = useTenantStore();
    const [loading, setLoading] = useState(false);

    const {
        data: templates = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['templates', currentTenantId], // unique cache key
        queryFn: templateApi.fetchTemplates,
        staleTime: 1000 * 60, // 1 minute stale time
        enabled: !!currentTenantId, // only run if tenant ID is available

        // Disable automatic refetching on failures
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
    });

    const handleViewDetails = (template: TemplateProps) => {
        console.log("viewing details of template: " + template.name);
    }

    const handleEdit = (template: TemplateProps) => {
        const attributesConfig = (template.attributes || []).reduce((acc: any, attr: any) => {
            acc[attr.attributeId] = {
                required: attr.required,
                hidden: attr.hidden,
                defaultValue: attr.defaultValue,
            };
            return acc;
        }, {} as Record<string, { required: boolean; hidden: boolean; defaultValue: string | null }>);

        const initialData: EditorInitialData = {
            id: template.id,
            name: template.name,
            description: template.description,
            htmlContent: template.htmlContent,
            jsonContent: template.jsonContent,
            attributesConfig,
        };

        navigate('/editor', { state: { initialData, mode: 'template' } });
    }

    const handleUse = (template: TemplateProps) => {
        navigate(`/templates/${template.id}/generate`, {
            state: { templateId: template.id }
        });
    };

    const handleDelete = async (template: TemplateProps) => {
        if (!template.id) return;

        try {
            setLoading(true);
            await templateApi.deleteTemplate(template.id);
            await queryClient.invalidateQueries({ queryKey: ['templates', currentTenantId] });

            toast.success("Successfully deleted", {
                description: `"${template.name}" has been deleted.`,
                duration: 2000,
                closeButton: false,
            });
        } catch (err: any) {
            toast.error("Failed to delete", {
                description: err?.message || "Something went wrong. Please try again.",
                duration: 3000,
                closeButton: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const cols = getColumns<TemplateProps>([
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
            accessorKey: "state",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="State" />
            ),
            cell: ({ row }) => {
                const state = row.getValue("state") as string;
                const isActive = state.toLowerCase() === "active";

                return (
                    <div className="flex w-[110px] items-center">
                        <span
                            className={`
                        inline-flex items-center px-3.5 py-1 text-xs font-medium rounded-full border
                        ${isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                    : "bg-rose-50 text-rose-700 border-rose-300"
                                }
                    `}
                        >
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                        </span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "version",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Version" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex w-[100px] items-center">
                        <span className="capitalize"> {row.getValue("version")}</span>
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
            id: "actions",
            accessorKey: "actions",
            cell: ({ row }) => {
                const template = row.original;

                const templateBaseActions: TableAction<TemplateProps>[] = [
                    {
                        title: "View Details",
                        icon: <Eye className="h-4 w-4 text-indigo-500" />,
                        variant: "secondary",
                        onClick: () => handleViewDetails(template),
                    }
                ];

                const activeTemplateActions: TableAction<TemplateProps>[] = [
                    {
                        title: "Edit",
                        icon: <Pencil className="h-4 w-4 text-indigo-500" />,
                        variant: "secondary",
                        onClick: () => handleEdit(template),
                    },
                    {
                        title: "Use",
                        icon: <FileStack className="h-4 w-4 text-indigo-500" />,
                        variant: "secondary",
                        onClick: () => handleUse(template),
                    },
                    {
                        title: "Delete",
                        icon: <Trash2 className="h-4 w-4 text-destructive" />,
                        variant: "destructive",
                        onClick: () => handleDelete(template),
                    }
                ];

                const isActive = row.original.state === "active";
                const templateRowActions: TableAction<TemplateProps>[] = isActive ? [...templateBaseActions, ...activeTemplateActions] : templateBaseActions;

                return <DataTableRowActions row={row} actions={templateRowActions} />
            }

        }
    ])

    const filterConfigs = [
        {
            columnKey: "state",
            title: "State",
            options: [
                { label: "Active", value: "active" },
                { label: "Archived", value: "archived" },
            ]
        },
    ]

    // Controlled column filter to show only active templates on initial load
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
        {
            id: "state",
            value: ["active"],
        },
    ]);

    const createNewTemplate = () => {
        navigate('/editor', { state: { mode: 'template' } })
    }

    if (!currentTenantId) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader
                    screenHeader="Loading workspace"
                    screenMessage="Please wait till we set your workspace details"
                />
            </div>
        );
    }

    return (
        <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
                    <span>Manage Templates</span>
                </h2>
            </div>
            <OverlayLoader show={loading} message="Please wait..." />
            {!isLoading && !isError && !loading && (
                <DataTable
                    data={templates}
                    columns={cols}
                    filterColumnKey="name"
                    facetedFilters={filterConfigs}
                    showCreateButton={true}
                    onCreate={() => createNewTemplate()}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                />
            )}
            {isLoading && <Loader screenHeader="Loading your templates" screenMessage="Please wait till we fetch your templates" />}
            {isError && <ErrorState title="Failed to load templates" description={error?.message || "We couldn't load the templates right now."} />}
        </div>
    );
}