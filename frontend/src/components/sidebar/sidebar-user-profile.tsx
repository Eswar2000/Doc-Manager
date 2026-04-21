import { useState } from "react";
import { useCurrentUser } from "@/auth/use-current-user";
import { useTenantStore } from "@/stores/tenant-store";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function SidebarUserProfile({ expanded }: { expanded: boolean }) {
    const user = useCurrentUser();
    const { tenants, currentTenantId, setCurrentTenant } = useTenantStore();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    const currentTenant = tenants?.find(t => t.id === currentTenantId);

    const handleTenantChange = (tenantId: string) => {
        setCurrentTenant(tenantId);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className={`
                        cursor-pointer
                        flex items-center gap-3 px-3 py-3 rounded-2xl 
                        transition-all duration-200 bg-gray-50
                        hover:bg-gray-100
                        ${expanded ? "" : "justify-center"}
                    `}
                >
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 
                                    text-white font-semibold text-sm rounded-2xl 
                                    flex items-center justify-center shadow-sm flex-shrink-0 ring-1 ring-white">
                        {user.initials}
                    </div>

                    {expanded && (
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-[15px] leading-tight">
                                {user.name}
                            </p>
                            <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                                {currentTenant?.name || "No workspace"}
                            </p>
                        </div>
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-2">

                    {/* User Info */}
                    <div className="px-2 py-2">
                        <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {user.email}
                        </p>
                    </div>

                    <div className="border-t" />

                    {/* Tenants */}
                    <div className="space-y-1 max-h-30 overflow-y-auto pr-1">
                        {tenants?.map((tenant) => (
                            <button
                                key={tenant.id}
                                onClick={() => handleTenantChange(tenant.id)}
                                className={`
                                    w-full text-left px-2 py-2 rounded-md text-sm
                                    transition-colors font-medium
                                    ${tenant.id === currentTenantId
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "hover:bg-gray-100 text-gray-700"
                                    }
                                `}
                            >
                                {tenant.name}
                            </button>
                        ))}
                    </div>

                    <div className="border-t mt-2" />

                    {/* Optional actions */}
                    <button className="w-full rounded-md px-2 py-2 bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 text-white text-sm font-medium shadow-sm">
                        + Create Workspace
                    </button>

                </div>
            </PopoverContent>
        </Popover>
    );
}