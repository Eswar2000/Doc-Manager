import { useCurrentUser } from "@/auth/use-current-user";

export default function SidebarUserProfile({ expanded }: { expanded: boolean }) {
    const user = useCurrentUser();

    if (!user) {
        return null;
    }

    return (
        <div className={`
            flex items-center gap-3 px-3 py-3 rounded-2xl 
            transition-all duration-200 bg-gray-50
            ${expanded ? "" : "justify-center hover:bg-gray-100"}
        `}>
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
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user.email}
                    </p>
                </div>
            )}
        </div>
    );
}