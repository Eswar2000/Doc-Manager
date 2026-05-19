import { useState } from 'react';
import {
    useQuery,
    useQueryClient
} from '@tanstack/react-query';
import {
    Pencil,
    Trash2,
    Users
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "@/components/data-table/columns";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { Loader } from '@/components/loader';
import { ErrorState } from '@/components/error-state';
import { DynamicDialog } from '@/components/dynamic-dialog';
import { tenantApi } from '@/api/tenants';
import { useTenantStore } from '@/stores/tenant-store';
import { formatDateTime } from '@/lib/date';
import { toast } from 'sonner';
import type {
    DynamicField,
    TenantMember,
    AddMemberRequest,
    UpdateTenantRequest
} from '@/types';

export default function WorkspacePage() {
    const { currentTenantId, updateTenant } = useTenantStore();
    const queryClient = useQueryClient();

    const [isCreate, setIsCreate] = useState(false);
    const [memberDialog, setMemberDialog] = useState(false);
    const [basicInfoDialog, setBasicInfoDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);

    const { data: tenant, isLoading, error } = useQuery({
        queryKey: ['tenant', currentTenantId],
        queryFn: () => tenantApi.fetchTenantById(currentTenantId!),
        enabled: !!currentTenantId,

        staleTime: 1000 * 60 * 5, // 5 minutes - not frequently changing data
        gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for a while even if not used
        refetchOnWindowFocus: false, // Don't refetch when coming back to tab
    });

    const roleMeta: Record<string, { label: string; className: string }> = {
        admin: {
            label: "Admin",
            className: "bg-red-50 text-red-700 border-red-200",
        },
        can_create: {
            label: "Create",
            className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        },
        can_edit: {
            label: "Edit",
            className: "bg-green-50 text-green-700 border-green-200",
        },
        can_delete: {
            label: "Delete",
            className: "bg-rose-50 text-rose-700 border-rose-200",
        },
        can_view: {
            label: "View",
            className: "bg-purple-100 text-purple-700 border-purple-200",
        },
        can_use: {
            label: "Use",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
    };

    const onCreate = () => {
        setIsCreate(true);
        setMemberDialog(true);
    };

    const onUpdate = (member: TenantMember) => {
        setIsCreate(false);
        setSelectedMember(member);
        setMemberDialog(true);
    };

    const getDialogValues = () => {
        if (isCreate) {
            return { userId: "", roles: [] };
        }

        return {
            userId: selectedMember?.userId ?? "",
            roles: selectedMember?.roles ?? [],
        };
    };

    const updateTenantInfo = async (data: any) => {
        const tenantInfo: UpdateTenantRequest = {
            name: data.name,
            description: data.description
        };

        try {
            await tenantApi.updateTenant(currentTenantId!, tenantInfo);

            // update tenant store for inline sync with UI
            updateTenant(currentTenantId!, {
                name: tenantInfo.name,
                description: tenantInfo.description,
            });
            queryClient.invalidateQueries({ queryKey: ['tenant', currentTenantId] });

            toast.success("Successfully updated", {
                description: "The workspace basic info has been updated successfully.",
                duration: 2000,
                closeButton: false,
            });

            setBasicInfoDialog(false);
        } catch (error) {
            console.error("Failed to update basic info:", error);

            toast.error("Failed to update basic info", {
                description: "Something went wrong. Please check and try again.",
                duration: 3000,
                closeButton: false,
            });
        }
    }

    const addNewMember = async (member: any) => {
        const newMember: AddMemberRequest = {
            new_member: member.userId,
            roles: member.roles,
        };

        try {
            await tenantApi.addMember(currentTenantId!, newMember);
            queryClient.invalidateQueries({ queryKey: ['tenant', currentTenantId] });

            toast.success("Successfully added member", {
                description: "The member has been added successfully.",
                duration: 2000,
                closeButton: false,
            });

            setMemberDialog(false);
        } catch (error) {
            console.error("Failed to add member:", error);

            toast.error("Failed to add member", {
                description: "Something went wrong. Please check and try again.",
                duration: 3000,
                closeButton: false,
            });
        }
    };

    const updateMemberRole = async (member: any) => {
        try {
            await tenantApi.updateMemberRoles(currentTenantId!, member.userId, member.roles);
            queryClient.invalidateQueries({ queryKey: ['tenant', currentTenantId] });

            toast.success("Successfully updated member roles", {
                description: "The member's roles have been updated successfully.",
                duration: 2000,
                closeButton: false,
            });

            setMemberDialog(false);
        } catch (error) {
            console.error("Failed to update member roles:", error);

            toast.error("Failed to update member roles", {
                description: "Something went wrong. Please check and try again.",
                duration: 3000,
                closeButton: false,
            });
        }
    };

    const deleteMember = async (member: TenantMember) => {
        try {
            await tenantApi.removeMember(currentTenantId!, member.userId);
            queryClient.invalidateQueries({ queryKey: ['tenant', currentTenantId] });

            toast.success("Successfully removed member", {
                description: "The member has been removed successfully.",
                duration: 2000,
                closeButton: false,
            });

            setMemberDialog(false);
        } catch (error) {
            console.error("Failed to remove member:", error);

            toast.error("Failed to remove member", {
                description: "Something went wrong. Please check and try again.",
                duration: 3000,
                closeButton: false,
            });
        }
    }

    const addMemberDialogFields: DynamicField[] = [
        { name: "userId", label: "User Email", type: "text", required: true },
        { name: "roles", label: "Roles", type: "multiselect", required: true, options: ["admin", "can_create", "can_edit", "can_delete", "can_view", "can_use"] },
    ];

    const updateMemberRoleDialogFields: DynamicField[] = [
        { name: "userId", label: "User Email", type: "text", required: true, disabled: true },
        { name: "roles", label: "Roles", type: "multiselect", required: true, options: ["admin", "can_create", "can_edit", "can_delete", "can_view", "can_use"] },
    ];

    const updateBasicInfoDialogFields: DynamicField[] = [
        { name: "name", label: "Tenant Name", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: false }
    ];

    const cols = getColumns<TenantMember>([
        {
            accessorKey: "userId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="User" />
            ),
            cell: ({ row }) => (
                <div className="w-[150px] font-medium">{row.getValue("userId")}</div>
            ),
            filterFn: (row, id, value) => {
                return row.getValue(id).toLowerCase().includes(value.toLowerCase());
            }
        },
        {
            accessorKey: "roles",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Roles" />
            ),
            cell: ({ row }) => {
                const roles = (row.getValue("roles") as string[]) || [];

                const visibleRoles = roles.slice(0, 3);
                const remaining = roles.length - 3;

                return (
                    <div className="flex flex-wrap items-center gap-2 min-w-[220px]">
                        {visibleRoles.map((role) => {
                            const meta = roleMeta[role] || {
                                label: role,
                                className: "bg-indigo-50 text-indigo-700 border-indigo-200",
                            };

                            return (
                                <Badge
                                    key={role}
                                    variant="outline"
                                    className={`text-xs font-medium ${meta.className}`}
                                >
                                    {meta.label}
                                </Badge>
                            );
                        })}
                        {remaining > 0 && (
                            <span
                                className="text-xs text-gray-500 cursor-default"
                                title={roles.map(r => roleMeta[r]?.label || r).join(", ")}
                            >
                                +{remaining} more
                            </span>
                        )}
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
                            onClick: () => onUpdate(row.original),
                        },
                        {
                            title: "Delete",
                            icon: <Trash2 className="h-4 w-4 text-destructive" />,
                            variant: "destructive",
                            onClick: async () => deleteMember(row.original),
                        }
                    ]
                } />,
        }

    ]);


    return (
        <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
                    <span>Workspace Settings</span>
                </h2>
            </div>
            {isLoading && <Loader screenHeader="Loading your workspace" screenMessage="Please wait till we fetch your workspace details" />}
            {error && <ErrorState title="Failed to load workspace" description="We couldn't fetch your workspace details. Please try again later." />}
            {tenant && (
                <Accordion
                    type="single"
                    collapsible
                    defaultValue="basic"
                    className="w-full border border-gray-200 rounded-lg divide-y"
                >
                    <AccordionItem value="basic" className="border-b last:border-b-0">
                        <AccordionTrigger
                            className="px-6 py-5 hover:no-underline hover:bg-gray-50 transition-colors">
                            <div className="flex w-full items-center justify-between">
                                <div className="text-left">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Basic Information
                                    </h3>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 py-6 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-sm">

                                {/* Name */}
                                <div>
                                    <p className="text-base text-gray-600 font-medium">Name</p>
                                    <p className="mt-1 text-gray-900">
                                        {tenant?.name}
                                    </p>
                                </div>

                                {/* Active */}
                                <div>
                                    <p className="text-base text-gray-600 font-medium">Status</p>
                                    <p className="mt-1">
                                        <span
                                            className={`px-2 py-1 rounded-md text-xs font-medium ${tenant?.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {tenant?.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </p>
                                </div>

                                {/* Description */}
                                {tenant?.description && (
                                    <div className="md:col-span-2">
                                        <p className="text-base text-gray-600 font-medium">Description</p>
                                        <p className="mt-1 text-gray-900">
                                            {tenant.description}
                                        </p>
                                    </div>
                                )}

                                {/* Created */}
                                <div>
                                    <p className="text-base text-gray-600 font-medium">Created At</p>
                                    <p className="mt-1 text-gray-900">
                                        {formatDateTime(tenant?.createdAt)}
                                    </p>
                                </div>

                                {/* Updated */}
                                <div>
                                    <p className="text-base text-gray-600 font-medium">Last Updated</p>
                                    <p className="mt-1 text-gray-900">
                                        {formatDateTime(tenant?.modifiedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-start">
                                <Button
                                    className="
                                    bg-indigo-600 hover:bg-indigo-700
                                    focus-visible:ring-indigo-500
                                    text-white font-medium shadow-sm
                                    px-5 py-2
                                    "
                                    onClick={() => setBasicInfoDialog(true)}
                                >
                                    Edit Tenant Information
                                </Button>
                            </div>

                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="members" className="border-b last:border-b-0">
                        <AccordionTrigger
                            className="px-6 py-5 hover:no-underline hover:bg-gray-50 transition-colors">
                            <div className="flex w-full items-center justify-between">
                                <div className="text-left">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Members
                                    </h3>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 py-6 border-t">
                            <DataTable
                                columns={cols}
                                data={tenant.members}
                                filterColumnKey="userId"
                                showCreateButton={true}
                                onCreate={() => onCreate()}
                                emptyState={{
                                    icon: <Users className="h-6 w-6" />,
                                    title: "No members yet",
                                    description: "Invite teammates to this workspace and assign roles to control what they can do.",
                                    actionLabel: "Add your first member",
                                }}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
            <DynamicDialog
                open={memberDialog}
                title={isCreate ? "Add New Member" : "Update Member Roles"}
                description={isCreate
                    ? "Invite a new member to this workspace and assign roles."
                    : "Update the roles of the member in your workspace."
                }
                fields={isCreate ? addMemberDialogFields : updateMemberRoleDialogFields}
                initialValues={getDialogValues()}
                submitButtonText={isCreate ? "Add" : "Update"}
                onUpdate={isCreate ? addNewMember : updateMemberRole}
                onCancel={() => {
                    setMemberDialog(false);
                    setSelectedMember(null);
                }}
            />
            <DynamicDialog
                open={basicInfoDialog}
                title="Edit Tenant Information"
                description="Update the basic information for your tenant."
                fields={updateBasicInfoDialogFields}
                initialValues={{
                    name: tenant?.name || "",
                    description: tenant?.description || "",
                }}
                submitButtonText="Update"
                onUpdate={updateTenantInfo}
                onCancel={() => {
                    setBasicInfoDialog(false);
                }}
            />
        </div>
    );
}