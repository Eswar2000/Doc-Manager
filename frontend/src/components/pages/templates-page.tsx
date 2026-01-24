import { DataTable } from "../data-table/data-table";
import { getColumns } from "../data-table/columns";
import type { TemplateProps, TableAction } from "../../types/index";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DataTableRowActions } from "../data-table/data-table-row-actions";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Pencil, Eye } from "lucide-react";
import type { EditorInitialData } from "../../types/index";
import { templateApi } from "@/api/templates";
import { Loader } from "../loader/loader";
import { ErrorState } from "../error-state/error-state";

export default function TemplatesPage() {
    const navigate = useNavigate();

    const {
        data: templates = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['templates'], // unique cache key
        queryFn: templateApi.fetchTemplates,
        staleTime: 1000 * 60, // 1 minute stale time

        // Disable automatic refetching on failures
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
    });

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
            accessorKey: "state",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="State" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex w-[100px] items-center">
                        <span className="capitalize"> {row.getValue("state")}</span>
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
            id: "actions",
            accessorKey: "actions",
            cell: ({ row }) => {
                const templateRowActions: TableAction<TemplateProps>[] = [
                    {
                        title: "View Details",
                        icon: <Eye className="h-4 w-4" />,
                        variant: "secondary",
                        onClick: () => { console.log("viewing details of template: " + row.original.name) }
                    },
                    {
                        title: "Delete",
                        icon: <Trash2 className="h-4 w-4" />,
                        variant: "destructive",
                        onClick: () => { console.log("Deleting template: " + row.original.name) }
                    }
                ];

                if (row.original.state === "active") {
                    templateRowActions.unshift({
                        title: "Edit",
                        icon: <Pencil className="h-4 w-4" />,
                        variant: "secondary",
                        onClick: () => {
                            const original = row.original;
                            const attributesConfig = (original.attributes || []).reduce((acc: any, attr: any) => {
                                acc[attr.attributeId] = {
                                    required: attr.required,
                                    hidden: attr.hidden,
                                    defaultValue: attr.defaultValue,
                                };
                                return acc;
                            }, {} as Record<string, { required: boolean; hidden: boolean; defaultValue: string | null }>);

                            const initialData: EditorInitialData = {
                                id: original.id,
                                name: original.name,
                                description: original.description,
                                htmlContent: original.htmlContent,
                                jsonContent: original.jsonContent,
                                attributesConfig,
                            };
                            navigate('/editor', { state: { initialData, mode: 'template' } })
                        },
                    });
                }

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

    const createNewTemplate = () => {
        navigate('/editor', { state: { mode: 'template' } })
    }

    return (
        <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
                    <span>Manage Templates</span>
                </h2>
            </div>
            {!isLoading && !isError && <DataTable data={templates} columns={cols} filterColumnKey="name" facetedFilters={filterConfigs} showCreateButton={true} onCreate={() => createNewTemplate()} />}
            {isLoading && <Loader screenHeader="Loading your templates" screenMessage="Please wait till we fetch your templates" />}
            {isError && <ErrorState title="Failed to load templates" description={error?.message || "We couldn't load the templates right now."} onRetry={() => refetch()} onHome={() => {navigate('/attributes')}}/>}
        </div>
    );
}