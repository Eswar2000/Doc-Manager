import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "@/components/data-table/columns";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Loader } from '@/components/loader/loader';
import { ErrorState } from '@/components/error-state/error-state';
import { tenantApi } from '@/api/tenants';
import { useTenantStore } from '@/stores/tenant-store';
import { useQuery } from '@tanstack/react-query';
import { formatDateTime } from '@/lib/date';
import type { TenantMember } from '@/types';

export default function WorkspacePage() {
    const { currentTenantId } = useTenantStore();

    const { data: tenant, isLoading, error } = useQuery({
        queryKey: ['tenant', currentTenantId],
        queryFn: () => tenantApi.fetchTenantById(currentTenantId!),
        enabled: !!currentTenantId,

        staleTime: 1000 * 60 * 5, // 5 minutes - not frequently changing data
        gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for a while even if not used
        refetchOnWindowFocus: false, // Don't refetch when coming back to tab
    });

    const addNewMember = () => {
        console.log("Add new member clicked");
    }

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
            cell: ({ row }) => (
                <div className="w-[150px] font-medium">{row.getValue("roles")}</div>
            ),
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
                    <AccordionItem value="basic" className="border-none">
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
                                >
                                    Edit Workspace
                                </Button>
                            </div>

                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="members" className="border-none">
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
                                onCreate={() => addNewMember()}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    );
}